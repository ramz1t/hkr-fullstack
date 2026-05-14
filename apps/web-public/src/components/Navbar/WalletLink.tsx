import { WalletIcon } from "lucide-react";
import { useWalletBalance } from "@/api";

const WalletLink = () => {
  const { data, isLoading, isError } = useWalletBalance();

  return (
    <span className="flex items-center gap-2 font-semibold">
      <WalletIcon />
      {isLoading ? (
        <span className="h-4 w-10 animate-pulse rounded bg-primary/50"></span>
      ) : isError ? (
        <span>—</span>
      ) : (
        data && data.data?.balance
      )}
    </span>
  );
};

export default WalletLink;
