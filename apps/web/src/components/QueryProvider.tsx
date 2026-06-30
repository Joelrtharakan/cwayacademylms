"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes — LMS data doesn't change every few seconds
            gcTime: 10 * 60 * 1000,   // 10 minutes — keep unused cache longer
            refetchOnWindowFocus: false, // Don't re-fetch when user alt-tabs
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
