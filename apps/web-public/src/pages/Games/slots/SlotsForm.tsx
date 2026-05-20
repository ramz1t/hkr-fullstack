import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { FormField } from "@repo/ui/form-field";

interface SlotsFormProps {
  wager: string;
  setWager: (w: string) => void;
  onSpin: () => void;
  isPending: boolean;
  spinning: boolean;
  balance: number;
  isError: boolean;
  errorMessage?: string;
}

const SlotsForm = ({
  wager,
  setWager,
  onSpin,
  isPending,
  spinning,
  balance,
  isError,
  errorMessage
}: SlotsFormProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Spin the Reels</CardTitle>
      <CardDescription>Place your bet and spin to win</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <FormField
        label="Wager"
        type="number"
        min="1"
        placeholder="Enter amount..."
        value={wager}
        onChange={(e) => setWager(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">
        Balance: {balance.toLocaleString()}
      </p>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>2 of a kind adjacent on main line – 2x</p>
        <p>3 of a kind on main line – 10x</p>
        <p>3 diamonds on main line – 100x</p>
      </div>
      <Button
        size="lg"
        onClick={onSpin}
        disabled={
          isPending ||
          spinning ||
          !wager ||
          parseInt(wager, 10) <= 0 ||
          parseInt(wager, 10) > balance
        }
      >
        {isPending || spinning ? "Spinning…" : "Spin"}
      </Button>
      {isError && (
        <p className="text-sm text-red-500">{errorMessage ?? "Spin failed"}</p>
      )}
    </CardContent>
  </Card>
);

export default SlotsForm;
