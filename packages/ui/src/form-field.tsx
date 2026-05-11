import * as React from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "./utils";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  hint?: React.ReactNode;
}

function FormField({ label, hint, id, className, ...props }: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center min-h-5">
        <Label htmlFor={id}>{label}</Label>
        {hint && <div className="ml-auto text-xs">{hint}</div>}
      </div>
      <Input id={id} className={cn(className)} {...props} />
    </div>
  );
}

export { FormField };
