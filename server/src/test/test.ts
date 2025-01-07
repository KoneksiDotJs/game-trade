import request from "supertest";
import app from "../index";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { Server } from "http";
import prisma from "../config/db";

let server: Server;

beforeAll((done) => {
  server = app.listen(0, () => done());
}, 10000); // 10s timeout

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: "test@example.com",
    },
  });
  await prisma.$disconnect();
  server.close();
}, 10000); // 10s timeout

// auth test
describe("Auth API", () => {
  jest.setTimeout(15000); // 15s timeout for all tests in this block
  let verificationToken: string;

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password12345",
      username: "testuser",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("message");
    expect(res.body.data).toHaveProperty("token");
    verificationToken = res.body.data.token;
  }, 10000);
  
  it("should not register with invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "invalid-email",
      password: "password12345",
      username: "testuser2",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email format");
  }, 10000);
  
  it("should verify email", async () => {
    const res = await request(app).get(
      `/api/auth/verify-email?token=${verificationToken}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 10000);

  it("should login user after verification", async () => {
    // Wait a bit for verification to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password12345",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
  }, 10000);
});

// category test

// game test

// listing test

// transaction test

// review test

// message test
