import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.types";
import { sendError } from "../utils/response";
import { config } from "../config/env";
import prisma from "../config/db";

declare module "express" {
  export interface Request {
    user?: JwtPayload;
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isVerified) {
      throw new Error("Unauthorized");
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json(sendError((error as Error).message));
  }
};
