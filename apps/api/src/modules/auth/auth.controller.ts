import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  async login() {}

  @Post("/register")
  async register() {}

  @Post("/refresh")
  async refresh() {}

  @Post("/logout")
  async logout() {}
}
