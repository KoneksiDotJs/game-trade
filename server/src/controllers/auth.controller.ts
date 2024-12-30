import { RequestHandler } from "express";
import prisma from "../config/db"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterDTO, LoginDTO } from "../types/auth.types";
import { sendSuccess, sendError } from "../utils/response";

export const register: RequestHandler<{}, any, RegisterDTO> = async (
  req,
  res
): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) throw new Error("Email or username already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!
    );

    res.status(201).json(sendSuccess({ token }));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const login: RequestHandler<{}, any, LoginDTO> = async (
  req,
  res
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!
    );

    res.json(sendSuccess({ token }));
  } catch (error) {
    res.status(401).json(sendError((error as Error).message));
  }
};
