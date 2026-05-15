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
import { useCoinflipBet, useWalletBalance, useBets } from "../../api";
import { cn } from "@repo/ui/utils";

const Coinflip = () => {
  const [side, setSide] = useState<CoinSide>(CoinSide.HEADS);
  const [wager, setWager] = useState("");
  const [result, setResult] = useState<CoinflipBetDto | null>(null);
  const { data: balanceData } = useWalletBalance();
  const bet = useCoinflipBet();
  const bets = useBets("coinflip");

  const balance = balanceData?.data?.balance ?? 0;

  const handleFlip = () => {
    const amount = parseInt(wager, 10);
    if (isNaN(amount) || amount <= 0) return;
    setResult(null);
    bet.mutate(
      { wager: amount, side },
      {
        onSuccess: (data) => {
          setResult(data);
          void bets.refetch();
        }
      }
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
                "text-lg",
                won ? "text-green-600" : "text-red-500"
              )}
            >
              {won ? "You Won!" : "You Lost"}
            </CardTitle>
            <CardDescription>Bet result</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Chosen</span>
                <span className="font-medium">{result.coinFlip.chosenSide}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Landed</span>
                <span className="font-medium">{result.coinFlip.landedSide}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Wager</span>
                <span className="font-medium">
                  {result.wager.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Payout</span>
                <span className="font-medium">
                  {result.payout.toLocaleString()}
                </span>
              </div>
            </div>
            <hr className="border-border" />
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Bet ID</span>
                <code className="text-xs break-all bg-muted p-1 rounded select-all">
                  {result.id}
                </code>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Nonce</span>
                <code className="text-xs bg-muted p-1 rounded select-all">
                  {result.nonce}
                </code>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Server Seed Hash
                </span>
                <code className="text-xs break-all bg-muted p-1 rounded select-all">
                  {result.serverSeedHash}
                </code>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Client Seed
                </span>
                <code className="text-xs break-all bg-muted p-1 rounded select-all">
                  {result.clientSeed}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bet History</CardTitle>
          <CardDescription>Your recent coinflip bets</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {bets.isLoading ? (
            <div className="h-10 animate-pulse rounded bg-muted" />
          ) : bets.data && bets.data.length > 0 ? (
            bets.data.map((betItem) => {
              const betWon = betItem.coinFlip.chosenSide === betItem.coinFlip.landedSide;
              return (
                <div
                  key={betItem.id}
                  className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={betWon ? "text-green-600" : "text-red-500"}>
                        {betItem.coinFlip.landedSide}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {betWon ? "+" : ""}{betItem.payout.toLocaleString()}
                      </span>
                    </div>
                    <code className="text-[10px] text-muted-foreground truncate">
                      {betItem.id}
                    </code>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {betItem.wager.toLocaleString()}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground">No bets yet</p>
          )}
          {bets.isFetchingNextPage && (
            <div className="h-6 animate-pulse rounded bg-muted" />
          )}
          {bets.hasNextPage && !bets.isFetchingNextPage && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => void bets.fetchNextPage()}
            >
              Load more
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Coinflip;
