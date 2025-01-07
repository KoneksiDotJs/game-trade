import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";

export const createReview: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { transactionId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new Error("User not authenticated");

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
    });

    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status !== "COMPLETED")
      throw new Error("Transaction is not completed");

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        transactionId: parseInt(transactionId),
        buyerId: userId,
        sellerId: transaction.sellerId,
      },
    });

    // update seller reputation score
    await prisma.user.update({
      where: { id: transaction.sellerId },
      data: {
        reputationScore: {
          increment: rating / 5,
        },
      },
    });

    res.status(201).json(sendSuccess(review));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getReview: RequestHandler = async(req, res): Promise<void> => {
  try {
    const {id} = req.params;

    const review = await prisma.review.findUnique({
      where: {id: parseInt(id)},
      include: {
        transaction: true,
        buyer: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          }
        }
      }
    })

    if (!review) throw new Error("Review not found");

    res.status(200).json(sendSuccess(review));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
}