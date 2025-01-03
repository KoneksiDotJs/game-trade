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

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/service-type", serviceTypeRoutes)
app.use("/api/games", gameRoutes)
app.use("/api/listings", listingRoutes)

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
