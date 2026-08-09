"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import {
  BookOpen, Image as ImageIcon, FileText, LayoutList,
  CheckCircle2, Loader2, ArrowLeft, GraduationCap, Save, ExternalLink
} from "lucide-react";
import { Link } from "@/i18n/routing";

import BasicInfoSection from "@/components/instructor/setup/BasicInfoSection";
import ThumbnailPromoSection from "@/components/instructor/setup/ThumbnailPromoSection";
import CurriculumPlannerSection from "@/components/instructor/setup/CurriculumPlannerSection";
import PublicationSection from "@/components/instructor/setup/PublicationSection";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  goldGlow: "rgba(184,134,69,0.25)",
  dark: "#1A261D",
  darkSoft: "#2D3A2F",
  muted: "#7F8E82",
  surface: "#FFFFFF",
  bgAlt: "#F7F8F5",
  border: "#E2E6DE",
  borderLight: "#EBEEE8",
  red: "#DC4A4A",
  green: "#3D7A4B",
};

const SECTIONS = [
  { id: "basic", label: "Basic Info", icon: BookOpen },
  { id: "media", label: "Thumbnail & Promo", icon: ImageIcon },
  { id: "curriculum", label: "Course Description", icon: FileText },
  { id: "publication", label: "Publication", icon: CheckCircle2 },
];

export default function CourseSetupPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("basic");

  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ["courseSetup", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Loader2 size={36} style={{ animation: "setup-spin 1s linear infinite", color: C.gold }} />
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>Loading course settings…</span>
        <style>{`@keyframes setup-spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 40, textAlign: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, margin: "32px 0" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: C.dark, marginBottom: 8 }}>Course not found</h2>
        <Link href="/instructor/courses" style={{ color: C.gold, fontWeight: 700, textDecoration: "underline", fontSize: 14 }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "basic": return <BasicInfoSection course={course} onSave={refetch} />;
      case "media": return <ThumbnailPromoSection course={course} onSave={refetch} />;
      case "curriculum": return <CurriculumPlannerSection course={course} onSave={refetch} />;
      case "publication": return <PublicationSection course={course} />;
      default: return null;
    }
  };

  const rawTitle = course.program?.title || course.programName || course.programTitle;
  const pTitle = typeof rawTitle === "object" && rawTitle !== null
    ? (rawTitle.en || rawTitle.hi || Object.values(rawTitle)[0] || "")
    : String(rawTitle || "");
  const isPart = Boolean(pTitle && pTitle.trim());

  return (
    <div style={{
      width: "100%", maxWidth: 1100, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 28,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 64, boxSizing: "border-box",
    }}>
      {/* ── UNIFIED COURSE HERO CARD (MATCHING REFERENCE DESIGN) ── */}
      <div style={{
        background: C.surface,
        borderTop: `1px solid ${C.borderLight}`,
        borderRight: `1px solid ${C.borderLight}`,
        borderBottom: `1px solid ${C.borderLight}`,
        borderLeft: `4px solid ${C.gold}`,
        borderRadius: 20,
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",
        display: "flex", flexDirection: "column", gap: 20,
        width: "100%", boxSizing: "border-box",
      }}>
        {/* Top Bar: Back Link + Status Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", boxSizing: "border-box" }}>
          <Link
            href={`/instructor/courses/${id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "0 12px", height: 28, borderRadius: 20,
              background: C.bgAlt, color: C.darkSoft, border: `1px solid ${C.border}`,
              fontSize: 11, fontWeight: 800, textDecoration: "none",
              transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
              boxSizing: "border-box"
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Course</span>
          </Link>

          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: 28, padding: "0 12px", borderRadius: 20,
            fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
            background: course.status === "PUBLISHED" ? "rgba(61,122,75,0.12)" : "rgba(184,134,69,0.12)",
            color: course.status === "PUBLISHED" ? C.green : C.gold,
            border: `1px solid ${course.status === "PUBLISHED" ? "rgba(61,122,75,0.25)" : "rgba(184,134,69,0.25)"}`,
            whiteSpace: "nowrap", flexShrink: 0, boxSizing: "border-box"
          }}>
            {course.status}
          </span>
        </div>

        {/* Middle Info: Thumbnail + Program Tag + Course Title & Subtitle */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box",
        }}>
          {/* Compact Thumbnail Preview */}
          <div style={{
            width: 64, height: 64, minWidth: 64,
            borderRadius: 14, overflow: "hidden",
            background: C.bgAlt, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            flexShrink: 0,
          }}>
            {course.thumbnail ? (
              <img
                src={course.thumbnail} alt={course.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>No Image</span>
            )}
          </div>

          <div style={{ flex: "1 1 180px", minWidth: 160 }}>
            {/* Program Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
              padding: "3px 10px", borderRadius: 20, marginBottom: 6,
              background: isPart ? "rgba(184,134,69,0.12)" : C.bgAlt,
              color: isPart ? C.gold : C.muted,
              border: `1px solid ${isPart ? "rgba(184,134,69,0.25)" : C.border}`,
              whiteSpace: "nowrap", maxWidth: "100%"
            }}>
              <GraduationCap size={13} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isPart ? pTitle : "Standalone Course"}</span>
            </div>

            {/* Course Title */}
            <h1 style={{
              margin: "0 0 4px 0", fontSize: "clamp(16px, 4vw, 24px)", fontWeight: 800, color: C.dark,
              letterSpacing: "-0.01em", lineHeight: 1.3, wordBreak: "normal", overflowWrap: "break-word"
            }}>
              {course.title || "Untitled Course"}
            </h1>

            {/* Course Description */}
            <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.5, maxWidth: 650 }}>
              Manage course setup, promotional media, curriculum details, and publication settings.
            </p>
          </div>
        </div>

        {/* Separate Divider Line */}
        <div style={{ width: "100%", height: 1, background: C.borderLight }} />

        {/* Bottom Toolbar Navigation (2-Column Grid on Mobile) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 8,
          width: "100%",
          boxSizing: "border-box",
        }}>
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${isActive ? C.gold : C.border}`,
                  background: isActive ? C.goldLight : C.surface,
                  color: isActive ? C.gold : C.darkSoft,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  boxShadow: isActive ? "0 2px 8px rgba(184,134,69,0.15)" : "0 1px 2px rgba(0,0,0,0.02)",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                <Icon size={15} color={isActive ? C.gold : C.muted} />
                <span>{sec.label}</span>
              </button>
            );
          })}

          <Link
            href={`/instructor/courses/${course.id}`}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: C.dark,
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            <LayoutList size={15} />
            <span>Open Module Builder</span>
          </Link>
        </div>
      </div>

      {/* ── ACTIVE SECTION FORM CONTAINER ── */}
      <div style={{ width: "100%", boxSizing: "border-box" }}>
        {renderActiveSection()}
      </div>
    </div>
  );
}
