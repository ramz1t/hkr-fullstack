export const DetailRow = ({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground pb-1 font-heading font-semibold">
      {label}
    </span>
    {typeof children === "string" ? (
      <code className="text-sm break-all bg-muted px-3 py-2 select-all font-mono leading-relaxed min-h-10">
        {children}
      </code>
    ) : (
      children
    )}
  </div>
);
