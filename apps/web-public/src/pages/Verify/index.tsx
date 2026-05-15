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
              <DetailRow label="Client Seed">
                {revealed.clientSeed}
              </DetailRow>
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
            <div className="flex flex-col gap-4 border border-border p-4 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Chosen Side
                  </span>
                  <span className="text-base font-bold">
                    {bet.data.coinFlip.chosenSide}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Landed Side
                  </span>
                  <span className="text-base font-bold">
                    {bet.data.coinFlip.landedSide}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Wager
                  </span>
                  <span className="text-base font-bold tabular-nums">
                    {bet.data.wager.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Payout
                  </span>
                  <span className="text-base font-bold tabular-nums">
                    {bet.data.payout.toLocaleString()}
                  </span>
                </div>
              </div>
              <hr className="border-border" />
              <div className="flex flex-col gap-3">
                <DetailRow label="Bet ID">{bet.data.id}</DetailRow>
                <DetailRow label="Nonce">
                  <code className="text-sm bg-muted px-3 py-2 rounded select-all font-mono">
                    {bet.data.nonce}
                  </code>
                </DetailRow>
                <DetailRow label="Server Seed Hash">
                  {bet.data.serverSeedHash}
                </DetailRow>
                <DetailRow label="Client Seed">
                  {bet.data.clientSeed}
                </DetailRow>
                <DetailRow label="Server Seed">
                  {bet.data.serverSeed ?? (
                    <span className="text-sm text-red-500">
                      Not revealed yet — reveal your seed above
                    </span>
                  )}
                </DetailRow>
              </div>

              {bet.data.serverSeed && (
                <>
                  <hr className="border-border" />
                  <p className="text-sm font-semibold">Verification</p>
                  {!expected && (
                    <Button
                      size="sm"
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
                      <div className="flex flex-col gap-3 text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            SHA-256(
                          </span>
                          <code className="bg-muted px-1 font-mono">
                            serverSeed
                          </code>
                          <span className="text-muted-foreground"> + </span>
                          <code className="bg-muted px-1 font-mono">
                            clientSeed
                          </code>
                          <span className="text-muted-foreground"> + </span>
                          <code className="bg-muted px-1 font-mono">
                            nonce
                          </code>
                          <span className="text-muted-foreground">
                            ) =
                          </span>
                        </p>
                        <code className="text-sm break-all bg-muted p-3 rounded select-all font-mono leading-relaxed">
                          {expected.hash}
                        </code>
                        <p>
                          First 2 hex chars:{" "}
                          <code className="bg-muted px-2 py-0.5 rounded font-mono">
                            {expected.firstTwo}
                          </code>
                        </p>
                        <p>
                          <code className="bg-muted px-2 py-0.5 rounded font-mono">
                            {expected.firstTwo}
                          </code>
                          {" (hex) = "}
                          <strong>{parseInt(expected.firstTwo, 16)}</strong>
                          {" (dec) → "}
                          {parseInt(expected.firstTwo, 16) % 2 === 0
                            ? "even"
                            : "odd"}
                          {" → "}
                          <strong>{expected.result}</strong>
                        </p>
                        <p
                          className={cn(
                            "text-base font-bold",
                            matches
                              ? "text-green-600"
                              : "text-red-500"
                          )}
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
