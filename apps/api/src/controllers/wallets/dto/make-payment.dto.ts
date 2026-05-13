import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, Min } from "class-validator";

export enum PaymentAction {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
}

export class MakePaymentDto {
  @ApiProperty({ enum: PaymentAction })
  @IsEnum(PaymentAction)
  action: PaymentAction = PaymentAction.DEPOSIT;

  @ApiProperty()
  @IsInt()
  @Min(100)
  amount: number = 100;
}
