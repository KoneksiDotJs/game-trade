import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";

export const createCategory: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { name, description } = req.body;

    const exists = await prisma.category.findUnique({
      where: { name },
    });

    if (exists) {
      throw new Error("Category already exists");
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(sendSuccess(category));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const getCategories: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        games: true,
      },
    });

    res.status(200).json(sendSuccess(categories));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getCategoryById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        games: true,
      },
    });

    if (!category) throw new Error("Category not found");
    res.status(200).json(sendSuccess(category));
  } catch (error) {
    res.status(404).json(sendError((error as Error).message));
  }
};

export const updateCategory: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });

    res.status(200).json(sendSuccess(category));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const deleteCategory: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const hasGames = await prisma.game.findFirst({
      where: { categoryId: parseInt(id) },
    });

    if (hasGames) {
      throw new Error("Cannot delete category with existing games");
    }
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json(sendSuccess({ message: "Category deleted successfully" }));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};
