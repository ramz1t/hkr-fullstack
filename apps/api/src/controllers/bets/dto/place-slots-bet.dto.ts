import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class PlaceSlotsBetDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  wager = 0;
}
