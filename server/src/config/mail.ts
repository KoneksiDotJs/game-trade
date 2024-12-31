import nodemailer from "nodemailer";
import { config } from "./env";

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});
