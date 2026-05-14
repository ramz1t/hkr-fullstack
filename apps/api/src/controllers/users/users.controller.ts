import { Controller, ForbiddenException, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import { UserRole, type JwtPayload } from "@repo/types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get("me")
  @UseGuards(JwtAccessTokenGuard)
  async me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get("")
  @UseGuards(JwtAccessTokenGuard)
  async findAll(@CurrentUser() user: JwtPayload) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admins can access this endpoint");
    }

    return this.usersService.getAll();
  }

  @Patch(":id/ban")
  @UseGuards(JwtAccessTokenGuard)
  async banUser(@CurrentUser() user: JwtPayload, @Param("id") userId: string) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admins can access this endpoint");
    }

    await this.usersService.banUser(userId);
  }

  @Patch(":id/unban")
  @UseGuards(JwtAccessTokenGuard)
  async unbanUser(@CurrentUser() user: JwtPayload, @Param("id") userId: string) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admins can access this endpoint");
    }

    await this.usersService.unbanUser(userId);
  }
}
