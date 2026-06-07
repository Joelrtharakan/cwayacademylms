"use client";

import React from "react";
import { ClipboardCheck, Plus } from "lucide-react";

export default function RubricsSection({ course }: { course: any }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>Grading Rubrics</h2>
      <p style={{ fontSize: "14px", color: "#8F9E93", marginBottom: "32px" }}>Build custom rubrics to evaluate assignments consistently.</p>

      <div style={{ padding: "40px", textAlign: "center", border: "2px dashed #E2E8F0", borderRadius: "12px" }}>
        <ClipboardCheck size={32} color="#A0AEC0" style={{ margin: "0 auto 12px auto" }} />
        <p style={{ color: "#8F9E93", fontWeight: 600, margin: "0 0 4px 0" }}>No rubrics created</p>
        <p style={{ color: "#8F9E93", fontSize: "13px", margin: "0 0 16px 0" }}>Create a rubric to attach to your assignments.</p>
      </div>

      <button style={{ marginTop: "24px", padding: "12px 24px", background: "#FFFFFF", color: "#1A261D", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
        <Plus size={18} /> Create New Rubric
      </button>
    </div>
  );
}
