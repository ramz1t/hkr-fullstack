import { useAxios } from "@repo/hooks/use-axios";
import { Button } from "@repo/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  ShieldAlert
} from "lucide-react";
import type { GameDto } from "@repo/types";
import { Helmet } from "react-helmet-async";
import GameRow from "./GameRow";

const Games = () => {
  const axios = useAxios();
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
            {games.map((game) => (
              <GameRow key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
