import { Request } from "express";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      user?: {
        id: string;
        username: string;
        email: string;
      }
    }
  }
}
