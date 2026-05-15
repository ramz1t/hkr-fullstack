import { useState, useEffect } from "react";
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
import { useSetSeed, useCurrentSeeds } from "../../api";
import { DetailRow } from "@repo/ui/details-row";
import { Helmet } from "react-helmet-async";

const Seeds = () => {
  const { data: currentSeeds, isLoading } = useCurrentSeeds();
  const [clientSeed, setClientSeed] = useState("");
  const [serverSeedHash, setServerSeedHash] = useState("");

  const setSeed = useSetSeed();

  useEffect(() => {
    if (currentSeeds) {
      setClientSeed(currentSeeds.clientSeed);
      setServerSeedHash(currentSeeds.serverSeedHash);
    }
  }, [currentSeeds]);

  const handleSave = () => {
    if (!clientSeed.trim()) return;
    setSeed.mutate(clientSeed.trim(), {
      onSuccess: (data) => {
        setServerSeedHash(data.serverSeedHash);
        setClientSeed(data.clientSeed);
      }
    });
  };

  return (
    <Card className="m-5">
      <Helmet>
        <title>Seeds | CasinoApp</title>
      </Helmet>
      <CardHeader>
        <CardTitle>Provably Fair Seeds</CardTitle>
        <CardDescription>
          Your seeds determine game outcomes. Change your client seed at any
          time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <DetailRow label="Server Seed Hash">{serverSeedHash}</DetailRow>
            <DetailRow label="Client Seed">
              <Input
                placeholder="Enter your client seed..."
                className="h-10 font-mono"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
              />
            </DetailRow>
            <Button
              onClick={handleSave}
              disabled={setSeed.isPending || !clientSeed.trim()}
            >
              {setSeed.isPending ? "Saving..." : "Save"}
            </Button>
            {setSeed.isError && (
              <p className="text-sm text-red-500">
                {setSeed.error?.message ?? "Failed to save"}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Seeds;
