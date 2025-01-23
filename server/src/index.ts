import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { corsOptions } from "./config/cors";
import prisma from "./config/db";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import serviceTypeRoutes from "./routes/servicetype.routes";
import gameRoutes from "./routes/game.routes";
import listingRoutes from "./routes/listing.routes";
import userRoutes from "./routes/user.routes";
import transactionRoutes from "./routes/transaction.routes";
import webhookRoutes from "./routes/webhook.routes";
import reviewRoutes from "./routes/review.routes";
import messageRoutes from "./routes/message.routes";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { serve, setup } from "./config/swagger";

const app = express();

app.use(corsOptions);
app.use(express.json());

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
});
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/service-type", serviceTypeRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);

app.use("/webhook", webhookRoutes);

app.use("/api-docs", serve, setup);

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();

export default app;
