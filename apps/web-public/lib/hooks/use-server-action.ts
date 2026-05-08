"use client";

import { useState, useTransition } from "react";

export function useServerAction<TInput = FormData>(
  action: (input: TInput) => Promise<string | null>
) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function execute(input: TInput) {
    setError(null);
    startTransition(async () => {
      const result = await action(input);
      if (result) setError(result);
    });
  }

  function clearError() {
    setError(null);
  }

  return { execute, error, isPending, clearError };
}
