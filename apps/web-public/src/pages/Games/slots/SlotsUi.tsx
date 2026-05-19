import type { SlotsBetDto } from "@repo/types";
import { SlotOutcome, SlotSymbol } from "@repo/types";
import { Card, CardContent } from "@repo/ui/card";
import { cn } from "@repo/ui/utils";

interface SlotsUiProps {
  spinning: boolean;
  showResult: boolean;
  result: SlotsBetDto | null;
}

const SYMBOL_LABEL: Record<SlotSymbol, string> = {
  [SlotSymbol.DIAMOND]: "💎",
  [SlotSymbol.SEVEN]: "7",
  [SlotSymbol.BAR]: "BAR",
  [SlotSymbol.CHERRY]: "🍒",
  [SlotSymbol.LEMON]: "🍋"
};

const SYMBOL_CLASS: Record<SlotSymbol, string> = {
  [SlotSymbol.DIAMOND]: "text-blue-400",
  [SlotSymbol.SEVEN]: "text-red-500 text-3xl font-black",
  [SlotSymbol.BAR]: "text-yellow-500 text-sm font-black tracking-widest",
  [SlotSymbol.CHERRY]: "text-2xl",
  [SlotSymbol.LEMON]: "text-2xl"
};

const OUTCOME_DISPLAY: Record<
  SlotOutcome,
  { label: string; className: string }
> = {
  [SlotOutcome.JACKPOT]: {
    label: "💎 JACKPOT! 💎",
    className: "text-yellow-400"
  },
  [SlotOutcome.BIG_WIN]: { label: "Big Win!", className: "text-green-500" },
  [SlotOutcome.SMALL_WIN]: { label: "Small Win", className: "text-green-400" },
  [SlotOutcome.LOSS]: { label: "No Win", className: "text-muted-foreground" }
};

const ROWS = [0, 1, 2] as const;
const REELS = [0, 1, 2] as const;

const SlotsUi = ({ spinning, showResult, result }: SlotsUiProps) => (
  <>
    <style>{`
      @keyframes reel-spin {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(-10px); opacity: 0.15; }
      }
      .reel-spinning { animation: reel-spin 0.2s ease-in-out infinite; }
      .reel-col-0.reel-spinning { animation-delay: 0ms; }
      .reel-col-1.reel-spinning { animation-delay: 60ms; }
      .reel-col-2.reel-spinning { animation-delay: 120ms; }
      @keyframes reel-land {
        0% { transform: translateY(-24px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      .reel-land-0 { animation: reel-land 0.25s ease-out forwards; }
      .reel-land-1 { animation: reel-land 0.25s 0.15s ease-out both; }
      .reel-land-2 { animation: reel-land 0.25s 0.30s ease-out both; }
    `}</style>

    <Card className="flex flex-col justify-center">
      <CardContent className="flex flex-col items-center gap-5">
        <div className="w-full max-w-xs border-2 border-border rounded-xl overflow-hidden">
          {ROWS.map((row) => (
            <div
              key={row}
              className={cn(
                "grid grid-cols-3 divide-x divide-border",
                row === 1 && "bg-primary/10 border-y-2 border-primary/30"
              )}
            >
              {REELS.map((reel) => {
                const sym = result?.slots.reels[reel][row];
                return (
                  <div
                    key={reel}
                    className={cn(
                      "h-16 flex items-center justify-center font-bold select-none",
                      `reel-col-${reel}`,
                      spinning && "reel-spinning",
                      showResult && !spinning && `reel-land-${reel}`
                    )}
                  >
                    {spinning ? (
                      <span className="text-2xl text-muted-foreground/30">
                        ?
                      </span>
                    ) : sym ? (
                      <span className={cn("text-2xl", SYMBOL_CLASS[sym])}>
                        {SYMBOL_LABEL[sym]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/20 text-2xl">
                        —
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {showResult && result && (
          <span
            className={cn(
              "text-2xl font-extrabold font-heading",
              OUTCOME_DISPLAY[result.slots.outcome].className
            )}
          >
            {OUTCOME_DISPLAY[result.slots.outcome].label}
          </span>
        )}
      </CardContent>
    </Card>
  </>
);

export default SlotsUi;
