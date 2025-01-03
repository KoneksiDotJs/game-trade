import { RequestHandler } from "express";
import { Role } from "../types/user.types";
import { sendError } from "../utils/response";

export const hasRole = (roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(401).json(sendError("Insufficient permissions"));
    }
    next();
  };
};
