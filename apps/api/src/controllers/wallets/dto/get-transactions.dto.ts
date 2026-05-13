import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class GetPaginatedTransactionsDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize = 10;
}