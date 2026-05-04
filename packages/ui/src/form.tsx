import * as React from "react";
import { cn } from "./utils";

interface FormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  onSubmit: (data: FormData) => void;
}

function Form({ onSubmit, className, children, ...props }: FormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {children}
    </form>
  );
}

export { Form };
