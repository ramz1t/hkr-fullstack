import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards
} from "@nestjs/common";
import { GamesService } from "./games.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import { UserRole, type JwtPayload } from "@repo/types";
import { ForbiddenException } from "@nestjs/common";
import { UpdateGameDto } from "./dto/update-game.dto";

@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) { }

  @Get("")
  @UseGuards(JwtAccessTokenGuard)
  async findAll(@CurrentUser() user: JwtPayload) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admins can access this endpoint");
    }

    return this.gamesService.getAll();
  }

  @Patch(":id")
  @UseGuards(JwtAccessTokenGuard)
  async updateGame(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateGameDto
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admins can access this endpoint");
    }

    return this.gamesService.updateGame(id, dto);
  }
}
