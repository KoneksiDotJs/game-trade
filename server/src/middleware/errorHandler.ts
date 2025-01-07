import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json(sendError(err.message));
};
