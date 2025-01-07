import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";

export const sendMessage: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { receiverId, content, transactionId } = req.body;
    const senderId = req.user?.id;

    if (!senderId) throw new Error("User not authenticated");

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        transactionId: transactionId ? parseInt(transactionId) : undefined,
      },
    });

    res.status(201).json(sendSuccess(message));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getMessage: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new Error("User not authenticated");

    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
        transaction: true,
      },
    });

    if (!message) throw new Error("Message not found");

    // Check if user is involved in the message
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new Error("Unauthorized to view this message");
    }

    // Update isRead only if current user is the receiver
    if (message.receiverId === userId && !message.isRead) {
      await prisma.message.update({
        where: { id: parseInt(id) },
        data: { isRead: true },
      });
    }

    res.status(200).json(sendSuccess(message));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getAllMessages: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { partnerId } = req.query;

    if (!userId) throw new Error("User not authenticated");

    const where = partnerId
      ? {
          OR: [
            {
              AND: [{ senderId: userId }, { receiverId: partnerId as string }],
            },
            {
              AND: [{ senderId: partnerId as string }, { receiverId: userId }],
            },
          ],
        }
      : {
          OR: [{ senderId: userId }, { receiverId: userId }],
        };

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
    });

    res.status(200).json(sendSuccess(messages));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};
