import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { config } from "./env";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Game Trade API Documentation",
      version: "1.0.0",
      description: "API Documentation for Game Trading Platform",
    },
    servers: [
      {
        url: `http://localhost:${config.port || 5000}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*ts"], // Path to the API routes
};

export const specs = swaggerJSDoc(swaggerOptions);
export const serve = swaggerUi.serve;
export const setup = swaggerUi.setup(specs);
