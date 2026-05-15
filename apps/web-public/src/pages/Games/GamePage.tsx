import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { GAMES } from "../../config";

const GamePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const game = GAMES.find((g) => g.slug === slug);

  if (!game) {
    return (
      <section className="mx-auto w-full px-4 py-10 flex flex-col gap-8 container">
        <Helmet>
          <title>Game Not Found | CasinoApp</title>
        </Helmet>
        <div className="grow flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="p-4 rounded-full bg-muted">
            <Gamepad2 className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading">
            Game not found
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            There is no game named{" "}
            <span className="font-mono text-foreground">
              &ldquo;{slug}&rdquo;
            </span>
            . It may have been removed or the URL is incorrect.
          </p>
          <Link
            to="/games"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
          >
            <ArrowLeft size="16" /> Back to all games
          </Link>
        </div>
      </section>
    );
  }

  const GameComponent = game.component;
  return (
    <section className="mx-auto w-full px-4 py-10 flex flex-col gap-8 container">
      <Helmet>
        <title>{game.name} | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading flex items-center gap-3">
          {(() => {
            const Icon = game.icon;
            return <Icon className="size-8" />;
          })()}
          {game.name}
        </h1>
        <p className="mt-2 text-muted-foreground">{game.description}</p>
      </div>
      <GameComponent />
    </section>
  );
};

export default GamePage;
