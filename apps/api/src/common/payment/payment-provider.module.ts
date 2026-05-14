import { Module, Global } from "@nestjs/common";
import { PaymentProviderService } from "./payment-provider.service";

@Global()
@Module({
  providers: [PaymentProviderService],
  exports: [PaymentProviderService]
})
export class PaymentProviderModule { }
