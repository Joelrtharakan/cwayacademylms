import React from "react";
import { BookOpen, Play, FileText, Award } from "lucide-react";

export default function ModuleOverviewPanel({ module }: { module: any }) {
  const stats = [
    { label: "Lessons", count: module._count?.lessons || 0, icon: Play, color: "#4299E1", bg: "#ebf8ff" },
    { label: "Readings", count: module._count?.readingMaterials || 0, icon: BookOpen, color: "#B88645", bg: "#fcf8f3" },
    { label: "Assignments", count: module.lessons?.filter((l: any) => l.assignment).length || 0, icon: FileText, color: "#48BB78", bg: "#f0fff4" },
    { label: "Quizzes", count: module.lessons?.filter((l: any) => l.quiz).length || 0, icon: Award, color: "#9F7AEA", bg: "#faf5ff" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out", padding: "10px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1A261D", margin: 0, fontFamily: "Georgia, serif" }}>
            Module Overview
          </h2>
        </div>
        <p style={{ color: "#8A9E8C", fontSize: "15px", lineHeight: "1.6", margin: 0, maxWidth: "600px" }}>
          A high-level summary of all content, assignments, and materials currently configured within this module.
        </p>
      </div>

      {/* Main Module Card */}
      <div style={{ position: "relative", background: "#ffffff", borderRadius: "24px", padding: "40px", marginBottom: "48px", border: "1px solid #E4E8E0", boxShadow: "0 8px 30px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {/* Top Gradient Accent */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "6px", background: "linear-gradient(to right, #B88645, #D4AF37, #B88645)" }}></div>
        
        <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 20px 0", fontFamily: "Georgia, serif" }}>
          {module.title}
        </h3>
        
        {module.description ? (
          <p style={{ color: "#4A5568", fontSize: "15px", lineHeight: "1.8", margin: 0, maxWidth: "800px" }}>
            {module.description}
          </p>
        ) : (
          <p style={{ color: "#8A9E8C", fontStyle: "italic", fontSize: "15px", margin: 0 }}>
            No description provided for this module.
          </p>
        )}
      </div>

      {/* Stats Breakdown */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>Content Breakdown</h3>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, #E4E8E0, transparent)" }}></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #E4E8E0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              {/* Top right subtle background circle */}
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: stat.bg, opacity: 0.8, zIndex: 0 }}></div>
              
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", position: "relative", zIndex: 10 }}>
                <div style={{ padding: "12px", borderRadius: "14px", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: "36px", fontWeight: 900, color: "#1A261D", lineHeight: "1", letterSpacing: "-1px" }}>
                  {stat.count}
                </div>
              </div>
              
              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
