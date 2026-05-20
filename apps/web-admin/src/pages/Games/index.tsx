import { useAxios } from "@repo/hooks/use-axios";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RefreshCw, Dice6Icon, CoinsIcon } from "lucide-react";
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

  const [editState, setEditState] = useState<
    Record<string, { isActive: boolean; rtp: number }>
  >({});

  useEffect(() => {
    if (games.length > 0) {
      setEditState((prev) => {
        const next = { ...prev };
        for (const game of games) {
          if (!next[game.id]) {
            next[game.id] = { isActive: game.isActive, rtp: game.rtp };
          }
        }
        return next;
      });
    }
  }, [games]);

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: { isActive?: boolean; rtp?: number };
    }) => {
      await axios.patch(`${baseUrl}/games/${id}`, data);
    },
    onSuccess: () => {
      toast.success("Game settings updated");
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
    },
    onError: (err: AxiosError<ApiResponse<unknown>>) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to update game"
      );
    }
  });

  const handleToggle = (game: GameDto) => {
    const newActive = !editState[game.id].isActive;
    setEditState((prev) => ({
      ...prev,
      [game.id]: { ...prev[game.id], isActive: newActive }
    }));
    updateMutation.mutate({ id: game.id, data: { isActive: newActive } });
  };

  const handleRtpChange = (gameId: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setEditState((prev) => ({
      ...prev,
      [gameId]: { ...prev[gameId], rtp: num }
    }));
  };

  const handleSaveRtp = (game: GameDto) => {
    const rtp = editState[game.id].rtp;
    if (rtp < 0 || rtp > 1) {
      toast.error("RTP must be between 0 and 1");
      return;
    }
    updateMutation.mutate({ id: game.id, data: { rtp } });
  };

  return (
    <div className="p-4 mx-auto container space-y-5">
      <Helmet>
        <title>Games | CasinoAdmin</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">Game Settings</h2>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
        >
          <RefreshCw
            className={`size-4 ${isRefetching ? "animate-spin text-primary" : ""}`}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-destructive text-center py-20">
          Failed to load games. Ensure administrative privileges are active.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {games.map((game) => {
            const state = editState[game.id] || game;
            const Icon = slugIcons[game.slug] || Dice6Icon;
            const isPending =
              updateMutation.isPending &&
              updateMutation.variables?.id === game.id;
            const rtpChanged = state.rtp !== game.rtp;

            return (
              <Card key={game.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="size-5" />
                    {game.name}
                    <span className="text-muted-foreground font-mono text-[11px]">
                      /{game.slug}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Active</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={state.isActive}
                      onClick={() => handleToggle(game)}
                      disabled={isPending}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        state.isActive
                          ? "bg-green-500 border-green-500"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                          state.isActive
                            ? "translate-x-[1.375rem]"
                            : "translate-x-[1px]"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium">RTP</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={state.rtp}
                        onChange={(e) => handleRtpChange(game.id, e.target.value)}
                        className="w-24 text-right"
                        disabled={isPending}
                      />
                      {rtpChanged && (
                        <Button
                          size="xs"
                          onClick={() => handleSaveRtp(game)}
                          disabled={isPending}
                        >
                          {isPending ? "Saving..." : "Save"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Games;
