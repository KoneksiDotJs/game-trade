import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";
import { Game, ListingImage, ListingStatus, ServiceType } from "@prisma/client";
import cloudinary from "../config/cloudinary";

export const createListing: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json(sendError("User ID is required"));
      return;
    }

    if (!userId) {
      res.status(400).json(sendError("User ID is required"));
      return;
    }
    const {
      title,
      description,
      price,
      gameId,
      serviceTypeId,
      quantity,
      currency = "USD",
    } = req.body;
    const files = req.files as Express.Multer.File[];

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency,
        quantity: parseInt(quantity) || 1,
        gameId: parseInt(gameId),
        serviceTypeId: parseInt(serviceTypeId),
        userId,
        status: "ACTIVE",
      },
    });

    // uplaod and create images
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "listings",
        })
      );
      const uploadResult = await Promise.all(uploadPromises);

      await prisma.listingImage.createMany({
        data: uploadResult.map((result) => ({
          listingId: listing.id,
          imageUrl: result.secure_url,
          imageId: result.public_id,
        })),
      });
    }

    // get complete listing with relations
    const completeListingWithImages = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: {
        game: true,
        serviceType: true,
        images: true,
        user: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          },
        },
      },
    });

    res.status(201).json(sendSuccess(completeListingWithImages));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const getListings: RequestHandler = async (req, res): Promise<void> => {
  try {
    const {
      gameId,
      serviceTypeId,
      status = "ACTIVE",
      maxPrice,
      minPrice,
      sort = "newest",
    } = req.query;

    const where: any = { status };
    if (gameId) where.gameId = parseInt(gameId as string);
    if (serviceTypeId) where.serviceTypeId = parseInt(serviceTypeId as string);
    if (minPrice) where.price = { gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { lte: parseFloat(maxPrice as string) };

    const orderBy: any = {};
    switch (sort) {
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        game: true,
        serviceType: true,
        images: true,
        user: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          },
        },
      },
    });

    if (!listings) {
      throw new Error("Listing not found");
    }

    res.status(200).json(sendSuccess(listings));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getListingById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        game: true,
        serviceType: true,
        images: true,
        user: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          },
        },
      },
    });

    if (!listing) throw new Error("Listing not found");

    res.status(200).json(sendSuccess(listing));
  } catch (error) {
    res.status(404).json(sendError((error as Error).message));
  }
};

export const updateListing: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, description, price, status, quantity } = req.body;
    const files = req.files as Express.Multer.File[];

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });

    if (!listing) throw new Error("Listing not found");
    if (listing.userId !== userId) throw new Error("Unauthorized");
    if (listing.status === "SOLD")
      throw new Error("Cannot update sold listing");

    // handle new images
    if (files && files.length > 0) {
      // delete old images from cloudinary
      const deletePromises = listing.images.map((image) =>
        cloudinary.uploader.destroy(image.imageId)
      );
      await Promise.all(deletePromises);

      // delete old images from database
      await prisma.listingImage.deleteMany({
        where: { listingId: listing.id },
      });

      // upload new images
      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "listings",
        })
      );

      const uploadResults = await Promise.all(uploadPromises);

      //create new images records
      await prisma.listingImage.createMany({
        data: uploadResults.map((result) => ({
          listingId: listing.id,
          imageUrl: result.secure_url,
          imageId: result.public_id,
        })),
      });
    }

    const updateListing = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        status: status as ListingStatus,
        quantity: quantity ? parseInt(quantity) : undefined,
      },
      include: {
        game: true,
        serviceType: true,
        images: true,
      },
    });

    res.status(200).json(sendSuccess(updateListing));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const deleteListing: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!listing) throw new Error("Listing not found");

    // admin deletion with reason
    if (userRole === "ADMIN" || userRole === "MODERATOR") {
      if (!reason) throw new Error("Reason is required for admin deletion");
      if (!userId) throw new Error("User ID is required");

      await prisma.moderationLog.create({
        data: {
          moderatorId: userId,
          listingId: parseInt(id),
          action: "DELETED",
          reason,
        },
      });

      await prisma.listing.delete({
        where: { id: parseInt(id) },
      });

      res
        .status(200)
        .json(sendSuccess({ message: "Listing deleted by admin" }));
    }
    if (listing.userId !== userId) throw new Error("Unauthorized");
    if (listing.status === "SOLD")
      throw new Error("Cannot delete sold listing");

    await prisma.listing.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json(sendSuccess({ message: "Listing deleted successfully" }));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const getListingStats: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { start, end, period = "daily" } = req.query;
    const startDate = start
      ? new Date(start as string)
      : new Date(new Date().setDate(new Date().getDate() - 7));
    const endDate = end ? new Date(end as string) : new Date();

    // Generate date points based on period
    const datePoints = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      datePoints.push(new Date(currentDate));
      if (period === "yearly") {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      } else if (period === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Fetch all stats in parallel
    const [periodStats, statusStats, priceStats, gameStats] = await Promise.all(
      [
        // Daily new listings count
        Promise.all(
          datePoints.map(async (date) => {
            const nextDate = new Date(date);
            if (period === "yearly")
              nextDate.setFullYear(date.getFullYear() + 1);
            else if (period === "monthly")
              nextDate.setMonth(date.getMonth() + 1);
            else nextDate.setDate(date.getDate() + 1);

            const [count, revenue] = await Promise.all([
              prisma.listing.count({
                where: {
                  createdAt: {
                    gte: date,
                    lt: nextDate,
                  },
                },
              }),
              prisma.listing.aggregate({
                where: {
                  createdAt: {
                    gte: date,
                    lt: nextDate,
                  },
                },
                _sum: {
                  price: true,
                },
              }),
            ]);

            return {
              date:
                period === "yearly"
                  ? date.getFullYear().toString()
                  : period === "monthly"
                  ? date.toLocaleDateString("default", {
                      month: "short",
                      year: "numeric",
                    })
                  : date.toLocaleDateString(),
              newListings: count,
              revenue: revenue._sum.price || 0,
            };
          })
        ),

        // Status distribution
        prisma.listing.groupBy({
          by: ["status"],
          _count: {
            _all: true,
          },
          _avg: {
            price: true,
          },
        }),

        // Price statistics by category
        prisma.listing.groupBy({
          by: ["gameId"],
          _count: true,
          _avg: {
            price: true,
          },
          _min: {
            price: true,
          },
          _max: {
            price: true,
          },
          where: {
            status: "ACTIVE",
          },
        }),

        // Most listed games
        prisma.game.findMany({
          take: 5,
          include: {
            _count: {
              select: { listings: true },
            },
            category: true,
          },
          orderBy: {
            listings: {
              _count: "desc",
            },
          },
        }),
      ]
    );

    // Calculate period comparison
    const previousPeriodStart = new Date(startDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodLength);

    const previousPeriodCount = await prisma.listing.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    });

    const currentPeriodCount = periodStats.reduce(
      (sum, stat) => sum + stat.newListings,
      0
    );
    const percentageChange =
      previousPeriodCount === 0
        ? 100
        : ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) *
          100;

    res.status(200).json(
      sendSuccess({
        period: {
          stats: periodStats,
          comparison: {
            current: currentPeriodCount,
            previous: previousPeriodCount,
            percentage: Math.round(percentageChange * 100) / 100,
            trend:
              percentageChange > 0
                ? "up"
                : percentageChange < 0
                ? "down"
                : "stable",
          },
        },
        statusDistribution: statusStats.map((stat) => ({
          status: stat.status,
          count: stat._count,
          averagePrice: stat._avg.price || 0,
        })),
        priceStatistics: priceStats.map((stat) => ({
          gameId: stat.gameId,
          listingCount: stat._count,
          averagePrice: stat._avg.price || 0,
          minPrice: stat._min.price || 0,
          maxPrice: stat._max.price || 0,
        })),
        popularGames: gameStats.map((game) => ({
          id: game.id,
          title: game.title,
          category: game.category.name,
          listingCount: game._count.listings,
        })),
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};
