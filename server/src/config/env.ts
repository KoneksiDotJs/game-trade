import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET!,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  adminUrl: process.env.ADMIN_URL,
  dbUrl: process.env.DATABASE_URL!,
  emailUser: process.env.EMAIL_USER!,
  emailPassword: process.env.EMAIL_PASSWORD!,
  cloudinaryName: process.env.CLOUDINARY_NAME!,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET!,
  stripeApiSecret: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
}