import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@repo/hooks/use-auth";

import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: 0,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <AuthProvider apiBaseUrl={import.meta.env.VITE_API_BASE_URL ?? ""}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <App />
            <ReactQueryDevtools />
            <Toaster
              containerClassName="max-md:!top-20 max-md:!inset-x-2"
              position="top-right"
            />
          </HelmetProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
