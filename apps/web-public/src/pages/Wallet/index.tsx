import BalanceCard from "./BalanceCard";
import TransactionsTable from "./TransactionsTable";
import { Helmet } from "react-helmet-async";

const Wallet = () => {
  return (
    <section className="page-container">
      <Helmet>
        <title>Wallet | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          Wallet
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your balance and transaction history
        </p>
      </div>
      <BalanceCard />
      <TransactionsTable />
    </section>
  );
};

export default Wallet;
