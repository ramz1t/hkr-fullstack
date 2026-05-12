import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min, IsEnum } from "class-validator";
import { CoinSide } from "@repo/types";

export class PlaceCoinflipBetDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  wager = 0;

  @ApiProperty({ enum: CoinSide })
  @IsEnum(CoinSide)
  side: CoinSide = CoinSide.HEADS;
}
