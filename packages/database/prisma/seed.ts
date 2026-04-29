import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();
  console.log("seeded.");
}

try {
  await main();
} catch (error) {
  console.log(error);
  await prisma.$disconnect();
}
