import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";
import { ListingStatus } from "@prisma/client";

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
    const {
      title,
      description,
      price,
      gameId,
      serviceTypeId,
      currency = "USD",
    } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency,
        gameId: parseInt(gameId),
        serviceTypeId: parseInt(serviceTypeId),
        userId,
        status: "ACTIVE",
      },
      include: {
        game: true,
        serviceType: true,
        user: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
          },
        },
      },
    });

    res.status(201).json(sendSuccess(listing));
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
    const { title, description, price, status } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!listing) throw new Error("Listing not found");
    if (listing.userId !== userId) throw new Error("Unauthorized");
    if (listing.status === "SOLD")
      throw new Error("Cannot update sold listing");

    const updateListing = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        status: status as ListingStatus,
      },
      include: {
        game: true,
        serviceType: true,
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
