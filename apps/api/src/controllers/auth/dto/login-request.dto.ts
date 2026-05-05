import { ApiProperty } from "@nestjs/swagger";
import type { LoginDto } from "@repo/types";
import { IsEmail, IsString } from "class-validator";

export class LoginRequestDto implements LoginDto {
  @ApiProperty()
  @IsEmail()
  email = "";

  @ApiProperty()
  @IsString()
  password = "";
}
