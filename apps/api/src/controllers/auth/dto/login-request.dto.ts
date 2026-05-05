import { ApiProperty } from "@nestjs/swagger";
import type { LoginDto } from "@repo/types";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginRequestDto implements LoginDto {
  @ApiProperty()
  @IsEmail()
  email = "";

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password = "";
}
