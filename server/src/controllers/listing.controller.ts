import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";
import { ListingStatus } from "@prisma/client";
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
    const userId = req.user?.id;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!listing) throw new Error("Listing not found");
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
