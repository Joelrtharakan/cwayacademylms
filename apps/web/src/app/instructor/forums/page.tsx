"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function InstructorForumsPage() {
  return (
    <div style={{ padding: "24px 32px" }}>
      <h1
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#1A261D",
          marginBottom: 32,
          letterSpacing: "0.5px",
        }}
      >
        Discussion Forums
      </h1>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "60px 20px",
          textAlign: "center",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <MessageCircle
          size={48}
          color="var(--gold-primary, #C9A84C)"
          style={{ margin: "0 auto 20px", opacity: 0.8 }}
        />
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1A261D",
            marginBottom: 8,
          }}
        >
          Forum Grading Coming Soon
        </h2>
        <p style={{ fontSize: 15, color: "#8F9E93", maxWidth: 400, margin: "0 auto" }}>
          You will soon be able to view, moderate, and grade student discussion posts directly from this page.
        </p>
      </div>
    </div>
  );
}
