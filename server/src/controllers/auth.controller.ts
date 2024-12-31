import { RequestHandler } from "express";
import prisma from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterDTO, LoginDTO } from "../types/auth.types";
import { sendSuccess, sendError } from "../utils/response";
import { config } from "../config/env";
import { transporter } from "../config/mail";
import { getVerificationEmailTemplate } from "../utils/mail-template";

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
      { id: user.id, email: user.email, used: false },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    await transporter.sendMail({
      from: config.emailUser,
      to: email,
      subject: 'Verify Your Email',
      html: getVerificationEmailTemplate(token)
    });

    res.status(201).json(sendSuccess({ message: 'Please check your email to verify your account', token }));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const verifyEmail: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { token } = req.query;
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token as string, config.jwtSecret) as {
      id: string;
      email: string;
      used: boolean;
    };

    if (decoded.used) {
      throw new Error("Token already used");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.isVerified) {
      throw new Error("Invalid token or account already verified");
    }

    await prisma.user.update({
      where: { id: decoded.id },
      data: { isVerified: true },
    });

    // Create new token with used:true to invalidate it
    jwt.sign({ ...decoded, used: true }, config.jwtSecret);
    res.json(sendSuccess({ message: "Email verified successfully" }));
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
      config.jwtSecret
    );

    res.json(sendSuccess({ token }));
  } catch (error) {
    res.status(401).json(sendError((error as Error).message));
  }
};
