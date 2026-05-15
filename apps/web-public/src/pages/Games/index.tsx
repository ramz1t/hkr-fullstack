import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { ArrowRight } from "lucide-react";
import { GAMES } from "../../config";

const Games = () => {
  return (
    <section className="mx-auto w-full px-4 py-10 flex flex-col gap-8 container">
      <Helmet>
        <title>Games | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          Games
        </h1>
        <p className="mt-2 text-muted-foreground">Choose a game to play</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Link key={game.slug} to={game.slug} className="block">
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
          );
        })}
      </div>
    </section>
  );
};

export default Games;
