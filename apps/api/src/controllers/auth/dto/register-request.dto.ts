import { ApiProperty } from "@nestjs/swagger";
import type { RegisterDto } from "@repo/types";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterRequestDto implements RegisterDto {
  @ApiProperty()
  @IsEmail()
  email = "";

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password = "";
}
