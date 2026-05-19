-- CreateEnum
CREATE TYPE "SlotOutcome" AS ENUM ('LOSS', 'SMALL_WIN', 'BIG_WIN', 'JACKPOT');

-- CreateTable
CREATE TABLE "SlotSpin" (
    "id" TEXT NOT NULL,
    "betId" TEXT NOT NULL,
    "reels" JSONB NOT NULL,
    "outcome" "SlotOutcome" NOT NULL,

    CONSTRAINT "SlotSpin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlotSpin_betId_key" ON "SlotSpin"("betId");

-- AddForeignKey
ALTER TABLE "SlotSpin" ADD CONSTRAINT "SlotSpin_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
