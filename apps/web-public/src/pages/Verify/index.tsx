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
import { BadgeCheck, BadgeX, ShieldCheck, ShieldAlert } from "lucide-react";

const sha256 = async (str: string): Promise<string> => {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

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
    seedHash: string;
    seedHashValid: boolean;
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
      const seedHash = await sha256(b.serverSeed);
      const seedHashValid = seedHash === b.serverSeedHash;

      const hash = await sha256(b.serverSeed + b.clientSeed + b.nonce);
      setExpected({
        hash,
        result: gameConfig.computeOutcome(hash),
        seedHash,
        seedHashValid
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleLookup = () => {
    setLookupId(betId);
    setExpected(null);
  };

  return (
    <section className="page-container">
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
            <div className="grid md:grid-cols-2 gap-y-3 gap-x-5 border border-border p-4 rounded">
              <DetailRow label="Old Server Seed">
                {revealed.serverSeed}
              </DetailRow>
              <DetailRow label="Old Server Seed Hash">
                {revealed.serverSeedHash}
              </DetailRow>
              <DetailRow label="Client Seed">{revealed.clientSeed}</DetailRow>
              <p className="text-sm text-muted-foreground col-span-full">
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
              <div className="grid md:grid-cols-2 gap-y-3 gap-x-5">
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
                      const storedOutcome =
                        gameConfig.getStoredOutcome(bet.data!);
                      const outcomeMatches = storedOutcome === expected.result;
                      const allValid = expected.seedHashValid && outcomeMatches;
                      return (
                        <div className="flex flex-col gap-3 text-sm">
                          <DetailRow label="SHA-256(serverSeed)">
                            {expected.seedHash}
                          </DetailRow>
                          <DetailRow label="Stored Seed Hash">
                            {bet.data!.serverSeedHash}
                          </DetailRow>
                          <p
                            className={cn(
                              "text-base font-bold flex items-center gap-2",
                              expected.seedHashValid
                                ? "text-green-600"
                                : "text-red-500"
                            )}
                          >
                            {expected.seedHashValid ? (
                              <>
                                <ShieldCheck />
                                Seed hash matches – seed is authentic
                              </>
                            ) : (
                              <>
                                <ShieldAlert />
                                Seed hash mismatch – seed has been tampered with
                              </>
                            )}
                          </p>
                          <hr className="border-border" />
                          <DetailRow label="SHA-256(seed + clientSeed + nonce)">
                            {expected.hash}
                          </DetailRow>
                          <DetailRow label="Algorithm">
                            {gameConfig.algorithm}
                          </DetailRow>
                          <hr className="border-border" />
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold">Breakdown</p>
                          </div>
                          {gameConfig
                            .describeSteps(expected.hash)
                            .map((step, i) => (
                              <div key={i} className="flex items-center">
                                <p className="font-heading font-bold border-r border-border pl-1.5 pr-4 mr-4 h-10 flex items-center">
                                  {i + 1}
                                </p>
                                <DetailRow label={step.instruction}>
                                  <strong>{step.result}</strong>
                                </DetailRow>
                              </div>
                            ))}
                          <hr className="border-border" />
                          <DetailRow label="Stored Result">
                            <strong>{storedOutcome}</strong>
                          </DetailRow>
                          <p
                            className={cn(
                              "text-base font-bold flex items-center gap-2",
                              allValid ? "text-green-600" : "text-red-500"
                            )}
                          >
                            {allValid ? (
                              <>
                                <BadgeCheck />
                                Result matches the bet outcome
                              </>
                            ) : (
                              <>
                                <BadgeX />
                                {expected.seedHashValid
                                  ? "Result does NOT match"
                                  : "Seed verification failed"}
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
