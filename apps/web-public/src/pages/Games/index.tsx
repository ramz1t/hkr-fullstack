import { useAxios } from "@repo/hooks/use-axios";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { GAMES } from "../../config";
import type { GameDto } from "@repo/types";

const Games = () => {
  const axios = useAxios();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const { data: activeGames, isLoading } = useQuery<GameDto[]>({
    queryKey: ["active-games"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/games`);
      return res.data?.data || [];
    },
    staleTime: 30_000
  });

  const visible = activeGames
    ? GAMES.filter((g) => activeGames.some((ag) => ag.slug === g.slug && ag.isActive))
    : [];

  return (
    <section className="page-container">
      <Helmet>
        <title>Games | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          Games
        </h1>
        <p className="mt-2 text-muted-foreground">Choose a game to play</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="p-4 rounded-full bg-muted">
            <Gamepad2 className="size-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">
            No games are available right now. Check back later.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((game) => {
            const Icon = game.icon;
            return (
              <li key={game.slug}>
                <Link to={game.slug} className="block">
                  <Card className="transition-colors hover:border-primary/50 cursor-pointer h-full group/game-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="size-5" />
                        {game.name}
                      </CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-xs text-primary font-medium flex items-center gap-1.5 group-hover/game-card:gap-2.5 transition-all">
                        Play now <ArrowRight size="14" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default Games;
