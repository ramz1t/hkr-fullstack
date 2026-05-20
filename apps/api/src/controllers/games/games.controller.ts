import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards
} from "@nestjs/common";
import { GamesService } from "./games.service";
import { JwtAccessTokenGuard, RolesGuard } from "../../common/guards";
import { Roles } from "../../common/decorators";
import { UserRole } from "@repo/types";
import { UpdateGameDto } from "./dto/update-game.dto";

@Controller("games")
@UseGuards(JwtAccessTokenGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) { }

  @Get("")
  async findAll() {
    return this.gamesService.getAll();
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateGame(
    @Param("id") id: string,
    @Body() dto: UpdateGameDto
  ) {
    return this.gamesService.updateGame(id, dto);
  }
}
