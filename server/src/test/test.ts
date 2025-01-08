import request from "supertest";
import app from "../index";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { Server } from "http";
import prisma from "../config/db";

let server: Server;
let authToken: string;
let userId: string;
let listingId: number;
let categoryId: number;
let gameId: number;
let serviceTypeId: number;
let transactionId: number;

beforeAll(async () => {
  server = app.listen(0);

  // Setup test data
  const category = await prisma.category.create({
    data: { name: "Test Category" },
  });
  categoryId = category.id;

  const game = await prisma.game.create({
    data: {
      title: "Test Game",
      categoryId,
    },
  });
  gameId = game.id;

  const serviceType = await prisma.serviceType.create({
    data: { name: "Test Service" },
  });
  serviceTypeId = serviceType.id;
});

afterAll(async () => {
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.review.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.listing.deleteMany(),
    prisma.user.deleteMany(),
    prisma.game.deleteMany(),
    prisma.category.deleteMany(),
    prisma.serviceType.deleteMany(),
  ]);

  await prisma.$disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("API Tests", () => {
  describe("Auth Flow", () => {
    it("should complete auth flow", async () => {
      // Register
      const registerRes = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password12345",
        username: "testuser",
      });
      expect(registerRes.status).toBe(201);
      const verificationToken = registerRes.body.data.token;

      // Wait for email verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify Email
      const verifyRes = await request(app).get(
        `/api/auth/verify-email?token=${verificationToken}`
      );
      expect(verifyRes.status).toBe(200);

      // Wait for verification to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Login
      const loginRes = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password12345",
      });
      expect(loginRes.status).toBe(200);
      authToken = loginRes.body.data.token;
      userId = loginRes.body.data.id;
    }, 15000);
  });

  describe("Transaction Flow", () => {
    let buyerToken: string;
    let buyerId: string;

    beforeAll(async () => {
      // Register & verify buyer
      const registerRes = await request(app).post("/api/auth/register").send({
        email: "buyer@example.com",
        password: "password12345",
        username: "testbuyer",
      });
      const verificationToken = registerRes.body.data.token;

      // Verify buyer email
      await request(app).get(
        `/api/auth/verify-email?token=${verificationToken}`
      );

      // Login as buyer
      const loginRes = await request(app).post("/api/auth/login").send({
        email: "buyer@example.com",
        password: "password12345",
      });
      buyerToken = loginRes.body.data.token;
      buyerId = loginRes.body.data.id;
    });

    it("should complete full transaction flow", async () => {
      // Create listing as seller
      const listingRes = await request(app)
        .post("/api/listings")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Listing",
          description: "Test Description",
          price: 99.99,
          gameId,
          serviceTypeId,
          quantity: 1,
        });
      listingId = listingRes.body.data.id;

      // Create transaction as buyer
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          listingId,
          quantity: 1,
        });
      console.log("Transaction Response:", createRes.body); // Debug response
      expect(createRes.status).toBe(201);

      // Extract transaction data correctly
      const transaction = createRes.body.data.updatedTransaction;
      transactionId = transaction.id;
      const paymentIntentId = transaction.stripePaymentIntentId;

      // Update transaction status
      const updateRes = await request(app)
        .patch(`/api/transactions/${transactionId}/status`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          status: "COMPLETED",
          paymentIntentId,
        });
      console.log("Update Response:", updateRes.body); // Debug response
      expect(updateRes.status).toBe(200);

      // Create review
      const reviewRes = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          transactionId,
          rating: 5,
          comment: "Great service!",
        });
      expect(reviewRes.status).toBe(201);
    }, 30000);
  });
});
