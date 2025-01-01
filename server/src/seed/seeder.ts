import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create service types
  await prisma.serviceType.createMany({
    data: [
      {
        name: "Account",
        description: "Game accounts for sale",
      },
      {
        name: "Top Up",
        description: "In-game currency and items",
      },
      {
        name: "Boosting",
        description: "Rank boosting and piloting services",
      },
    ],
  });

  // Create main categories
  await prisma.category.createMany({
    data: [
      {
        name: "MMORPG",
        description: "Massively Multiplayer Online Role-Playing Games",
      },
      {
        name: "FPS",
        description: "First Person Shooter Games",
      },
      {
        name: "MOBA",
        description: "Multiplayer Online Battle Arena",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
