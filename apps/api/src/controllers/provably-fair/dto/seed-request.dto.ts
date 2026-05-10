import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class SeedRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  clientSeed = "";
}
