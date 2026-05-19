import { type CoinflipBetDto, CoinSide } from "@repo/types";
import { Card, CardContent } from "@repo/ui/card";
import { cn } from "@repo/ui/utils";

interface CoinflipUiProps {
  flying: boolean;
  showResult: boolean;
  result: CoinflipBetDto | null;
  won: boolean | null;
}

const CoinflipUi = ({ flying, showResult, result, won }: CoinflipUiProps) => (
  <>
    <style>{`
      @keyframes coin-flip {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(720deg); }
      }
      .coin-flipping {
        animation: coin-flip 0.8s ease-in-out infinite;
      }
      @keyframes coin-reveal {
        0% { transform: rotateY(720deg); }
        100% { transform: rotateY(var(--land-rotation)); }
      }
      .coin-revealing {
        animation: coin-reveal 0.6s ease-out forwards;
      }
      .coin-perspective { perspective: 600px; }
      .coin-3d { transform-style: preserve-3d; }
      .coin-face { backface-visibility: hidden; }
      .coin-back { transform: rotateY(180deg); }
    `}</style>

    <Card className="flex flex-col justify-center">
      <CardContent className="flex flex-col items-center gap-6">
        <div className="coin-perspective">
          <div
            className={cn(
              "coin-3d relative size-28",
              flying && "coin-flipping",
              showResult && "coin-revealing",
              !(flying || showResult) && "grayscale"
            )}
            style={
              showResult && result
                ? ({
                    "--land-rotation":
                      result.coinFlip.landedSide === CoinSide.HEADS
                        ? "0deg"
                        : "180deg"
                  } as React.CSSProperties)
                : undefined
            }
          >
            <div className="coin-face absolute inset-0 rounded-full bg-yellow-400 border-4 border-yellow-500 flex items-center justify-center">
              <span className="text-lg font-extrabold text-yellow-800">H</span>
            </div>
            <div className="coin-face coin-back absolute inset-0 rounded-full bg-yellow-500 border-4 border-yellow-600 flex items-center justify-center">
              <span className="text-lg font-extrabold text-yellow-900">T</span>
            </div>
          </div>
        </div>

        {showResult && result && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold">
              {result.coinFlip.landedSide}
            </span>
            <span
              className={cn(
                "text-xl text-center font-heading",
                won ? "text-green-600" : "text-red-500"
              )}
            >
              {won ? "You Won!" : "You Lost"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  </>
);

export default CoinflipUi;
