import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";

export const createReview: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { transactionId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new Error("User not authenticated");
    if (rating < 1 || rating > 5)
      throw new Error("Rating must be between 1 and 5");

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
    });

    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status !== "COMPLETED")
      throw new Error("Transaction is not completed");

    // check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: { transactionId: parseInt(transactionId), buyerId: userId },
    });

    if (existingReview) throw new Error("Review already exists");

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        transactionId: parseInt(transactionId),
        buyerId: userId,
        sellerId: transaction.sellerId,
      },
    });

    // calculate new average rating
    const sellerReviews = await prisma.review.findMany({
      where: { sellerId: transaction.sellerId },
    });

    const totalRating = sellerReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating = parseFloat(
      (totalRating / sellerReviews.length).toFixed(2)
    );

    // update seller average rating
    await prisma.user.update({
      where: { id: transaction.sellerId },
      data: {
        reputationScore: {
          increment: averageRating,
        },
      },
    });

    res.status(201).json(sendSuccess(review));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getReview: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        transaction: true,
        buyer: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          },
        },
      },
    });

    if (!review) throw new Error("Review not found");

    res.status(200).json(sendSuccess(review));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getAllReviews: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { sellerId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = sellerId ? { sellerId: sellerId as string } : {};

    const reviews = await prisma.review.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        transaction: true,
        buyer: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
            avatarUrl: true,
          },
        },
      },
    });

    const total = await prisma.review.count({ where });

    res.status(200).json(
      sendSuccess({
        reviews,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};
