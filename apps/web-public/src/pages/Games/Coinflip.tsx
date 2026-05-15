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

const DetailRow = ({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    {typeof children === "string" ? (
      <code className="text-sm break-all bg-muted px-3 py-2 rounded select-all font-mono leading-relaxed">
        {children}
      </code>
    ) : (
      children
    )}
  </div>
);

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
          <div className="text-sm text-muted-foreground">
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
            <p className="text-sm text-red-500">
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
                "text-xl",
                won ? "text-green-600" : "text-red-500"
              )}
            >
              {won ? "You Won!" : "You Lost"}
            </CardTitle>
            <CardDescription>Bet result</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Chosen</span>
                <span className="text-base font-bold">
                  {result.coinFlip.chosenSide}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Landed</span>
                <span className="text-base font-bold">
                  {result.coinFlip.landedSide}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Wager</span>
                <span className="text-base font-bold tabular-nums">
                  {result.wager.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Payout</span>
                <span className="text-base font-bold tabular-nums">
                  {result.payout.toLocaleString()}
                </span>
              </div>
            </div>
            <hr className="border-border" />
            <div className="flex flex-col gap-3">
              <DetailRow label="Bet ID">{result.id}</DetailRow>
              <DetailRow label="Nonce">
                <code className="text-sm bg-muted px-3 py-2 rounded select-all font-mono">
                  {result.nonce}
                </code>
              </DetailRow>
              <DetailRow label="Server Seed Hash">
                {result.serverSeedHash}
              </DetailRow>
              <DetailRow label="Client Seed">{result.clientSeed}</DetailRow>
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
            <div className="h-12 animate-pulse rounded bg-muted" />
          ) : bets.data && bets.data.length > 0 ? (
            bets.data.map((betItem) => {
              const betWon =
                betItem.coinFlip.chosenSide ===
                betItem.coinFlip.landedSide;
              return (
                <div
                  key={betItem.id}
                  className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          betWon ? "text-green-600" : "text-red-500"
                        )}
                      >
                        {betItem.coinFlip.landedSide}
                      </span>
                      <span
                        className={cn(
                          "text-sm tabular-nums",
                          betWon ? "text-green-600" : "text-muted-foreground"
                        )}
                      >
                        {betWon ? "+" : ""}
                        {betItem.payout.toLocaleString()}
                      </span>
                    </div>
                    <code className="text-xs break-all text-muted-foreground font-mono">
                      {betItem.id}
                    </code>
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                    {betItem.wager.toLocaleString()}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No bets yet</p>
          )}
          {bets.isFetchingNextPage && (
            <div className="h-8 animate-pulse rounded bg-muted" />
          )}
          {bets.hasNextPage && !bets.isFetchingNextPage && (
            <Button
              variant="outline"
              size="sm"
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
