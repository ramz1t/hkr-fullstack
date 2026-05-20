import { PaymentAction } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { FormField } from "@repo/ui/form-field";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useWalletBalance, useWalletPayment } from "../../api";
import { cn } from "@repo/ui/utils";
import { BanknoteArrowDown, BanknoteArrowUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@repo/ui/dropdown-menu";

const WALLET_TYPES = ["bitcoin", "etherium", "ton"];

const Funds = () => {
  const [action, setAction] = useState<PaymentAction>(PaymentAction.DEPOSIT);
  const [amount, setAmount] = useState<string>("0");
  const [walletType, setWalletType] = useState<string | undefined>();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { data } = useWalletBalance();
  const balance = data?.data?.balance;
  const { mutate, isPending, error } = useWalletPayment();

  const handleOperation = useCallback(() => {
    if (confirm("Here goes payment gateways"))
      mutate({ action, amount: parseInt(amount) });
  }, [action, mutate, amount]);

  return (
    <section className="page-container">
      <Helmet>
        <title>Funds | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          Funds
        </h1>
        <p className="mt-2 text-muted-foreground">
          Deposit or withdraw your funds
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant={action === PaymentAction.DEPOSIT ? "default" : "outline"}
              size="lg"
              className="flex-1"
              onClick={() => setAction(PaymentAction.DEPOSIT)}
            >
              <BanknoteArrowUp /> {PaymentAction.DEPOSIT}
            </Button>
            <Button
              variant={
                action === PaymentAction.WITHDRAWAL ? "default" : "outline"
              }
              size="lg"
              className="flex-1"
              onClick={() => setAction(PaymentAction.WITHDRAWAL)}
            >
              <BanknoteArrowDown /> {PaymentAction.WITHDRAWAL}
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="grid gap-2 w-48">
              <p className="text-xs leading-none select-none min-h-5 flex items-center">
                Wallet Type
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{walletType ?? "Select"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={walletType}
                      onValueChange={setWalletType}
                    >
                      {WALLET_TYPES.map((type) => (
                        <DropdownMenuRadioItem key={type} value={type}>
                          {type}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <FormField
              label="Wallet Address"
              type="string"
              placeholder="0xAcF36260817d1c78C471406BdE482177a1935071"
              value={walletAddress}
              className="w-full"
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>
          <div>
            <FormField
              label="Amount (min. 100)"
              type="number"
              min="1"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p
              className={cn(
                "text-sm text-muted-foreground transition-all overflow-hidden",
                action === PaymentAction.WITHDRAWAL ? "h-5 mt-4" : "h-0 mt-0"
              )}
            >
              Balance: {data?.data?.balance?.toLocaleString()}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleOperation}
            disabled={
              !balance ||
              !walletType ||
              !walletAddress ||
              isPending ||
              !amount ||
              parseInt(amount, 10) <= 100 ||
              (parseInt(amount, 10) > balance &&
                action === PaymentAction.WITHDRAWAL)
            }
          >
            {isPending ? "Pending..." : "Submit"}
          </Button>
          {error && (
            <p className="text-sm text-red-500">{error ?? "Bet failed"}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default Funds;
