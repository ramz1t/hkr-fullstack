import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { DetailRow } from "@repo/ui/details-row";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { useBet, useRevealSeeds } from "../../api";
import { cn } from "@repo/ui/utils";
import { useSearchParams } from "react-router-dom";
import { GAMES } from "../../config";
import { BadgeCheck, BadgeX } from "lucide-react";

const Verify = () => {
  const [revealed, setRevealed] = useState<{
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
  } | null>(null);
  const [params] = useSearchParams();
  const [betId, setBetId] = useState(params.get("betId") ?? "");
  const [lookupId, setLookupId] = useState("");
  const [expected, setExpected] = useState<{
    hash: string;
    result: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const reveal = useRevealSeeds();
  const bet = useBet(lookupId || null);
  const gameConfig = bet.data
    ? GAMES.find((g) => g.slug === bet.data!.gameSlug)
    : undefined;

  const handleReveal = () => {
    reveal.mutate(undefined, {
      onSuccess: async (data) => {
        setRevealed({
          serverSeed: data.serverSeed,
          serverSeedHash: data.serverSeedHash,
          clientSeed: data.clientSeed
        });
        if (bet.data) {
          await bet.refetch();
        }
      }
    });
  };

  const computeExpected = async () => {
    const b = bet.data;
    if (!b?.serverSeed || !gameConfig) return;
    setVerifying(true);
    try {
      const str = b.serverSeed + b.clientSeed + b.nonce;
      const enc = new TextEncoder().encode(str);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      const hash = [...new Uint8Array(buf)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setExpected({ hash, result: gameConfig.computeOutcome(hash) });
    } finally {
      setVerifying(false);
    }
  };

  const handleLookup = () => {
    setLookupId(betId);
    setExpected(null);
  };

  return (
    <section className="mx-auto w-full px-4 py-10 flex flex-col gap-8 container">
      <Helmet>
        <title>Verify | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          Provably Fair
        </h1>
        <p className="mt-2 text-muted-foreground">
          Reveal server seeds and verify bet outcomes across all games
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reveal & Rotate Server Seed</CardTitle>
          <CardDescription>
            Revealing rotates the current server seed and exposes the old one so
            you can verify past bets
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button size="lg" onClick={handleReveal} disabled={reveal.isPending}>
            {reveal.isPending ? "Revealing..." : "Reveal & Rotate Seeds"}
          </Button>

          {reveal.isError && (
            <p className="text-sm text-red-500">
              {reveal.error?.message ?? "Failed to reveal seeds"}
            </p>
          )}

          {revealed && (
            <div className="flex flex-col gap-3 border border-border p-4 rounded">
              <DetailRow label="Old Server Seed">
                {revealed.serverSeed}
              </DetailRow>
              <DetailRow label="Old Server Seed Hash">
                {revealed.serverSeedHash}
              </DetailRow>
              <DetailRow label="Client Seed">{revealed.clientSeed}</DetailRow>
              <p className="text-sm text-muted-foreground">
                A new server seed has been generated. Use the revealed seed
                below to verify any past bet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verify a Bet</CardTitle>
          <CardDescription>
            Enter a bet ID to verify its outcome. The server seed must be
            revealed first.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Bet ID</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Paste bet ID..."
                value={betId}
                onChange={(e) => setBetId(e.target.value)}
              />
              <Button
                onClick={handleLookup}
                disabled={!betId.trim() || bet.isFetching}
              >
                {bet.isFetching ? "Loading..." : "Lookup"}
              </Button>
            </div>
          </div>

          {bet.isError && (
            <p className="text-sm text-red-500">
              {bet.error?.message ?? "Bet not found"}
            </p>
          )}

          {bet.data && (
            <div className="flex flex-col gap-4 border border-border p-4">
              <div className="grid grid-cols-2 gap-4">
                {gameConfig &&
                  gameConfig
                    .formatBetDetails(bet.data)
                    .map(({ title, value }) => (
                      <div key={title} className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          {title}
                        </span>
                        <span className="text-base font-bold">{value}</span>
                      </div>
                    ))}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Wager</span>
                  <span className="text-base font-bold tabular-nums">
                    {bet.data.wager.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Payout</span>
                  <span className="text-base font-bold tabular-nums">
                    {bet.data.payout.toLocaleString()}
                  </span>
                </div>
              </div>
              <hr className="border-border" />
              <div className="flex flex-col gap-3">
                <DetailRow label="Bet ID">{bet.data.id}</DetailRow>
                <DetailRow label="Nonce">{String(bet.data.nonce)}</DetailRow>
                <DetailRow label="Server Seed Hash">
                  {bet.data.serverSeedHash}
                </DetailRow>
                <DetailRow label="Client Seed">{bet.data.clientSeed}</DetailRow>
                <DetailRow label="Server Seed">
                  {bet.data.serverSeed ?? (
                    <span className="text-sm text-red-500">
                      Not revealed yet - reveal your seed above
                    </span>
                  )}
                </DetailRow>
              </div>

              {bet.data.serverSeed && gameConfig && (
                <>
                  <hr className="border-border" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">Verification</p>
                  </div>
                  {!expected && (
                    <Button
                      onClick={() => void computeExpected()}
                      disabled={verifying}
                    >
                      {verifying ? "Computing..." : "Verify Outcome"}
                    </Button>
                  )}
                  {expected &&
                    (() => {
                      const storedOutcome = gameConfig.getStoredOutcome(
                        bet.data!
                      );
                      const matches = storedOutcome === expected.result;
                      return (
                        <div className="flex flex-col gap-3 text-sm">
                          <DetailRow label="SHA-256 Hash">
                            {expected.hash}
                          </DetailRow>
                          <hr className="border-border" />
                          <DetailRow label="Algorithm">
                            {gameConfig.algorithm}
                          </DetailRow>
                          <hr className="border-border" />
                          {gameConfig
                            .explain(expected.hash)
                            .map(({ label, value }) => (
                              <DetailRow key={label} label={label}>
                                <strong>{value}</strong>
                              </DetailRow>
                            ))}
                          <hr className="border-border" />
                          <DetailRow label="Stored Result">
                            <strong>{storedOutcome}</strong>
                          </DetailRow>
                          <p
                            className={cn(
                              "text-base font-bold flex items-center gap-2",
                              matches ? "text-green-600" : "text-red-500"
                            )}
                          >
                            {matches ? (
                              <>
                                <BadgeCheck />
                                Result matches the bet outcome
                              </>
                            ) : (
                              <>
                                <BadgeX />
                                Result does NOT match
                              </>
                            )}
                          </p>
                        </div>
                      );
                    })()}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default Verify;
