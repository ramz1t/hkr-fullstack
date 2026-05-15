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
import { useSetSeed } from "../../api";

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

const Profile = () => {
  const [newSeed, setNewSeed] = useState("");
  const [seedSet, setSeedSet] = useState<{
    serverSeedHash: string;
    clientSeed: string;
  } | null>(null);

  const setSeed = useSetSeed();

  const handleSetSeed = () => {
    if (!newSeed.trim()) return;
    setSeed.mutate(newSeed.trim(), {
      onSuccess: (data) => {
        setSeedSet(data);
        setNewSeed("");
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
          <CardTitle>Client Seed</CardTitle>
          <CardDescription>
            Change your client seed used for provably fair game outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>New Client Seed</Label>
            <Input
              placeholder="Enter your client seed..."
              value={newSeed}
              onChange={(e) => setNewSeed(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSetSeed}
            disabled={setSeed.isPending || !newSeed.trim()}
          >
            {setSeed.isPending ? "Setting..." : "Set Seed"}
          </Button>
          {seedSet && (
            <div className="flex flex-col gap-3 border border-border p-4 rounded">
              <DetailRow label="Server Seed Hash">
                {seedSet.serverSeedHash}
              </DetailRow>
              <DetailRow label="Client Seed">
                {seedSet.clientSeed}
              </DetailRow>
            </div>
          )}
          {setSeed.isError && (
            <p className="text-sm text-red-500">
              {setSeed.error?.message ?? "Failed to set seed"}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default Profile;
