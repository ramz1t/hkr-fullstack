import { useState, useEffect } from "react";
import type { SlotsBetDto } from "@repo/types";
import { useSlotsBet, useWalletBalance } from "../../../api";
import { Game } from "../../../components";
import SlotsForm from "./SlotsForm";
import SlotsUi from "./SlotsUi";
import { formatSlotsOutcome } from "./utils";

const Slots = () => {
  const [wager, setWager] = useState("");
  const [result, setResult] = useState<SlotsBetDto | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { data: balanceData, refetch: refetchBalance } = useWalletBalance();
  const bet = useSlotsBet();

  const balance = balanceData?.data?.balance ?? 0;

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setShowResult(true);
        setSpinning(false);
        refetchBalance();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, refetchBalance]);

  const handleSpin = () => {
    const amount = parseInt(wager, 10);
    if (isNaN(amount) || amount <= 0) return;
    setResult(null);
    setShowResult(false);
    setSpinning(true);
    bet.mutate(
      { wager: amount },
      {
        onSuccess: (data) => setResult(data),
        onError: () => setSpinning(false)
      }
    );
  };

  return (
    <Game
      gameSlug="slots"
      result={showResult ? result : null}
      formatOutcome={formatSlotsOutcome}
      form={
        <SlotsForm
          wager={wager}
          setWager={setWager}
          onSpin={handleSpin}
          isPending={bet.isPending}
          spinning={spinning}
          balance={balance}
          isError={bet.isError}
          errorMessage={bet.error?.message}
        />
      }
      ui={
        <SlotsUi spinning={spinning} showResult={showResult} result={result} />
      }
      betDetails={
        showResult && result
          ? [
              { title: "Outcome", value: result.slots.outcome },
              { title: "Main Line", value: result.slots.mainLine.join(" | ") }
            ]
          : undefined
      }
    />
  );
};

export default Slots;
