import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";
import cloudinary from "../config/cloudinary";
import bcrypt from "bcryptjs";
import { Prisma, UserStatus } from "@prisma/client";

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

    const userStatus = status as UserStatus;

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      res.status(404).json(sendError("User not found"));
      return;
    }

    // Don't allow banning other admins
    if (targetUser.role === "ADMIN") {
      res.status(403).json(sendError("Cannot modify admin status"));
      return;
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: userStatus,
        banReason: reason || null,
        bannedAt: new Date() || null,
        bannedById: adminId,
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
    });

    // Deactivate user's listings if banned/suspended
    if (userStatus !== UserStatus.ACTIVE) {
      await prisma.listing.updateMany({
        where: {
          userId: id,
          status: "ACTIVE",
        },
        data: {
          status: "INACTIVE",
        },
      });
    }

    res.status(200).json(sendSuccess(updatedUser));
  } catch (error) {
    // console.error("Error updating user status:", error);
    res.status(500).json(sendError((error as Error).message));
  }
};
