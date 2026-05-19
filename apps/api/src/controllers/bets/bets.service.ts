import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { WalletsService } from "../wallets/wallets.service";
import {
  TransactionType,
  CoinSide,
  SlotOutcome,
  SlotSymbol,
  type BetDto,
  type CoinflipBetDto,
  type SlotsBetDto,
  type SlotReels,
  type PaginatedResult
} from "@repo/types";
import crypto from "crypto";
import { coinflip, slots } from "@repo/games";

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

    const nonce = await this.db.client.bet.count({
      where: { userId, serverSeedHashUsed: provablyFair.serverSeedHash }
    });

    const hash = crypto
      .createHash("sha256")
      .update(provablyFair.serverSeed + provablyFair.clientSeed + nonce)
      .digest("hex");

    const landedSide = coinflip.computeOutcome(hash);

    const won = landedSide === side;
    const payout = won ? Math.floor(wager * 2 * +game.rtp) : 0;

    const balance = (await this.walletsService.getBalance(userId)).balance;
    if (balance < wager) {
      throw new BadRequestException("Insufficient balance");
    }

    const bet = await this.db.client.$transaction(async (tx) => {
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

    return {
      id: bet.id,
      gameId: game.id,
      gameSlug: game.slug,
      wager: bet.wager,
      payout: bet.payout,
      nonce: bet.nonce,
      serverSeed: null,
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      coinFlip: { chosenSide: side, landedSide }
    };
  }

  private readonly SLOT_MULTIPLIERS: Record<SlotOutcome, number> = {
    [SlotOutcome.JACKPOT]: 100,
    [SlotOutcome.BIG_WIN]: 10,
    [SlotOutcome.SMALL_WIN]: 2,
    [SlotOutcome.LOSS]: 0
  };

  async placeSlotsBet(userId: string, wager: number): Promise<SlotsBetDto> {
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
      where: { slug: "slots" }
    });

    if (!game) {
      throw new NotFoundException("Game not found");
    }

    const nonce = await this.db.client.bet.count({
      where: { userId, serverSeedHashUsed: provablyFair.serverSeedHash }
    });

    const hash = crypto
      .createHash("sha256")
      .update(provablyFair.serverSeed + provablyFair.clientSeed + nonce)
      .digest("hex");

    const reels = slots.computeReels(hash);
    const mainLine: [SlotSymbol, SlotSymbol, SlotSymbol] = [
      reels[0][1],
      reels[1][1],
      reels[2][1]
    ];
    const outcome = slots.evaluateMainLine(mainLine);
    const payout = Math.floor(
      wager * this.SLOT_MULTIPLIERS[outcome] * +game.rtp
    );

    const balance = (await this.walletsService.getBalance(userId)).balance;
    if (balance < wager) {
      throw new BadRequestException("Insufficient balance");
    }

    const bet = await this.db.client.$transaction(async (tx) => {
      await tx.transaction.create({
        data: { userId, type: TransactionType.BET, amount: wager }
      });

      if (payout > 0) {
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
          slotSpin: { create: { reels, outcome } }
        }
      });
    });

    return {
      id: bet.id,
      gameId: game.id,
      gameSlug: game.slug,
      wager: bet.wager,
      payout: bet.payout,
      nonce: bet.nonce,
      serverSeed: null,
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed,
      slots: { reels, mainLine, outcome }
    };
  }

  async getBet(
    userId: string,
    betId: string
  ): Promise<CoinflipBetDto | SlotsBetDto> {
    const bet = await this.db.client.bet.findUnique({
      where: { id: betId },
      include: { coinFlip: true, slotSpin: true, game: true }
    });

    if (!bet) {
      throw new NotFoundException("Bet not found");
    }

    if (bet.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    const provablyFair = await this.db.client.provablyFair.findUnique({
      where: { userId }
    });

    const seedRevealed =
      provablyFair !== null && bet.serverSeedUsed !== provablyFair.serverSeed;

    const base = {
      id: bet.id,
      gameId: bet.gameId,
      gameSlug: bet.game.slug,
      wager: bet.wager,
      payout: bet.payout,
      nonce: bet.nonce,
      serverSeed: seedRevealed ? bet.serverSeedUsed : null,
      serverSeedHash: bet.serverSeedHashUsed,
      clientSeed: bet.clientSeedUsed
    };

    if (bet.coinFlip) {
      return {
        ...base,
        coinFlip: {
          chosenSide: bet.coinFlip.chosenSide as CoinSide,
          landedSide: bet.coinFlip.landedSide as CoinSide
        }
      } satisfies CoinflipBetDto;
    }

    if (bet.slotSpin) {
      const reels = bet.slotSpin.reels as SlotReels;
      const mainLine: [SlotSymbol, SlotSymbol, SlotSymbol] = [
        reels[0][1],
        reels[1][1],
        reels[2][1]
      ];
      return {
        ...base,
        slots: {
          reels,
          mainLine,
          outcome: bet.slotSpin.outcome as SlotOutcome
        }
      } satisfies SlotsBetDto;
    }

    throw new NotFoundException("Bet result data not found");
  }

  async getBets(
    userId: string,
    page: number,
    pageSize: number,
    gameSlug?: string
  ): Promise<PaginatedResult<CoinflipBetDto | SlotsBetDto>> {
    const game = gameSlug
      ? await this.db.client.game.findUnique({ where: { slug: gameSlug } })
      : null;

    const where: Record<string, unknown> = { userId };
    if (game) {
      where.gameId = game.id;
    }

    const [betEntries, total] = await Promise.all([
      this.db.client.bet.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { coinFlip: true, slotSpin: true, game: true }
      }),
      this.db.client.bet.count({ where })
    ]);

    const provablyFair = await this.db.client.provablyFair.findUnique({
      where: { userId }
    });

    const data: Array<CoinflipBetDto | SlotsBetDto | BetDto> = betEntries.map(
      (bet) => {
        const seedRevealed =
          provablyFair !== null &&
          bet.serverSeedUsed !== provablyFair.serverSeed;

        const base = {
          id: bet.id,
          gameId: bet.gameId,
          gameSlug: bet.game.slug,
          wager: bet.wager,
          payout: bet.payout,
          nonce: bet.nonce,
          serverSeed: seedRevealed ? bet.serverSeedUsed : null,
          serverSeedHash: bet.serverSeedHashUsed,
          clientSeed: bet.clientSeedUsed
        };

        if (bet.coinFlip) {
          return {
            ...base,
            coinFlip: {
              chosenSide: bet.coinFlip.chosenSide as CoinSide,
              landedSide: bet.coinFlip.landedSide as CoinSide
            }
          } satisfies CoinflipBetDto;
        }

        if (bet.slotSpin) {
          const reels = bet.slotSpin.reels as SlotReels;
          const mainLine: [SlotSymbol, SlotSymbol, SlotSymbol] = [
            reels[0][1],
            reels[1][1],
            reels[2][1]
          ];
          return {
            ...base,
            slots: {
              reels,
              mainLine,
              outcome: bet.slotSpin.outcome as SlotOutcome
            }
          } satisfies SlotsBetDto;
        }

        return base;
      }
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data as (CoinflipBetDto | SlotsBetDto)[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    };
  }
}
