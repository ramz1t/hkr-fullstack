import { Helmet } from "react-helmet-async";
import Coinflip from "./Coinflip";

const CoinflipPage = () => {
  return (
    <section className="mx-auto w-full px-4 py-10 flex flex-col gap-8 container">
      <Helmet>
        <title>Coinflip | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          Coinflip
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose a side and flip for a chance to win
        </p>
      </div>
      <Coinflip />
    </section>
  );
};

export default CoinflipPage;
