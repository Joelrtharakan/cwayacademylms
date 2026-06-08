"use client";

import React from "react";
import { THEME } from "@/lib/cway-theme";
import { ClipboardList, Clock } from "lucide-react";

export default function AssignmentsPage() {
  return (
    <div style={{ padding: "24px 0", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, color: THEME.HERO, marginBottom: 8 }}>
          Assignments
        </h1>
        <p style={{ color: THEME.MUTED, fontSize: 16 }}>
          Track your pending and submitted course assignments.
        </p>
      </div>

      <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)" }}>
        <ClipboardList size={48} color={THEME.MUTED} style={{ opacity: 0.5, margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, marginBottom: 8 }}>No pending assignments</h3>
        <p style={{ color: THEME.MUTED, maxWidth: 400, margin: "0 auto" }}>
          You're all caught up! When you reach an assignment lesson in your courses, it will appear here.
        </p>
      </div>
    </div>
  );
}
