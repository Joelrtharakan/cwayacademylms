"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { getModules } from "@/lib/api/modules";
import { useCourseBuilderStore } from "@/store/course-builder.store";
import { ArrowLeft, Play, BookOpen, FileText, Award, Info, Loader2, MessageSquare, Layers, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/routing";
import dynamic from "next/dynamic";

const LoadingState = () => (
  <div className="w-full h-[300px] flex items-center justify-center">
    <Loader2 size={32} className="animate-spin text-[#B88645]" />
  </div>
);

const ModuleOverviewPanel = dynamic(() => import("./_components/OverviewPanel"), { loading: LoadingState });
const VideosPanel = dynamic(() => import("./_components/VideosPanel"), { loading: LoadingState });
const ReadingsPanel = dynamic(() => import("./_components/ReadingsPanel"), { loading: LoadingState });
const AssignmentsPanel = dynamic(() => import("./_components/AssignmentsPanel"), { loading: LoadingState });
const QuizzesPanel = dynamic(() => import("./_components/QuizzesPanel"), { loading: LoadingState });
const ForumsPanel = dynamic(() => import("./_components/ForumsPanel"), { loading: LoadingState });

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  dark: "#1A261D",
  muted: "#7F8E82",
  border: "#EBEEE8",
};

export default function ModuleManagementPage() {
  const { id, moduleId } = useParams() as { id: string; moduleId: string };
  const { activeTab, setActiveTab } = useCourseBuilderStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data),
  });

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules", id],
    queryFn: () => getModules(id),
  });

  const currentModule = modules?.find((m: any) => m.id === moduleId);

  if (courseLoading || modulesLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: C.gold }} />
      </div>
    );
  }

  if (!course || !currentModule) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>Module not found</h2>
        <Link href={`/instructor/courses/${id}`} style={{ color: C.gold, fontWeight: 700, textDecoration: "underline" }}>
          Back to Course
        </Link>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview", shortLabel: "Overview", icon: Info },
    { id: "videos", label: "Videos", shortLabel: "Videos", icon: Play },
    { id: "readings", label: "Reading Materials", shortLabel: "Readings", icon: BookOpen },
    { id: "assignments", label: "Assignments", shortLabel: "Assignments", icon: FileText },
    { id: "quizzes", label: "Quizzes", shortLabel: "Quizzes", icon: Award },
    { id: "forums", label: "Learning Forums", shortLabel: "Forums", icon: MessageSquare },
  ] as const;

  const activeTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];
  const ActiveIcon = activeTabObj.icon;

  return (
    <div style={{
      width: "100%", maxWidth: 1150, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 64, boxSizing: "border-box",
    }}>
      {/* ── TOP HEADER CARD ── */}
      <div style={{
        background: "#FFFFFF",
        borderTop: `1px solid ${C.border}`,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.gold}`,
        borderRadius: 20,
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Link
            href={`/instructor/courses/${id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 10,
              background: "#F7F8F5", color: "#2D3A2F",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <ArrowLeft size={16} />
            <span>{course.title || "Back to Course"}</span>
          </Link>

          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "5px 14px", borderRadius: 20,
            background: C.goldLight, color: C.gold, border: `1px solid rgba(184,134,69,0.25)`,
          }}>
            Module Management
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: C.goldLight, color: C.gold,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.dark, lineHeight: 1.3 }}>
              {currentModule.title}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
              Manage curriculum videos, reading materials, assignments, and quizzes.
            </p>
          </div>
        </div>
      </div>

      {/* ── RESPONSIVE TABS & CONTENT LAYOUT ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Spacious Segmented Grid Navigation Bar */}
        <div style={{
          background: "#FFFFFF",
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "16px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          width: "100%",
          boxSizing: "border-box",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
            width: "100%",
          }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 18px",
                    minHeight: 48,
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: active ? 800 : 700,
                    color: active ? "#FFFFFF" : C.muted,
                    background: active
                      ? `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`
                      : "transparent",
                    boxShadow: active ? `0 4px 14px rgba(184,134,69,0.3)` : "none",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "#F7F8F5";
                      e.currentTarget.style.color = C.dark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = C.muted;
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Content Area */}
        <div style={{
          background: "#FFFFFF",
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "28px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          {activeTab === "overview" && <ModuleOverviewPanel module={currentModule} />}
          {activeTab === "videos" && <VideosPanel module={currentModule} />}
          {activeTab === "readings" && <ReadingsPanel module={currentModule} />}
          {activeTab === "assignments" && <AssignmentsPanel module={currentModule} />}
          {activeTab === "quizzes" && <QuizzesPanel module={currentModule} />}
          {activeTab === "forums" && <ForumsPanel module={currentModule} />}
        </div>
      </div>
    </div>
  );
}
