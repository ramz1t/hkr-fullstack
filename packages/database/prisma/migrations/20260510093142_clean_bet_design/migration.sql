/*
  Warnings:

  - You are about to drop the column `amount` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `nonceUsed` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `provablyFairId` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `nonce` on the `ProvablyFair` table. All the data in the column will be lost.
  - Added the required column `clientSeedUsed` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverSeedHashUsed` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverSeedUsed` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wager` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CoinSide" AS ENUM ('HEADS', 'TAILS');

-- DropForeignKey
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_provablyFairId_fkey";

-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "amount",
DROP COLUMN "hash",
DROP COLUMN "nonceUsed",
DROP COLUMN "provablyFairId",
DROP COLUMN "result",
ADD COLUMN     "clientSeedUsed" TEXT NOT NULL,
ADD COLUMN     "nonce" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serverSeedHashUsed" TEXT NOT NULL,
ADD COLUMN     "serverSeedUsed" TEXT NOT NULL,
ADD COLUMN     "wager" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProvablyFair" DROP COLUMN "nonce";

-- CreateTable
CREATE TABLE "CoinFlip" (
    "id" TEXT NOT NULL,
    "betId" TEXT NOT NULL,
    "chosenSide" "CoinSide" NOT NULL,
    "landedSide" "CoinSide" NOT NULL,

    CONSTRAINT "CoinFlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiceRoll" (
    "id" TEXT NOT NULL,
    "betId" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "rolled" INTEGER NOT NULL,

    CONSTRAINT "DiceRoll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoinFlip_betId_key" ON "CoinFlip"("betId");

-- CreateIndex
CREATE UNIQUE INDEX "DiceRoll_betId_key" ON "DiceRoll"("betId");

-- AddForeignKey
ALTER TABLE "CoinFlip" ADD CONSTRAINT "CoinFlip_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiceRoll" ADD CONSTRAINT "DiceRoll_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
