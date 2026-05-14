import type { TransactionDto } from "@repo/types";
import { TYPE_COLOR, TYPE_LABEL, fmt, isDebit } from "./utils";
import { useCallback, useState } from "react";
import { useWalletTransactions } from "@/api";
import { LoadMoreTrigger } from "@repo/ui/load-more-trigger";

const TransactionsTable = () => {
  const {
    data: transactions,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    error,
    isError,
    isLoading
  } = useWalletTransactions();
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold font-heading">Transactions</h2>
      {isError ? (
        <p className="text-sm text-destructive">Failed to load transactions.</p>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : transactions?.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No transactions yet.
        </p>
      ) : (
        <div>
          <table className="w-full text-sm ring-1 ring-foreground/10">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {transactions?.map((t) => (
                <TransactionsTableRow t={t} key={t.id} />
              ))}
            </tbody>
          </table>
          <LoadMoreTrigger
            isFetching={isFetchingNextPage}
            fetch={fetchNextPage}
            error={error}
            hasNextPage={hasNextPage}
          />
        </div>
      )}
    </div>
  );
};

const TransactionsTableRow = ({ t }: { t: TransactionDto }) => {
  const copyTransactionId = useCallback(async (id: string) => {
    await navigator.clipboard.writeText(id);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2000);
  }, []);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  return (
    <tr
      key={t.id}
      className="hover:bg-muted/30"
      title={!showConfirm ? "Copy transaction ID" : ""}
    >
      <td className="px-4 py-3 text-muted-foreground">
        <span
          className={`${!showConfirm && "hover:cursor-pointer"} w-fit`}
          onClick={() => !showConfirm && copyTransactionId(t.id)}
        >
          {showConfirm ? "Copied!" : t.id}
        </span>
      </td>
      <td className={`px-4 py-3 font-medium ${TYPE_COLOR[t.type]}`}>
        {TYPE_LABEL[t.type]}
      </td>
      <td
        className={`px-4 py-3 text-right tabular-nums font-medium ${TYPE_COLOR[t.type]}`}
      >
        {isDebit(t.type) ? `-${fmt(t.amount)}` : `+${fmt(t.amount)}`}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {new Date(t.createdAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short"
        })}
      </td>
    </tr>
  );
};

export default TransactionsTable;
