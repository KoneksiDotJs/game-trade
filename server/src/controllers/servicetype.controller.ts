import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";
import { ServiceTypeEnum } from "../types/serviceType.types";

export const createServiceType: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { name, description } = req.body;
    // Validate service type name
    if (!Object.values(ServiceTypeEnum).includes(name as ServiceTypeEnum)) {
      throw new Error(
        `Service type must be one of: ${Object.values(ServiceTypeEnum).join(
          ", "
        )}`
      );
    }
    const exists = await prisma.serviceType.findUnique({
      where: { name },
    });

    if (exists) {
      throw new Error("Service Type already exists");
    }

    const serviceType = await prisma.serviceType.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(sendSuccess(serviceType));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const getServiceTypes: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      include: {
        listings: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json(sendSuccess(serviceTypes));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getServiceTypeById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: parseInt(id) },
      include: {
        listings: true,
      },
    });

    res.status(200).json(sendSuccess(serviceType));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};
