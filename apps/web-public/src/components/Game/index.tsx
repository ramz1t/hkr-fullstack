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
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty
} from "@repo/ui/table";
import { UUID } from "@repo/ui/uuid";
import { cn } from "@repo/ui/utils";
import { LoadMoreTrigger } from "@repo/ui/load-more-trigger";
import { useBets } from "../../api";
import { Link } from "react-router-dom";
import { buttonVariants } from "@repo/ui/button";
import { BadgeCheck } from "lucide-react";

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
    if (result) void bets.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

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
              <DetailRow label="Bet ID">
                <div className="flex gap-2">
                  <code className="text-sm break-all bg-muted px-3 py-2 select-all font-mono leading-relaxed grow">
                    {result.id}
                  </code>
                  <Link
                    className={
                      "min-h-10 " +
                      buttonVariants({
                        variant: "default",
                        size: "lg"
                      })
                    }
                    to={`/verify?betId=${result.id}`}
                  >
                    <BadgeCheck />
                    Verify
                  </Link>
                </div>
              </DetailRow>
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
        <CardContent className="p-0">
          {bets.isLoading ? (
            <div className="h-12 animate-pulse rounded bg-muted mx-6 my-4" />
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Win</TableHead>
                  <TableHead>Bet</TableHead>
                  <TableHead>UUID</TableHead>
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {history && history.length > 0 ? (
                  history.map((bet) => {
                    const { label, won } = formatOutcome(bet);
                    return (
                      <TableRow key={bet.id}>
                        <TableCell>
                          <span
                            className={cn(
                              "font-bold",
                              won ? "text-green-600" : "text-red-500"
                            )}
                          >
                            {label}
                          </span>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "tabular-nums",
                            won ? "text-green-600" : "text-muted-foreground"
                          )}
                        >
                          {won ? "+" : ""}
                          {bet.payout.toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {bet.wager.toLocaleString()}
                        </TableCell>
                        <TableCell className="flex items-center">
                          <UUID value={bet.id} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableEmpty>No bets yet</TableEmpty>
                )}
              </TableBody>
            </Table>
          )}
          <div className="px-4 py-2">
            <LoadMoreTrigger
              hasNextPage={bets.hasNextPage}
              isFetching={bets.isFetchingNextPage}
              fetch={bets.fetchNextPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Game;
