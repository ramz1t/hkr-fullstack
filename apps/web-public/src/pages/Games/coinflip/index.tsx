import { useState, useEffect } from "react";
import { CoinSide, type CoinflipBetDto } from "@repo/types";
import { useCoinflipBet, useWalletBalance } from "../../../api";
import { Game } from "../../../components";
import CoinflipForm from "./CoinflipForm";
import CoinflipUi from "./CoinflipUi";
import { formatCoinflipOutcome } from "./utils";

const Coinflip = () => {
  const [side, setSide] = useState<CoinSide>(CoinSide.HEADS);
  const [wager, setWager] = useState("");
  const [result, setResult] = useState<CoinflipBetDto | null>(null);
  const [flying, setFlying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { data: balanceData, refetch: refetchBalance } = useWalletBalance();
  const bet = useCoinflipBet();

  const balance = balanceData?.data?.balance ?? 0;
  const won = result
    ? result.coinFlip.chosenSide === result.coinFlip.landedSide
    : null;

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setShowResult(true);
        setFlying(false);
        refetchBalance();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [result, refetchBalance]);

  const handleFlip = () => {
    const amount = parseInt(wager, 10);
    if (isNaN(amount) || amount <= 0) return;
    setResult(null);
    setShowResult(false);
    setFlying(true);
    bet.mutate(
      { wager: amount, side },
      {
        onSuccess: (data) => setResult(data),
        onError: () => setFlying(false)
      }
    );
  };

  return (
    <Game
      gameSlug="coinflip"
      result={showResult ? result : null}
      formatOutcome={formatCoinflipOutcome}
      form={
        <CoinflipForm
          side={side}
          setSide={setSide}
          wager={wager}
          setWager={setWager}
          onFlip={handleFlip}
          isPending={bet.isPending}
          flying={flying}
          balance={balance}
          isError={bet.isError}
          errorMessage={bet.error?.message}
        />
      }
      ui={
        <CoinflipUi
          flying={flying}
          showResult={showResult}
          result={result}
          won={won}
        />
      }
      betDetails={
        showResult && result
          ? [
              { title: "Chosen", value: result.coinFlip.chosenSide },
              { title: "Landed", value: result.coinFlip.landedSide }
            ]
          : undefined
      }
    />
  );
};

export default Coinflip;
