import { RequestHandler } from "express";
import { Role } from "../types/user.types";
import { sendError } from "../utils/response";

export const hasRole = (roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(403).json(sendError("Not authenticated"));
      }

      if (!roles.includes(userRole as Role)) {
        res.status(403).json(sendError("Insufficient permissions"));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
