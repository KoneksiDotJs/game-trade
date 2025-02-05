import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";
import cloudinary from "../config/cloudinary";
import bcrypt from "bcryptjs";
import { ListingStatus, Prisma, Role, UserStatus } from "@prisma/client";

export const getProfile: RequestHandler = async (req, res): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        reputationScore: true,
        createdAt: true,
      },
    });

    res.status(200).json(sendSuccess(user));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const updateProfile: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const avatar = req.file;
    const { username } = req.body;

    let imageData = {};

    if (avatar) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.avatarId) {
        await cloudinary.uploader.destroy(user.avatarId);
      }

      const result = await cloudinary.uploader.upload(avatar.path, {
        folder: "avatars",
      });

      imageData = {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        ...imageData,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        reputationScore: true,
      },
    });

    res.status(200).json(sendSuccess(updatedUser));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getUserListings: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { userId } = req.params;

    const listings = await prisma.listing.findMany({
      where: { userId },
      include: {
        game: true,
        serviceType: true,
        images: true,
      },
    });
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getUserStats: RequestHandler = async (req, res): Promise<void> => {
  try {
    const userId = req.user?.id;

    const stats = await prisma.$transaction([
      // total listings
      prisma.listing.count({
        where: { userId },
      }),
      // active listings
      prisma.listing.count({
        where: { userId, status: "ACTIVE" },
      }),
      // completed sales
      prisma.transaction.count({
        where: { sellerId: userId, status: "COMPLETED" },
      }),
      // avg rating
      prisma.review.aggregate({
        where: { sellerId: userId },
        _avg: { rating: true },
      }),
    ]);

    res.status(200).json(
      sendSuccess({
        totalListings: stats[0],
        activeListings: stats[1],
        completedSales: stats[2],
        avgRating: stats[3]._avg.rating,
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getAllUsers: RequestHandler = async (req, res): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        isVerified: true,
        role: true,
        reputationScore: true,
        createdAt: true,
        status: true
      },
    });

    res.status(200).json(sendSuccess(users));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const changePassword: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    // validate current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      res.status(400).json(sendError("Invalid current password"));
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    res
      .status(200)
      .json(sendSuccess({ message: "Password changed successfully" }));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getUserById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        avatarId: true,
        isVerified: true,
        role: true,
        reputationScore: true,
        createdAt: true,
        status: true,
        listings: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            createdAt: true,
            game: {
              select: {
                title: true,
              },
            },
          },
        },
        sellTransactions: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            buyer: {
              select: {
                username: true,
              },
            },
          },
          where: {
            status: "COMPLETED",
          },
        },
        sellerReviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            buyer: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json(sendError("User not found"));
      return;
    }

    const stats = {
      totalListings: user.listings.length,
      activeListings: user.listings.filter((l) => l.status === "ACTIVE").length,
      completedSales: user.sellTransactions.length,
      avgRating:
        user.sellerReviews.reduce((acc, rev) => acc + rev.rating, 0) /
          user.sellerReviews.length || 0,
    };

    res.status(200).json(
      sendSuccess({
        ...user,
        stats,
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const updateUserStatus: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user?.id;

    // Validate status
    const validStatus = Object.values(UserStatus).includes(
      status as UserStatus
    );
    if (!validStatus) {
      res.status(400).json(sendError("Invalid status value"));
      return;
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!targetUser) {
      res.status(404).json(sendError("User not found"));
      return;
    }

    if (targetUser.role === Role.ADMIN) {
      res.status(403).json(sendError("Cannot modify admin status"));
      return;
    }

    const result = await prisma.$transaction([
      // Update user status
      prisma.user.update({
        where: { id },
        data: {
          status: status as UserStatus,
          banReason: status === UserStatus.BANNED ? reason : null,
          bannedAt: status === UserStatus.BANNED ? new Date() : null,
          bannedById: status === UserStatus.BANNED ? adminId : null,
        },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          banReason: true,
          bannedAt: true,
          bannedBy: {
            select: {
              username: true,
            },
          },
        },
      }),
      // Update listings based on user status
      status === UserStatus.ACTIVE
        ? prisma.listing.updateMany({
            where: {
              userId: id,
              status: ListingStatus.INACTIVE,
            },
            data: {
              status: ListingStatus.ACTIVE,
            },
          })
        : status === UserStatus.BANNED
        ? prisma.listing.updateMany({
            where: {
              userId: id,
              status: ListingStatus.ACTIVE,
            },
            data: {
              status: ListingStatus.INACTIVE,
            },
          })
        : prisma.listing.updateMany({ where: { id: -1 }, data: {} }), // No-op for other statuses
    ]);

    res.status(200).json(sendSuccess(result[0]));
  } catch (error) {
    // console.error("Error updating user status:", error);
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getUserRegisterStats: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { start, end, period = "daily" } = req.query;
    const startDate = start ? new Date(start as string) : new Date(new Date().setDate(new Date().getDate() - 7));
    const endDate = end ? new Date(end as string) : new Date();

    // Generate date points
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

    // Get stats for each period
    const periodStats = await Promise.all(
      datePoints.map(async (date) => {
        const nextDate = new Date(date);
        if (period === "yearly") nextDate.setFullYear(date.getFullYear() + 1);
        else if (period === "monthly") nextDate.setMonth(date.getMonth() + 1);
        else nextDate.setDate(date.getDate() + 1);

        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        });

        return {
          date: period === "yearly" 
            ? date.getFullYear().toString()
            : period === "monthly"
            ? date.toLocaleDateString("default", { month: "short", year: "numeric" })
            : date.toLocaleDateString(),
          newUsers: count,
        };
      })
    );

    // Calculate period comparison
    const previousPeriodStart = new Date(startDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodLength);

    const [previousPeriodCount, currentPeriodCount] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
    ]);

    const percentageChange = previousPeriodCount === 0 ? 100 :
      ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;

    res.status(200).json(
      sendSuccess({
        period: {
          stats: periodStats,
          comparison: {
            current: currentPeriodCount,
            previous: previousPeriodCount,
            percentage: Math.round(percentageChange * 100) / 100,
            trend: percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "stable",
          },
        },
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};