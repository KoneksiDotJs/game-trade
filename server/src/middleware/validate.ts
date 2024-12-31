import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../types/auth.types";
import { sendError } from "../utils/response";

export const validateRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await registerSchema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      res.status(400).json(sendError((error as any).errors[0].message));
    } else {
      res.status(400).json(sendError("Unknown error"));
    }
  }
};

export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await loginSchema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      res.status(400).json(sendError((error as any).errors[0].message));
    } else {
      res.status(400).json(sendError("Unknown error"));
    }
  }
};
