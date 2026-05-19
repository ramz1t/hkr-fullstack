import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import type { SeedsDto, RevealedSeedsDto } from "@repo/types";
import crypto from "crypto";

@Injectable()
export class ProvablyFairService {
  constructor(private readonly db: DatabaseService) {}

  async getCurrent(userId: string): Promise<SeedsDto> {
    const provablyFair = await this.db.client.provablyFair.findUnique({
      where: { userId }
    });

    if (!provablyFair) {
      throw new NotFoundException("Provably fair not found");
    }

    return {
      serverSeedHash: provablyFair.serverSeedHash,
      clientSeed: provablyFair.clientSeed
    };
  }

  async seed(userId: string, clientSeed: string): Promise<SeedsDto> {
    const provablyFair = await this.db.client.provablyFair.findUnique({
      where: { userId }
    });

    if (!provablyFair) {
      throw new NotFoundException("Provably fair not found");
    }

    const serverSeed = crypto.randomBytes(32).toString("hex");
    const serverSeedHash = crypto
      .createHash("sha256")
      .update(serverSeed)
      .digest("hex");

    const updated = await this.db.client.provablyFair.update({
      where: { userId },
      data: {
        serverSeedHash,
        serverSeed,
        clientSeed
      }
    });

    return {
      serverSeedHash: updated.serverSeedHash,
      clientSeed: updated.clientSeed
    };
  }

  async reveal(userId: string): Promise<RevealedSeedsDto> {
    const provablyFair = await this.db.client.provablyFair.findUnique({
      where: { userId }
    });

    if (!provablyFair) {
      throw new NotFoundException("Provably fair not found");
    }

    const oldSeed = provablyFair.serverSeed;
    const oldSeedHash = provablyFair.serverSeedHash;

    const newSeed = crypto.randomBytes(32).toString("hex");
    const newSeedHash = crypto
      .createHash("sha256")
      .update(newSeed)
      .digest("hex");

    await this.db.client.provablyFair.update({
      where: { userId },
      data: { serverSeed: newSeed, serverSeedHash: newSeedHash }
    });

    return {
      serverSeed: oldSeed ?? "",
      serverSeedHash: oldSeedHash,
      clientSeed: provablyFair.clientSeed
    };
  }
}
