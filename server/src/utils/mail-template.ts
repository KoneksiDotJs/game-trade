import { config } from "../config/env";

export const getVerificationEmailTemplate = (token: string) => {
  const verificationLink = `${config.clientUrl}/verify-email?token=${token}`;

  return `
      <h1>Verify Your Email</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
    `;
};
