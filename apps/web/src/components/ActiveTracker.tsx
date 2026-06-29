"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/store/auth.store";
import { useAuthStore } from "@/store/auth.store";

export function ActiveTracker() {
  const { user } = useAuthStore();
  const [isActive, setIsActive] = useState(true);
  const lastActivity = useRef(Date.now());
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || user.role !== "STUDENT") return;

    const handleActivity = () => {
      lastActivity.current = Date.now();
      setIsActive(true);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Ping backend every 60 seconds if active
    heartbeatInterval.current = setInterval(() => {
      const now = Date.now();
      // If no activity in the last 60 seconds, user is idle
      if (now - lastActivity.current > 60000) {
        setIsActive(false);
        return;
      }

      // User is active, send heartbeat (silent background network request)
      api.post("/student/heartbeat").catch(() => {});
    }, 60000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    };
  }, [user]);

  return null; // Silent global component
}
