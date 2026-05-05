"use client";

import { Button } from "@repo/ui/button";
import { useEffect, useState } from "react";

export function SessionExpiredModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Session expired</h2>
        <p className="text-sm text-muted-foreground">
          Your session has expired. Please log in again to continue.
        </p>
        <Button
          className="w-full"
          onClick={() => (window.location.href = "/login")}
        >
          Go to login
        </Button>
      </div>
    </div>
  );
}
