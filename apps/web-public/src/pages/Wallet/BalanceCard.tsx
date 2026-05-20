import { ArrowRight, Coins } from "lucide-react";
import { fmt } from "./utils";
import { useWalletBalance } from "../../api";
import { Link } from "react-router-dom";

const BalanceCard = () => {
  const { data, isLoading, isError } = useWalletBalance();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold font-heading">Current Balance</h2>
      {isLoading ? (
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      ) : isError ? (
        <div className="text-4xl font-extrabold font-heading tabular-nums flex items-center gap-2 text-red-500">
          Error, try again later
        </div>
      ) : (
        data && (
          <span className="text-4xl font-extrabold font-heading tabular-nums flex items-center gap-2">
            {fmt(data?.data?.balance)}
            <Coins className="text-yellow-500" />
          </span>
        )
      )}
      <Link
        to="/profile/funds"
        className="flex items-center gap-2 hover:gap-3 transition-all text-primary font-heading font-semibold w-fit"
      >
        Manage <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default BalanceCard;
