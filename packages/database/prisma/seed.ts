import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();

  await prisma.coinFlip.deleteMany();
  await prisma.diceRoll.deleteMany();
  await prisma.bet.deleteMany();
  await prisma.session.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.provablyFair.deleteMany();
  await prisma.user.deleteMany();
  await prisma.game.deleteMany();

  await prisma.game.create({
    data: { name: "Coinflip", slug: "coinflip", rtp: 0.97, isActive: true }
  });

  const serverSeed = crypto.randomBytes(32).toString("hex");
  const serverSeedHash = crypto
    .createHash("sha256")
    .update(serverSeed)
    .digest("hex");

  await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: await bcrypt.hash("password1234", 12),
      provablyFair: {
        create: {
          serverSeed,
          serverSeedHash,
          clientSeed: crypto.randomBytes(16).toString("hex")
        }
      },
      transactions: {
        create: { type: "DEPOSIT", amount: 10000 }
      }
    }
  });

  console.log("seeded.");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
