import prisma from "../config/db";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  // Clear existing data
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

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      isVerified: true,
      role: "ADMIN",
    },
  });

  // Create categories and get references
  const categoryData = ["MMORPG", "FPS", "MOBA", "Battle Royale", "Sports"];
  const categories = await Promise.all(
    categoryData.map((name) => prisma.category.create({ data: { name } }))
  );

  // Create games with dynamic category references
  const gameData = [
    { title: "World of Warcraft", categoryId: categories[0].id },
    { title: "Final Fantasy XIV", categoryId: categories[0].id },
    { title: "Counter-Strike 2", categoryId: categories[1].id },
    { title: "Valorant", categoryId: categories[1].id },
    { title: "Dota 2", categoryId: categories[2].id },
    { title: "League of Legends", categoryId: categories[2].id },
    { title: "PUBG", categoryId: categories[3].id },
    { title: "Fortnite", categoryId: categories[3].id },
    { title: "FIFA 24", categoryId: categories[4].id },
    { title: "NBA 2K24", categoryId: categories[4].id },
  ];

  const games = await Promise.all(
    gameData.map((game) => prisma.game.create({ data: game }))
  );

  // Create service types and get references
  const serviceTypeData = ["Account", "Top Up", "Boosting"];
  const serviceTypes = await Promise.all(
    serviceTypeData.map((name) => prisma.serviceType.create({ data: { name } }))
  );

  // Create users and get references
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "seller@example.com",
        username: "seller",
        password: await bcrypt.hash("password123", 10),
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "buyer@example.com",
        username: "buyer",
        password: await bcrypt.hash("password123", 10),
        isVerified: true,
      },
    }),
  ]);

  // Create listings with dynamic references
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: "WoW Max Level Account",
        description: "Level 70 account with full gear",
        price: "199.99",
        quantity: 1,
        gameId: games[0].id,
        serviceTypeId: serviceTypes[0].id,
        userId: users[0].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "CS2 Coaching",
        description: "Professional coaching by high rank player",
        price: "49.99",
        quantity: 10,
        gameId: games[2].id,
        serviceTypeId: serviceTypes[2].id,
        userId: users[0].id,
      },
    }),
  ]);

  // Create transaction with dynamic references
  const transaction = await prisma.transaction.create({
    data: {
      amount: "199.99",
      quantity: 1,
      status: "COMPLETED",
      listingId: listings[0].id,
      buyerId: users[1].id,
      sellerId: users[0].id,
      paymentStatus: "paid",
      completedAt: new Date(),
    },
  });

  // Create review with dynamic references
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Great seller, fast delivery!",
      transactionId: transaction.id,
      buyerId: users[1].id,
      sellerId: users[0].id,
    },
  });

  // Create message with dynamic references
  await prisma.message.create({
    data: {
      content: "Thanks for the purchase!",
      senderId: users[0].id,
      receiverId: users[1].id,
      transactionId: transaction.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
