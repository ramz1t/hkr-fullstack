import { useState, useEffect } from "react";
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
import { useSetSeed, useCurrentSeeds } from "../../api";

const Profile = () => {
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
    <section className="mx-auto w-full px-4 py-10 flex flex-col gap-8 container">
      <Helmet>
        <title>Profile | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <Card>
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
              <div className="flex flex-col gap-1.5">
                <Label>Server Seed Hash</Label>
                <code className="text-sm break-all bg-muted px-3 py-2 rounded select-all font-mono leading-relaxed">
                  {serverSeedHash}
                </code>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Client Seed</Label>
                <Input
                  placeholder="Enter your client seed..."
                  value={clientSeed}
                  onChange={(e) => setClientSeed(e.target.value)}
                />
              </div>
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
    </section>
  );
};

export default Profile;
