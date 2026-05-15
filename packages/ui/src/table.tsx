import { type ComponentProps } from "react";
import { cn } from "./utils.js";

const Table = ({ className, ...props }: ComponentProps<"table">) => (
  <div className="w-full overflow-x-auto">
    <table
      className={cn("w-full text-sm ring-1 ring-foreground/10", className)}
      {...props}
    />
  </div>
);

const TableHeader = ({ className, ...props }: ComponentProps<"thead">) => (
  <thead className={className} {...props} />
);

const TableHeaderRow = ({ className, ...props }: ComponentProps<"tr">) => (
  <tr
    className={cn(
      "border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
      className
    )}
    {...props}
  />
);

const TableHead = ({ className, ...props }: ComponentProps<"th">) => (
  <th className={cn("px-4 py-3", className)} {...props} />
);

const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => (
  <tbody
    className={cn("divide-y divide-border bg-card", className)}
    {...props}
  />
);

const TableRow = ({ className, ...props }: ComponentProps<"tr">) => (
  <tr
    className={cn("hover:bg-muted/30 transition-colors", className)}
    {...props}
  />
);

const TableCell = ({ className, ...props }: ComponentProps<"td">) => (
  <td className={cn("px-4 py-3", className)} {...props} />
);

const TableEmpty = ({
  colSpan = 1000,
  children,
  className
}: {
  colSpan?: number;
  children: React.ReactNode;
  className?: string;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className={cn(
        "py-12 text-center text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </td>
  </tr>
);

export {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty
};
