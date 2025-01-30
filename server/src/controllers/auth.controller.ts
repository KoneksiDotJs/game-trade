import { RequestHandler } from "express";
import prisma from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterDTO, LoginDTO } from "../types/auth.types";
import { sendSuccess, sendError } from "../utils/response";
import { config } from "../config/env";
import { transporter } from "../config/mail";
import {
  getResetPasswordTemplate,
  getVerificationEmailTemplate,
} from "../utils/mail-template";
import { Role, UserStatus } from "@prisma/client";

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
      subject: "Verify Your Email",
      html: getVerificationEmailTemplate(token),
    });

    res
      .status(201)
      .json(
        sendSuccess({
          message: "Please check your email to verify your account",
          token,
        })
      );
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

export const resendVerification: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("Email already verified");

    const token = jwt.sign(
      { id: user.id, email, used: false },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    await transporter.sendMail({
      from: config.emailUser,
      to: email,
      subject: "Verify Your Email",
      html: getVerificationEmailTemplate(token),
    });

    res.json(sendSuccess({ message: "Verification email resent" }));
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
    if (!user.isVerified) throw new Error("Please verify your email first");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    res.json(
      sendSuccess({
        token,
        user: {
          id: user.id,
          email: user.email,
          usernmae: user.username,
          role: user.role,
        },
      })
    );
  } catch (error) {
    res.status(401).json(sendError((error as Error).message));
  }
};

export const forgotPassword: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const token = jwt.sign(
      { id: user.id, email, type: "reset" },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    await transporter.sendMail({
      from: config.emailUser,
      to: email,
      subject: "Reset Password",
      html: getResetPasswordTemplate(token),
    });

    res.json(
      sendSuccess({ message: "Reset password link sent to your email" })
    );
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const resetPassword: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      type: string;
    };

    if (decoded.type !== "reset") throw new Error("Invalid token type");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.json(sendSuccess({ message: "Password reset successfully" }));
  } catch (error) {
    res.status(400).json(sendError((error as Error).message));
  }
};

export const handleSocialAuth: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { email, name, image, provider } = req.body;

    // check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          username: name || email.split("@")[0],
          password: "", // empty password for social auth
          role: Role.USER,
          status: UserStatus.ACTIVE,
          image,
          isVerified: true,
          emailVerified: new Date(),
        },
      });
    }

    // generate jwt token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "30d" }
    );

    res.json(
      sendSuccess({
        user,
        token,
        provider,
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};
