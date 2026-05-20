import { Input } from "@repo/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import type { ApiResponse, GameDto } from "@repo/types";
import type { AxiosError } from "axios";
import { useAxios } from "@repo/hooks/use-axios";

type GameRowProps = {
  game: GameDto;
};

const GameRow = ({ game }: GameRowProps) => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const [rtpInput, setRtpInput] = useState(() => String(Math.round(game.rtp * 100)));

  useEffect(() => {
    setRtpInput(String(Math.round(game.rtp * 100)));
  }, [game.rtp]);

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await axios.patch(`${baseUrl}/games/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
    },
    onError: (err: AxiosError<ApiResponse<unknown>>) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to update game"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
    }
  });

  const rtpMutation = useMutation({
    mutationFn: async ({ id, rtp }: { id: string; rtp: number }) => {
      await axios.patch(`${baseUrl}/games/${id}`, { rtp });
    },
    onSuccess: () => {
      toast.success("RTP updated");
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
    },
    onError: (err: AxiosError<ApiResponse<unknown>>) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to update RTP"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
    }
  });

  const handleToggle = () => {
    toggleMutation.mutate({ id: game.id, isActive: !game.isActive });
  };

  const handleRtpBlur = () => {
    const parsed = parseFloat(rtpInput);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setRtpInput(String(Math.round(game.rtp * 100)));
      toast.error("RTP must be between 0 and 100");
      return;
    }
    const decimal = parsed / 100;
    if (decimal === game.rtp) return;
    rtpMutation.mutate({ id: game.id, rtp: decimal });
  };

  const rtpChanged =
    parseFloat(rtpInput) / 100 !== game.rtp && !isNaN(parseFloat(rtpInput));

  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <span className="font-heading text-sm font-medium min-w-[5rem]">
        {game.name}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground/60 -ml-2 mr-auto">
        /{game.slug}
      </span>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border ${
            game.isActive
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {game.isActive ? "Active" : "Inactive"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={game.isActive}
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            game.isActive
              ? "bg-green-500 border-green-500"
              : "bg-muted border-border"
          }`}
        >
          <span
            className={`inline-block size-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
              game.isActive
                ? "translate-x-[1.125rem]"
                : "translate-x-[1px]"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          max="100"
          value={rtpInput}
          onChange={(e) => setRtpInput(e.target.value)}
          onBlur={handleRtpBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="w-16 h-7 px-2 py-0 text-center font-mono text-xs"
          disabled={rtpMutation.isPending}
        />
        <span className="text-xs text-muted-foreground/60 -ml-0.5">%</span>
        {rtpChanged && <Save className="size-3 text-muted-foreground/40" />}
        {rtpMutation.isPending && (
          <span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
};

export default GameRow;
