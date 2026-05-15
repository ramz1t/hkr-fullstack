import { useState } from "react";
import { Helmet } from "react-helmet-async";
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
import { useBet, useRevealSeeds } from "../../api";

const Verify = () => {
  const [revealed, setRevealed] = useState<{
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
  } | null>(null);
  const [betId, setBetId] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [expected, setExpected] = useState<{
    hash: string;
    firstTwo: string;
    result: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const reveal = useRevealSeeds();
  const bet = useBet(lookupId || null);

  const handleReveal = () => {
    reveal.mutate(undefined, {
      onSuccess: (data) => {
        setRevealed({
          serverSeed: data.serverSeed,
          serverSeedHash: data.serverSeedHash,
          clientSeed: data.clientSeed
        });
      }
    });
  };

  const computeExpected = async () => {
    const b = bet.data;
    if (!b?.serverSeed) return;
    setVerifying(true);
    try {
      const str = b.serverSeed + b.clientSeed + b.nonce;
      const enc = new TextEncoder().encode(str);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      const hash = [...new Uint8Array(buf)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const firstTwo = hash.substring(0, 2);
      const isEven = parseInt(firstTwo, 16) % 2 === 0;
      setExpected({
        hash,
        firstTwo,
        result: isEven ? "HEADS" : "TAILS"
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
            Revealing rotates the current server seed and exposes the old one
            so you can verify past bets
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            size="lg"
            onClick={handleReveal}
            disabled={reveal.isPending}
          >
            {reveal.isPending ? "Revealing..." : "Reveal & Rotate Seeds"}
          </Button>

          {reveal.isError && (
            <p className="text-xs text-red-500">
              {reveal.error?.message ?? "Failed to reveal seeds"}
            </p>
          )}

          {revealed && (
            <div className="flex flex-col gap-2 text-xs border border-border p-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Old Server Seed</span>
                <span className="font-mono text-[10px] break-all max-w-[300px] text-right">
                  {revealed.serverSeed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Old Server Seed Hash
                </span>
                <span className="font-mono text-[10px] break-all max-w-[300px] text-right">
                  {revealed.serverSeedHash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client Seed</span>
                <span className="font-mono text-[10px] break-all max-w-[300px] text-right">
                  {revealed.clientSeed}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
            <p className="text-xs text-red-500">
              {bet.error?.message ?? "Bet not found"}
            </p>
          )}

          {bet.data && (
            <div className="flex flex-col gap-3 text-sm border border-border p-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Chosen Side</span>
                  <span className="font-medium">{bet.data.coinFlip.chosenSide}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Landed Side</span>
                  <span className="font-medium">{bet.data.coinFlip.landedSide}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Wager</span>
                  <span className="font-medium">{bet.data.wager.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Payout</span>
                  <span className="font-medium">{bet.data.payout.toLocaleString()}</span>
                </div>
              </div>
              <hr className="border-border" />
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Bet ID</span>
                  <code className="text-xs break-all bg-muted p-1 rounded select-all">
                    {bet.data.id}
                  </code>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Nonce</span>
                  <code className="text-xs bg-muted p-1 rounded select-all">{bet.data.nonce}</code>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Server Seed Hash</span>
                  <code className="text-xs break-all bg-muted p-1 rounded select-all">
                    {bet.data.serverSeedHash}
                  </code>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Client Seed</span>
                  <code className="text-xs break-all bg-muted p-1 rounded select-all">
                    {bet.data.clientSeed}
                  </code>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Server Seed</span>
                  {bet.data.serverSeed ? (
                    <code className="text-xs break-all bg-muted p-1 rounded select-all">
                      {bet.data.serverSeed}
                    </code>
                  ) : (
                    <span className="text-xs text-red-500">Not revealed yet</span>
                  )}
                </div>
              </div>

              {bet.data.serverSeed && (
                <>
                  <hr className="border-border my-1" />
                  <p className="text-xs font-semibold">Verification</p>
                  {!expected && (
                    <Button
                      size="xs"
                      onClick={() => void computeExpected()}
                      disabled={verifying}
                    >
                      {verifying ? "Computing..." : "Verify Outcome"}
                    </Button>
                  )}
                  {expected && (() => {
                    const matches =
                      bet.data.coinFlip.landedSide === expected.result;
                    return (
                      <div className="flex flex-col gap-1 text-[10px]">
                        <p>
                          SHA-256(serverSeed + clientSeed + nonce) =
                        </p>
                        <code className="break-all bg-muted p-1 rounded">
                          {expected.hash}
                        </code>
                        <p>
                          First 2 hex chars:{" "}
                          <code className="bg-muted px-1">
                            {expected.firstTwo}
                          </code>
                        </p>
                        <p>
                          {expected.firstTwo} (hex) ={" "}
                          {parseInt(expected.firstTwo, 16)} (dec) →{" "}
                          {parseInt(expected.firstTwo, 16) % 2 === 0
                            ? "even"
                            : "odd"}
                          → {expected.result}
                        </p>
                        <p
                          className={
                            matches
                              ? "text-green-600 font-semibold"
                              : "text-red-500 font-semibold"
                          }
                        >
                          {matches
                            ? "✓ Result matches the bet outcome"
                            : "✗ Result does NOT match"}
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
