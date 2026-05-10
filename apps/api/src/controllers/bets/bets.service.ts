import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { WalletsService } from "../wallets/wallets.service";
import { TransactionType, CoinSide, type CoinflipBetDto } from "@repo/types";
import crypto from "crypto";

@Injectable()
export class BetsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly walletsService: WalletsService
  ) {}

  async placeCoinFlipBet(
    userId: string,
    wager: number,
    side: CoinSide
  ): Promise<CoinflipBetDto> {
    if (wager <= 0) {
      throw new BadRequestException("Wager must be positive");
    }

    const provablyFair = await this.db.client.provablyFair.findUnique({
      where: { userId }
    });

    if (!provablyFair || !provablyFair.serverSeed) {
      throw new BadRequestException("Provably fair seed not initialized");
    }

    const game = await this.db.client.game.findUnique({
      where: { slug: "coinflip" }
    });

    if (!game) {
      throw new NotFoundException("Game not found");
    }

    const nonce = await this.db.client.bet.count({ where: { userId } });

    const hash = crypto
      .createHash("sha256")
      .update(provablyFair.serverSeed + provablyFair.clientSeed + nonce)
      .digest("hex");

    const landedSide: CoinSide =
      parseInt(hash.substring(0, 2), 16) % 2 === 0
        ? CoinSide.HEADS
        : CoinSide.TAILS;

    const won = landedSide === side;
    const payout = won ? Math.floor(wager * 2 * +game.rtp) : 0;

    const balance = await this.walletsService.getBalance(userId);
    if (balance < wager) {
      throw new BadRequestException("Insufficient balance");
    }

    const { id: betId } = await this.db.client.$transaction(async (tx) => {
      await tx.transaction.create({
        data: { userId, type: TransactionType.BET, amount: wager }
      });

      if (won && payout > 0) {
        await tx.transaction.create({
          data: { userId, type: TransactionType.WIN, amount: payout }
        });
      }

      return tx.bet.create({
        data: {
          userId,
          gameId: game.id,
          serverSeedUsed: provablyFair.serverSeed!,
          serverSeedHashUsed: provablyFair.serverSeedHash,
          clientSeedUsed: provablyFair.clientSeed,
          wager,
          payout,
          nonce,
          coinFlip: {
            create: { chosenSide: side, landedSide }
          }
        }
      });
    });

    const bet = (await this.db.client.bet.findUnique({
      where: { id: betId },
      include: { coinFlip: true }
    }))!;

    return {
      id: bet.id,
      userId: bet.userId,
      wager: bet.wager,
      payout: bet.payout,
      nonce: bet.nonce,
      coinflip: {
        id: bet.coinFlip?.id ?? "",
        chosenSide: side,
        landedSide
      },
      createdAt: bet.createdAt,
      updatedAt: bet.updatedAt
    };
  }

  async verifyBet(userId: string, betId: string) {
    const bet = await this.db.client.bet.findUnique({
      where: { id: betId },
      include: { coinFlip: true }
    });

    if (!bet) {
      throw new NotFoundException("Bet not found");
    }

    if (bet.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (!bet.coinFlip) {
      throw new NotFoundException("Bet result data not found");
    }

    const hash = crypto
      .createHash("sha256")
      .update(bet.serverSeedUsed + bet.clientSeedUsed + bet.nonce)
      .digest("hex");

    const calculatedSide: CoinSide =
      parseInt(hash.substring(0, 2), 16) % 2 === 0
        ? CoinSide.HEADS
        : CoinSide.TAILS;

    const actualSide = bet.coinFlip.landedSide as CoinSide;

    return {
      serverSeed: bet.serverSeedUsed,
      clientSeed: bet.clientSeedUsed,
      serverSeedHash: bet.serverSeedHashUsed,
      nonce: bet.nonce,
      outcomeHash: hash,
      result: { actualSide, calculatedSide },
      match: calculatedSide === actualSide
    };
  }
}
