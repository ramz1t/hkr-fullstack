import { useState } from "react";
import { CoinSide, type CoinflipBetDto } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { useCoinflipBet, useWalletBalance } from "../../api";
import { cn } from "@repo/ui/utils";

const Coinflip = () => {
  const [side, setSide] = useState<CoinSide>(CoinSide.HEADS);
  const [wager, setWager] = useState("");
  const [result, setResult] = useState<CoinflipBetDto | null>(null);
  const { data: balanceData } = useWalletBalance();
  const bet = useCoinflipBet();

  const balance = balanceData?.data?.balance ?? 0;

  const handleFlip = () => {
    const amount = parseInt(wager, 10);
    if (isNaN(amount) || amount <= 0) return;
    setResult(null);
    bet.mutate(
      { wager: amount, side },
      { onSuccess: (data) => setResult(data) }
    );
  };

  const won = result
    ? result.coinFlip.chosenSide === result.coinFlip.landedSide
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Flip a Coin</CardTitle>
          <CardDescription>
            Choose a side and place your bet
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant={side === CoinSide.HEADS ? "default" : "outline"}
              size="lg"
              className="flex-1"
              onClick={() => setSide(CoinSide.HEADS)}
            >
              HEADS
            </Button>
            <Button
              variant={side === CoinSide.TAILS ? "default" : "outline"}
              size="lg"
              className="flex-1"
              onClick={() => setSide(CoinSide.TAILS)}
            >
              TAILS
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Wager</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter amount..."
              value={wager}
              onChange={(e) => setWager(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Balance: {balance.toLocaleString()}
          </div>
          <Button
            size="lg"
            onClick={handleFlip}
            disabled={
              bet.isPending ||
              !wager ||
              parseInt(wager, 10) <= 0 ||
              parseInt(wager, 10) > balance
            }
          >
            {bet.isPending ? "Flipping..." : "Flip Coin"}
          </Button>
          {bet.isError && (
            <p className="text-xs text-red-500">
              {bet.error?.message ?? "Bet failed"}
            </p>
          )}
        </CardContent>
      </Card>

      {bet.isPending && (
        <div className="flex items-center justify-center py-8">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle
              className={cn(
                won ? "text-green-600" : "text-red-500"
              )}
            >
              {won ? "You Won!" : "You Lost"}
            </CardTitle>
            <CardDescription>Bet result</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chosen</span>
              <span className="font-medium">{result.coinFlip.chosenSide}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Landed</span>
              <span className="font-medium">{result.coinFlip.landedSide}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wager</span>
              <span className="font-medium">
                {result.wager.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payout</span>
              <span className="font-medium">
                {result.payout.toLocaleString()}
              </span>
            </div>
            <hr className="border-border my-1" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bet ID</span>
              <span className="font-mono text-[10px] truncate max-w-[200px]">
                {result.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nonce</span>
              <span className="font-mono">{result.nonce}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Server Seed Hash</span>
              <span className="font-mono text-[10px] truncate max-w-[200px]">
                {result.serverSeedHash}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client Seed</span>
              <span className="font-mono text-[10px] truncate max-w-[200px]">
                {result.clientSeed}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Coinflip;
