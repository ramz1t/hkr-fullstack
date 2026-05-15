import type { TransactionDto } from "@repo/types";
import { TYPE_COLOR, TYPE_LABEL, fmt, isDebit } from "./utils";
import { useWalletTransactions } from "../../api";
import { LoadMoreTrigger } from "@repo/ui/load-more-trigger";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "@repo/ui/table";
import { UUID } from "@repo/ui/uuid";

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
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((t) => (
                <TransactionsTableRow t={t} key={t.id} />
              ))}
            </TableBody>
          </Table>
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
  return (
    <TableRow key={t.id}>
      <TableCell>
        <UUID value={t.id} />
      </TableCell>
      <TableCell className={`font-medium ${TYPE_COLOR[t.type]}`}>
        {TYPE_LABEL[t.type]}
      </TableCell>
      <TableCell
        className={`text-right tabular-nums font-medium ${TYPE_COLOR[t.type]}`}
      >
        {isDebit(t.type) ? `-${fmt(t.amount)}` : `+${fmt(t.amount)}`}
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        {new Date(t.createdAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short"
        })}
      </TableCell>
    </TableRow>
  );
};

export default TransactionsTable;
