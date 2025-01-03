import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import cloudinary from "../config/cloudinary";
import prisma from "../config/db";

export const createGame: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { title, description, releaseDate, categoryId } = req.body;
    const image = req.file;

    let imageData = {};

    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "games",
      });
      imageData = {
        imageUrl: result.secure_url,
        imageId: result.public_id,
      };
    }

    const game = await prisma.game.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId),
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        ...imageData,
      },
    });

    res.status(201).json(sendSuccess(game));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const getGames: RequestHandler = async (req, res): Promise<void> => {
  try {
    const games = await prisma.game.findMany({
      include: {
        category: true,
        listings: {
          where: { status: "ACTIVE" },
          include: {
            serviceType: true,
          },
        },
      },
    });

    if (!games) {
      throw new Error("No games found");
    }

    res.status(200).json(sendSuccess(games));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getGameById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const game = await prisma.game.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        listings: {
          where: { status: "ACTIVE" },
          include: {
            serviceType: true,
            user: {
              select: {
                id: true,
                username: true,
                reputationScore: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      throw new Error("Game not found");
    }

    res.status(200).json(sendSuccess(game));
  } catch (error) {
    res.status(404).json(sendError((error as Error).message));
  }
};

export const updateGame: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, releaseDate, categoryId } = req.body;
    const image = req.file;

    const existingGame = await prisma.game.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingGame) {
      throw new Error("Game not found");
    }

    // Create updateData object only with provided fields
    const updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    if (releaseDate !== undefined) {
      updateData.releaseDate = releaseDate ? new Date(releaseDate) : null;
    }

    if (image) {
      // delete old image if exists
      if (existingGame.imageId) {
        await cloudinary.uploader.destroy(existingGame.imageId);
      }

      // upload new image
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "games",
      });

      updateData.imageUrl = result.secure_url;
      updateData.imageId = result.public_id;
    }

    const game = await prisma.game.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json(sendSuccess(game));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const deleteGame: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findUnique({
      where: { id: parseInt(id) },
      include: {
        listings: true,
      },
    });

    if (!game) {
      throw new Error("Game not found");
    }
    if (game.listings.length > 0) {
      throw new Error("Cannot delete game with active listings");
    }
    if (game.imageId) {
      await cloudinary.uploader.destroy(game.imageId);
    }

    await prisma.game.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json(sendSuccess({ message: "Game deleted successfully" }));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};
