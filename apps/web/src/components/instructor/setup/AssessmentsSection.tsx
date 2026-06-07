"use client";

import React from "react";
import { Award } from "lucide-react";

export default function AssessmentsSection({ course }: { course: any }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>Assessments Configuration</h2>
      <p style={{ fontSize: "14px", color: "#8F9E93", marginBottom: "32px" }}>Configure course-level assessment policies.</p>

      <div style={{ padding: "40px", textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", background: "#F8FAFC" }}>
        <Award size={32} color="#A0AEC0" style={{ margin: "0 auto 12px auto" }} />
        <p style={{ color: "#8F9E93", margin: 0 }}>Assessments are added within individual modules. Navigate to the <strong>Modules</strong> tab to create Quizzes and Assignments.</p>
      </div>
    </div>
  );
}
