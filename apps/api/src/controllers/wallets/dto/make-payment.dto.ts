import { ApiProperty } from "@nestjs/swagger";
import { PaymentAction } from "@repo/types";
import { IsEnum, IsInt, Min } from "class-validator";

export class MakePaymentDto {
  @ApiProperty({ enum: PaymentAction })
  @IsEnum(PaymentAction)
  action: PaymentAction = PaymentAction.DEPOSIT;

  @ApiProperty()
  @IsInt()
  @Min(100)
  amount: number = 100;
}
