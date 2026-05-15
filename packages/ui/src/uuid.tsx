"use client";

import { useCallback, useState } from "react";

export const UUID = ({ value }: { value: string }) => {
  const copyTransactionId = useCallback(async (value: string) => {
    await navigator.clipboard.writeText(value);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2000);
  }, []);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  return (
    <span
      className={`${!showConfirm && "hover:cursor-pointer"} w-fit text-muted-foreground font-mono`}
      onClick={() => !showConfirm && copyTransactionId(value)}
      title={showConfirm ? "" : "Copy UUID"}
    >
      {showConfirm ? "Copied!" : value}
    </span>
  );
};
