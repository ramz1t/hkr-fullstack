import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { GetPaginatedDto } from "../../../common/dto/get-paginated.dto";

export class GetBetsDto extends GetPaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  game?: string;
}
