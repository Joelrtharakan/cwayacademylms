"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function SessionManager() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track idle time if the user is actually logged in
    if (!user) return;

    const handleIdleTimeout = () => {
      clearAuth();
      router.push("/login?reason=expired");
    };

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleIdleTimeout, IDLE_TIMEOUT_MS);
    };

    // Initialize timer
    resetTimer();

    // Events to track user activity
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    
    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, router, clearAuth]);

  return null; // This component doesn't render anything
}
