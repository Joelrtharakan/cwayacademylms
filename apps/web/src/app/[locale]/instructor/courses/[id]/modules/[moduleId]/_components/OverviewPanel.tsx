"use client";

import React from "react";
import { BookOpen, Play, FileText, Award, Layers, ArrowRight } from "lucide-react";
import { useCourseBuilderStore } from "@/store/course-builder.store";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  dark: "#1A261D",
  darkSoft: "#2D3A2F",
  muted: "#7F8E82",
  border: "#EBEEE8",
  bgAlt: "#F7F8F5",
  surface: "#FFFFFF",
};

export default function ModuleOverviewPanel({ module }: { module: any }) {
  const { setActiveTab } = useCourseBuilderStore();

  const stats = [
    {
      id: "videos",
      label: "Lessons",
      count: module._count?.lessons || 0,
      icon: Play,
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
    },
    {
      id: "readings",
      label: "Readings",
      count: module._count?.readingMaterials || 0,
      icon: BookOpen,
      color: "#B88645",
      bg: "rgba(184,134,69,0.08)",
      border: "rgba(184,134,69,0.2)",
    },
    {
      id: "assignments",
      label: "Assignments",
      count: module.lessons?.filter((l: any) => l.assignment).length || 0,
      icon: FileText,
      color: "#10B981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      id: "quizzes",
      label: "Quizzes",
      count: module.lessons?.filter((l: any) => l.quiz).length || 0,
      icon: Award,
      color: "#8B5CF6",
      bg: "rgba(139,92,246,0.08)",
      border: "rgba(139,92,246,0.2)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── HERO MODULE CARD ── */}
      <div style={{
        background: C.bgAlt,
        borderTop: `1px solid ${C.border}`,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.gold}`,
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
            color: C.gold, background: C.goldLight,
            padding: "4px 10px", borderRadius: 6,
          }}>
            <Layers size={13} />
            <span>Curriculum Module</span>
          </span>
        </div>

        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.dark, lineHeight: 1.3 }}>
          {module.title}
        </h2>

        {module.description ? (
          <p style={{ margin: 0, fontSize: 14, color: C.darkSoft, lineHeight: 1.6, maxWidth: 750 }}>
            {module.description}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: C.muted, fontStyle: "italic" }}>
            No description provided for this module.
          </p>
        )}
      </div>

      {/* ── METRIC CARDS BREAKDOWN ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.dark }}>
            Content Breakdown
          </h3>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
            Click card to manage
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}>
          {stats.map((stat) => (
            <div
              key={stat.id}
              onClick={() => setActiveTab(stat.id as any)}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 22px",
                cursor: "pointer",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                gap: 18,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: stat.bg, color: stat.color, border: `1px solid ${stat.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>

                <span style={{ fontSize: 32, fontWeight: 900, color: C.dark, lineHeight: 1 }}>
                  {stat.count}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>
                  {stat.label}
                </span>
                <ArrowRight size={14} color={C.gold} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
