import { useState, useEffect } from "react";
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
  const [flying, setFlying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { data: balanceData } = useWalletBalance();
  const bet = useCoinflipBet();
  const bets = useBets("coinflip");

  const balance = balanceData?.data?.balance ?? 0;

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setShowResult(true);
        setFlying(false);
        void bets.refetch();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleFlip = () => {
    const amount = parseInt(wager, 10);
    if (isNaN(amount) || amount <= 0) return;
    setResult(null);
    setShowResult(false);
    setFlying(true);
    bet.mutate(
      { wager: amount, side },
      {
        onSuccess: (data) => {
          setResult(data);
        },
        onError: () => {
          setFlying(false);
        }
      }
    );
  };

  const won = result
    ? result.coinFlip.chosenSide === result.coinFlip.landedSide
    : null;

  return (
    <div className="flex flex-col gap-6">
      <style>
        {`
          @keyframes coin-flip {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(720deg); }
          }
          .coin-flipping {
            animation: coin-flip 0.8s ease-in-out infinite;
          }
          @keyframes coin-reveal {
            0% { transform: rotateY(720deg); }
            100% { transform: rotateY(var(--land-rotation)); }
          }
          .coin-revealing {
            animation: coin-reveal 0.6s ease-out forwards;
          }
          .coin-perspective {
            perspective: 600px;
          }
          .coin-3d {
            transform-style: preserve-3d;
          }
          .coin-face {
            backface-visibility: hidden;
          }
          .coin-back {
            transform: rotateY(180deg);
          }
        `}
      </style>

      <Card>
        <CardHeader>
          <CardTitle>Flip a Coin</CardTitle>
          <CardDescription>Choose a side and place your bet</CardDescription>
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
              flying ||
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

      {(flying || showResult) && (
        <Card>
          <CardHeader>
            <CardTitle
              className={cn(
                "text-xl text-center",
                showResult && won
                  ? "text-green-600"
                  : showResult && !won
                    ? "text-red-500"
                    : "text-muted-foreground"
              )}
            >
              {!showResult ? "Flipping..." : won ? "You Won!" : "You Lost"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-6">
            <div className="coin-perspective">
              <div
                className={cn(
                  "coin-3d relative size-28",
                  flying && "coin-flipping",
                  showResult && "coin-revealing"
                )}
                style={
                  showResult && result
                    ? ({
                        "--land-rotation":
                          result.coinFlip.landedSide === CoinSide.HEADS
                            ? "0deg"
                            : "180deg"
                      } as React.CSSProperties)
                    : undefined
                }
              >
                <div className="coin-face absolute inset-0 rounded-full bg-yellow-400 border-4 border-yellow-500 flex items-center justify-center">
                  <span className="text-lg font-extrabold text-yellow-800">
                    H
                  </span>
                </div>
                <div className="coin-face coin-back absolute inset-0 rounded-full bg-yellow-500 border-4 border-yellow-600 flex items-center justify-center">
                  <span className="text-lg font-extrabold text-yellow-900">
                    T
                  </span>
                </div>
              </div>
            </div>

            {showResult && result && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-extrabold">
                  {result.coinFlip.landedSide}
                </span>
                <span className="text-sm text-muted-foreground">
                  {result.coinFlip.chosenSide === result.coinFlip.landedSide
                    ? `You won ${result.payout.toLocaleString()}`
                    : `You lost ${result.wager.toLocaleString()}`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showResult && result && (
        <Card>
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
            <CardDescription>Bet result</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
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
                betItem.coinFlip.chosenSide === betItem.coinFlip.landedSide;
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
