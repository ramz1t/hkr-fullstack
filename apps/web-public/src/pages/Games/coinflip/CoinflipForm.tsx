import { CoinSide } from "@repo/types";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { FormField } from "@repo/ui/form-field";

interface CoinflipFormProps {
  side: CoinSide;
  setSide: (s: CoinSide) => void;
  wager: string;
  setWager: (w: string) => void;
  onFlip: () => void;
  isPending: boolean;
  flying: boolean;
  balance: number;
  isError: boolean;
  errorMessage?: string;
}

const CoinflipForm = ({
  side,
  setSide,
  wager,
  setWager,
  onFlip,
  isPending,
  flying,
  balance,
  isError,
  errorMessage
}: CoinflipFormProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Flip a Coin</CardTitle>
      <CardDescription>Choose a side and place your bet</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={side === CoinSide.HEADS ? "default" : "outline"}
          size="lg"
          className="flex-1"
          onClick={() => setSide(CoinSide.HEADS)}
        >
          HEADS
        </Button>
        <Button
          variant={side === CoinSide.TAILS ? "default" : "outline"}
          size="lg"
          className="flex-1"
          onClick={() => setSide(CoinSide.TAILS)}
        >
          TAILS
        </Button>
      </div>
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
      <Button
        size="lg"
        onClick={onFlip}
        disabled={
          isPending ||
          flying ||
          !wager ||
          parseInt(wager, 10) <= 0 ||
          parseInt(wager, 10) > balance
        }
      >
        {isPending ? "Flipping..." : "Flip Coin"}
      </Button>
      {isError && (
        <p className="text-sm text-red-500">{errorMessage ?? "Bet failed"}</p>
      )}
    </CardContent>
  </Card>
);

export default CoinflipForm;
