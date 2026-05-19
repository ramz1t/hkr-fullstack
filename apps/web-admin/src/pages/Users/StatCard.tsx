import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  isLoading: boolean;
  colorClass?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
  colorClass
}: StatCardProps) => (
  <Card className="bg-card/40 border-border/50 backdrop-blur-md shadow-sm transition-all">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className={`size-4 ${colorClass ?? "text-primary"}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold font-heading ${colorClass ?? ""}`}>
        {isLoading ? (
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        ) : (
          value
        )}
      </div>
    </CardContent>
  </Card>
);
