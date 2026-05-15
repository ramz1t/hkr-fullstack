import { useEffect, type ReactNode } from "react";
import { type BetDto } from "@repo/types";
import { DetailRow } from "@repo/ui/details-row";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { cn } from "@repo/ui/utils";
import { LoadMoreTrigger } from "@repo/ui/load-more-trigger";
import { useBets } from "../../api";

interface BetDetail {
  title: string;
  value: string | number;
}

interface GameProps<TBet extends BetDto> {
  gameSlug: string; // used for get bets
  form: ReactNode;
  ui: ReactNode;
  result: TBet | null; // result from api
  formatOutcome: (bet: TBet) => { label: string; won: boolean }; // formats label for bets history table
  betDetails?: BetDetail[]; // extra fields rendered at the top of the Bet Details card
}

function Game<TBet extends BetDto>({
  gameSlug,
  form,
  ui,
  result,
  formatOutcome,
  betDetails
}: GameProps<TBet>) {
  const bets = useBets(gameSlug);
  // useBets is not generic; safe to cast since the slug determines the shape at runtime
  const history = bets.data as TBet[] | undefined;

  useEffect(() => {
    if (result) bets.refetch();
  }, [result, bets]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[1fr_1fr] gap-5">
        {form}
        {ui}
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {betDetails && betDetails.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {betDetails.map(({ title, value }) => (
                    <div key={title} className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {title}
                      </span>
                      <span className="text-base font-bold">{value}</span>
                    </div>
                  ))}
                </div>
                <hr className="border-border" />
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Bet ID">{result.id}</DetailRow>
              <DetailRow label="Nonce">{String(result.nonce)}</DetailRow>
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
          <CardDescription>Your recent bets</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {bets.isLoading ? (
            <div className="h-12 animate-pulse rounded bg-muted" />
          ) : history && history.length > 0 ? (
            history.map((bet) => {
              const { label, won } = formatOutcome(bet);
              return (
                <div
                  key={bet.id}
                  className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          won ? "text-green-600" : "text-red-500"
                        )}
                      >
                        {label}
                      </span>
                      <span
                        className={cn(
                          "text-sm tabular-nums",
                          won ? "text-green-600" : "text-muted-foreground"
                        )}
                      >
                        {won ? "+" : ""}
                        {bet.payout.toLocaleString()}
                      </span>
                    </div>
                    <code className="text-xs break-all text-muted-foreground font-mono">
                      {bet.id}
                    </code>
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                    {bet.wager.toLocaleString()}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No bets yet</p>
          )}
          <LoadMoreTrigger
            hasNextPage={bets.hasNextPage}
            isFetching={bets.isFetchingNextPage}
            fetch={bets.fetchNextPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Game;
