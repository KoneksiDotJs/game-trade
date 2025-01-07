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

    res.status(200).json(sendSuccess(message));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};
