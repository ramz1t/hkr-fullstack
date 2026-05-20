import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import type { GameDto } from "@repo/types";

@Injectable()
export class GamesService {
  constructor(private readonly db: DatabaseService) {}

  async getAll(): Promise<GameDto[]> {
    const games = await this.db.client.game.findMany({
      orderBy: { name: "asc" }
    });

    return games.map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      rtp: Number(game.rtp),
      isActive: game.isActive
    }));
  }

  async updateGame(
    id: string,
    data: { isActive?: boolean; rtp?: number }
  ): Promise<GameDto> {
    const existing = await this.db.client.game.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException("Game not found");
    }

    const updated = await this.db.client.game.update({
      where: { id },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.rtp !== undefined && { rtp: data.rtp })
      }
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      rtp: Number(updated.rtp),
      isActive: updated.isActive
    };
  }
}
