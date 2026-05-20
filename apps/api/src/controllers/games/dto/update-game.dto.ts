import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, Min, Max, IsOptional } from "class-validator";

export class UpdateGameDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  rtp?: number;
}
