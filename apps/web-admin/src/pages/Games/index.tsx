import { useAxios } from "@repo/hooks/use-axios";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  RefreshCw,
  ShieldAlert,
  CoinsIcon,
  Dice6Icon,
  Save
} from "lucide-react";
import type { ApiResponse, GameDto } from "@repo/types";
import { Helmet } from "react-helmet-async";
import type { AxiosError } from "axios";

const slugIcons: Record<string, typeof Dice6Icon> = {
  coinflip: CoinsIcon,
  slots: Dice6Icon
};

const Games = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const {
    data: games = [],
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery<GameDto[]>({
    queryKey: ["admin-games"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/games`);
      return res.data?.data || [];
    }
  });

  const [rtpInputs, setRtpInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (games.length > 0) {
      setRtpInputs((prev) => {
        const next = { ...prev };
        for (const game of games) {
          if (next[game.id] === undefined) {
            next[game.id] = String(Math.round(game.rtp * 100));
          }
        }
        return next;
      });
    }
  }, [games]);

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

  const handleToggle = (game: GameDto) => {
    toggleMutation.mutate({ id: game.id, isActive: !game.isActive });
  };

  const handleRtpBlur = (game: GameDto) => {
    const raw = rtpInputs[game.id];
    if (raw === undefined) return;
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setRtpInputs((prev) => ({
        ...prev,
        [game.id]: String(Math.round(game.rtp * 100))
      }));
      toast.error("RTP must be between 0 and 100");
      return;
    }
    const decimal = parsed / 100;
    if (decimal === game.rtp) return;
    rtpMutation.mutate({ id: game.id, rtp: decimal });
  };

  const isToggling = (id: string) =>
    toggleMutation.isPending && toggleMutation.variables?.id === id;
  const isSavingRtp = (id: string) =>
    rtpMutation.isPending && rtpMutation.variables?.id === id;

  return (
    <div className="p-4 mx-auto container space-y-5">
      <Helmet>
        <title>Games | CasinoAdmin</title>
      </Helmet>

      <div className="border-border/60 shadow-xl bg-card/60 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between gap-4">
          <h3 className="font-bold text-lg font-heading">Game Settings</h3>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
          >
            <RefreshCw
              className={`size-4 ${isRefetching ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh Data</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-destructive">
            <ShieldAlert className="size-6" />
            <span className="text-xs font-semibold">
              Failed to load games. Ensure administrative privileges are active.
            </span>
          </div>
        ) : games.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-xs">
            No games found.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {games.map((game) => {
              const Icon = slugIcons[game.slug] || Dice6Icon;
              const rtpValue =
                rtpInputs[game.id] ?? String(Math.round(game.rtp * 100));
              const rtpChanged =
                parseFloat(rtpValue) / 100 !== game.rtp &&
                !isNaN(parseFloat(rtpValue));

              return (
                <div
                  key={game.id}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <Icon className="size-4 shrink-0 text-foreground/50" />
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
                      onClick={() => handleToggle(game)}
                      disabled={isToggling(game.id)}
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
                      value={rtpValue}
                      onChange={(e) =>
                        setRtpInputs((prev) => ({
                          ...prev,
                          [game.id]: e.target.value
                        }))
                      }
                      onBlur={() => handleRtpBlur(game)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="w-16 h-7 px-2 py-0 text-center font-mono text-xs"
                      disabled={isSavingRtp(game.id)}
                    />
                    <span className="text-xs text-muted-foreground/60 -ml-0.5">
                      %
                    </span>
                    {rtpChanged && (
                      <Save className="size-3 text-muted-foreground/40" />
                    )}
                    {isSavingRtp(game.id) && (
                      <span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
