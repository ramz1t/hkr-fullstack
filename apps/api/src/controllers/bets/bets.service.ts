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
  type CoinflipBetDto,
  type SlotsBetDto,
  type SlotReels,
  type PaginatedResult
} from "@repo/types";
import crypto from "crypto";
import { coinflip, slots } from "@repo/games";
import { Game, ProvablyFair } from "@repo/database";
import type {
  BetDto,
  BetWithGameAndOutcomeDto,
  AnyGameBetDto
} from "@repo/types";

type BetContext = {
  provablyFair: ProvablyFair & { serverSeed: string };
  game: Game;
  nonce: number;
  hash: string;
};

@Injectable()
export class BetsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly walletsService: WalletsService
  ) {}

  private readonly SLOT_MULTIPLIERS: Record<SlotOutcome, number> = {
    [SlotOutcome.JACKPOT]: 100,
    [SlotOutcome.BIG_WIN]: 10,
    [SlotOutcome.SMALL_WIN]: 2,
    [SlotOutcome.LOSS]: 0
  };

  private async resolveBetContext(
    userId: string,
    gameSlug: string,
    wager: number
  ): Promise<BetContext> {
    if (wager <= 0) {
      throw new BadRequestException("Wager must be positive");
    }

    const { balance } = await this.walletsService.getBalance(userId);
    if (balance < wager) {
      throw new BadRequestException("Insufficient balance");
    }

    const [provablyFair, game] = await Promise.all([
      this.db.client.provablyFair.findUnique({ where: { userId } }),
      this.db.client.game.findUnique({ where: { slug: gameSlug } })
    ]);

    if (!provablyFair?.serverSeed) {
      throw new BadRequestException("Provably fair seed not initialized");
    }
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

    return {
      provablyFair: provablyFair as typeof provablyFair & {
        serverSeed: string;
      },
      game,
      nonce,
      hash
    };
  }

  private buildBaseResponseDto(
    bet: { id: string; wager: number; payout: number; nonce: number },
    context: BetContext
  ): BetDto {
    return {
      id: bet.id,
      gameId: context.game.id,
      gameSlug: context.game.slug,
      wager: bet.wager,
      payout: bet.payout,
      nonce: bet.nonce,
      serverSeed: null as string | null,
      serverSeedHash: context.provablyFair.serverSeedHash,
      clientSeed: context.provablyFair.clientSeed
    };
  }

  private async runBetTransaction(
    userId: string,
    wager: number,
    payout: number,
    context: BetContext,
    gameRelation: Record<string, unknown>
  ) {
    const { provablyFair, game, nonce } = context;
    return this.db.client.$transaction(async (tx) => {
      await tx.transaction.create({
        data: { userId, type: TransactionType.BET, amount: wager }
      });
      if (payout > 0) {
        await tx.transaction.create({
          data: { userId, type: TransactionType.WIN, amount: payout }
        });
      }
      return tx.bet.create({
        // if someone can fix typing here i'm all hears
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: {
          userId,
          gameId: game.id,
          serverSeedUsed: provablyFair.serverSeed,
          serverSeedHashUsed: provablyFair.serverSeedHash,
          clientSeedUsed: provablyFair.clientSeed,
          wager,
          payout,
          nonce,
          ...gameRelation
        } as any
      });
    });
  }

  async placeCoinFlipBet(
    userId: string,
    wager: number,
    side: CoinSide
  ): Promise<CoinflipBetDto> {
    const context = await this.resolveBetContext(userId, "coinflip", wager);
    const { game, hash } = context;
    const landedSide = coinflip.computeOutcome(hash);
    const payout = landedSide === side ? Math.floor(wager * 2 * +game.rtp) : 0;
    const bet = await this.runBetTransaction(userId, wager, payout, context, {
      coinFlip: { create: { chosenSide: side, landedSide } }
    });
    return {
      ...this.buildBaseResponseDto(bet, context),
      coinFlip: { chosenSide: side, landedSide }
    };
  }

  async placeSlotsBet(userId: string, wager: number): Promise<SlotsBetDto> {
    const context = await this.resolveBetContext(userId, "slots", wager);
    const { game, hash } = context;
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
    const bet = await this.runBetTransaction(userId, wager, payout, context, {
      slotSpin: { create: { reels, outcome } }
    });
    return {
      ...this.buildBaseResponseDto(bet, context),
      slots: { reels, mainLine, outcome }
    };
  }

  private serializeBet(
    bet: BetWithGameAndOutcomeDto,
    seedRevealed: boolean
  ): AnyGameBetDto {
    const base: BetDto = {
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

  async getBet(userId: string, betId: string): Promise<AnyGameBetDto> {
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

    return this.serializeBet(bet, seedRevealed);
  }

  async getBets(
    userId: string,
    page: number,
    pageSize: number,
    gameSlug?: string
  ): Promise<PaginatedResult<AnyGameBetDto>> {
    const game = gameSlug
      ? await this.db.client.game.findUnique({ where: { slug: gameSlug } })
      : null;

    const where: Record<string, unknown> = { userId };
    if (game) {
      where.gameId = game.id;
    }

    const [betEntries, total, provablyFair] = await Promise.all([
      this.db.client.bet.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { coinFlip: true, slotSpin: true, game: true }
      }),
      this.db.client.bet.count({ where }),
      this.db.client.provablyFair.findUnique({
        where: { userId }
      })
    ]);

    const data = betEntries.map((bet) => {
      const seedRevealed =
        provablyFair !== null && bet.serverSeedUsed !== provablyFair.serverSeed;
      // prisma deep-nested types being silly again hahaha
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.serializeBet(bet, seedRevealed);
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
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
