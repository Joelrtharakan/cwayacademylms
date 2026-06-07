import React from "react";
import { BookOpen, Play, FileText, Award } from "lucide-react";

export default function ModuleOverviewPanel({ module }: { module: any }) {
  const stats = [
    { label: "Lessons/Videos", count: module._count?.lessons || 0, icon: Play, color: "#4299E1", bg: "rgba(66,153,225,0.1)" },
    { label: "Reading Materials", count: module._count?.readingMaterials || 0, icon: BookOpen, color: "#B88645", bg: "rgba(184,134,69,0.1)" },
    { label: "Assignments", count: module.lessons?.filter((l: any) => l.assignment).length || 0, icon: FileText, color: "#48BB78", bg: "rgba(72,187,120,0.1)" },
    { label: "Quizzes", count: module.lessons?.filter((l: any) => l.quiz).length || 0, icon: Award, color: "#9F7AEA", bg: "rgba(159,122,234,0.1)" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Module Overview</h2>
        <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>A summary of all content currently in this module.</p>
      </div>

      <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>{module.title}</h3>
        {module.description && (
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px", lineHeight: 1.6 }}>{module.description}</p>
        )}
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#1A261D" }}>Content Breakdown</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E4E8E0", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <stat.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#1A261D", lineHeight: 1 }}>{stat.count}</div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", marginTop: "4px" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
