"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, BookOpen, Edit2, Trash2, Users, Archive } from "lucide-react";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { getInstructorCourses, deleteCourse, updateCourse } from "@/lib/api/instructor";
import { useConfirm } from "@/components/shared/ConfirmContext";
import Image from "next/image";
import { useTranslations } from "next-intl";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "PENDING" | "REJECTED" | "ARCHIVED";

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

function StatusBadge({ status, t }: { status: string, t: any }) {
  const map: Record<string, { bg: string; text: string }> = {
    PUBLISHED: { bg: "rgba(61,122,75,0.12)", text: C.green },
    DRAFT: { bg: "rgba(184,134,69,0.12)", text: C.gold },
    PENDING: { bg: "rgba(60,52,137,0.12)", text: "#3c3489" },
    REJECTED: { bg: "rgba(220,74,74,0.12)", text: C.red },
    ARCHIVED: { bg: "rgba(127,142,130,0.12)", text: C.muted },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span style={{
      background: s.bg, color: s.text,
      borderRadius: 8, padding: "4px 12px",
      fontSize: 11, fontWeight: 800,
      textTransform: "uppercase", letterSpacing: "0.08em",
      display: "inline-block",
    }}>
      {t(`filters.${status}`)}
    </span>
  );
}

function CourseCard({ course, onDelete, onArchive, t }: { course: any; onDelete: (id: string) => void; onArchive: (id: string) => void; t: any }) {
  const [hover, setHover] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
      style={{ 
        display: "flex",
        flexDirection: "column",
        background: C.surface, 
        border: `1px solid ${hover ? C.gold : C.borderLight}`, 
        borderRadius: 16, 
        overflow: "hidden", 
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", 
        transform: hover ? "translateY(-3px)" : "none", 
        boxShadow: hover ? `0 12px 28px rgba(26,38,29,0.08)` : "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 170, background: C.bgAlt, position: "relative", overflow: "hidden" }}>
        {course.thumbnail ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image src={course.thumbnail} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={42} color="rgba(184,134,69,0.25)" />
          </div>
        )}

        {course.moduleNumber && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(26,38,29,0.85)", color: "#FFFFFF", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700 }}>
            {t("moduleNumber", { num: course.moduleNumber })}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "24px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <StatusBadge status={course.status} t={t} />
        </div>

        <h3 style={{
          fontFamily: "'Inter', sans-serif", fontSize: 18, color: C.dark,
          fontWeight: 800, lineHeight: 1.4, marginBottom: 8,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {course.title}
        </h3>

        {course.program?.title && (
          <div style={{
            fontSize: 11, color: C.gold, fontWeight: 700,
            marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em",
            background: C.goldLight, padding: "4px 10px", borderRadius: 6,
            display: "inline-block", alignSelf: "flex-start",
          }}>
             {course.program.title}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: C.muted, fontWeight: 500, marginBottom: 20 }}>
          <span>{t("modulesCount", { count: course._count?.sections || 0 })}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={14} /> {t("studentsCount", { count: course._count?.enrollments || 0 })}</span>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.borderLight}`, paddingTop: 16, marginTop: "auto" }}>
          <Link href={`/instructor/courses/${course.id}`}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: C.goldLight, border: `1px solid rgba(184,134,69,0.25)`,
              color: C.gold, borderRadius: 10, padding: "10px 0",
              fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
              textDecoration: "none", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.color = C.gold; }}
          >
            <Edit2 size={13} /> {t("edit")}
          </Link>
          <Link href={`/instructor/courses/${course.id}/students`}
            title={t("manageStudents")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: C.bgAlt, border: `1px solid ${C.border}`,
              color: C.dark, borderRadius: 10, padding: "10px 14px",
              textDecoration: "none", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.border; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.bgAlt; }}
          >
            <Users size={15} />
          </Link>
          {course.status !== "ARCHIVED" && (
            <button onClick={() => onArchive(course.id)}
              title={t("archiveCourse")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: C.bgAlt, border: `1px solid ${C.border}`,
                color: C.muted, borderRadius: 10, padding: "10px 14px",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.border; e.currentTarget.style.color = C.dark; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.bgAlt; e.currentTarget.style.color = C.muted; }}
            >
              <Archive size={15} />
            </button>
          )}
          <button onClick={() => onDelete(course.id)}
            title={t("deleteCourse")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(220,74,74,0.06)", border: `1px solid rgba(220,74,74,0.2)`,
              color: C.red, borderRadius: 10, padding: "10px 14px",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220,74,74,0.06)"; e.currentTarget.style.color = C.red; }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorCoursesPage() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const qc = useQueryClient();
  const confirm = useConfirm();
  const t = useTranslations("instructor.courses");

  const { data, isLoading } = useQuery({ queryKey: ["instructor-courses"], queryFn: () => getInstructorCourses() });
  const courses = (data?.courses || []).filter((c: any) => filter === "ALL" || c.status === filter);

  const deleteMut = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => { toast.success(t("toastDeleted")); qc.invalidateQueries({ queryKey: ["instructor-courses"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("toastDeleteFail")),
  });

  const FILTERS: StatusFilter[] = ["ALL", "PUBLISHED", "DRAFT", "PENDING", "REJECTED", "ARCHIVED"];

  const archiveMut = useMutation({
    mutationFn: (id: string) => updateCourse(id, { status: "ARCHIVED" }),
    onSuccess: () => { toast.success(t("toastArchived")); qc.invalidateQueries({ queryKey: ["instructor-courses"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("toastArchiveFail")),
  });

  return (
    <div style={{
      width: "100%", maxWidth: 1200, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 28,
      paddingBottom: 64, boxSizing: "border-box",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header section */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.dark, letterSpacing: "-0.02em" }}>
              {t("title")}
            </h1>
            <span style={{
              background: C.goldLight, color: C.gold,
              borderRadius: 20, padding: "4px 14px",
              fontSize: 13, fontWeight: 800,
            }}>
              {data?.courses?.length || 0}
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", fontSize: 14, fontWeight: 500, color: C.muted, lineHeight: 1.5 }}>
            {t("desc")}
          </p>
        </div>
      </div>

      {/* ── MODERN FLOATING FILTER CHIPS (RESPONSIVE & PADDED) ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          const count = f === "ALL" 
            ? (data?.courses?.length || 0)
            : (data?.courses?.filter((c: any) => c.status === f).length || 0);

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                border: active ? "none" : `1px solid ${C.borderLight}`,
                background: active
                  ? `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`
                  : C.surface,
                color: active ? "#FFFFFF" : C.muted,
                fontSize: 13,
                fontWeight: active ? 800 : 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: active
                  ? `0 4px 14px ${C.goldGlow}`
                  : "0 1px 3px rgba(0,0,0,0.03)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = C.bgAlt;
                  e.currentTarget.style.color = C.dark;
                  e.currentTarget.style.borderColor = C.gold;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = C.surface;
                  e.currentTarget.style.color = C.muted;
                  e.currentTarget.style.borderColor = C.borderLight;
                }
              }}
            >
              <span>{t(`filters.${f}`)}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 10,
                  background: active ? "rgba(255,255,255,0.25)" : C.bgAlt,
                  color: active ? "#FFFFFF" : C.darkSoft,
                  lineHeight: 1,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 340, background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 16, opacity: 0.7, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ height: 170, background: C.bgAlt }} />
              <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
                <div style={{ height: 20, width: 60, background: C.bgAlt, borderRadius: 6 }} />
                <div style={{ height: 24, width: "80%", background: C.bgAlt, borderRadius: 4 }} />
                <div style={{ height: 16, width: "40%", background: C.bgAlt, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", background: C.surface, border: `2px dashed ${C.border}`, borderRadius: 20 }}>
          <div style={{ width: 64, height: 64, background: C.goldLight, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: C.gold }}>
            <BookOpen size={30} />
          </div>
          <h2 style={{ fontSize: 22, color: C.dark, marginBottom: 8, fontWeight: 800 }}>{t("noCourses")}</h2>
          <p style={{ color: C.muted, fontSize: 14, fontStyle: "italic", marginBottom: 4, fontWeight: 500 }}>{t("verseQuote")}</p>
          <p style={{ color: C.muted, fontSize: 12 }}>{t("verseRef")}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {courses.map((c: any) => (
            <CourseCard 
              key={c.id} 
              course={c} 
              onDelete={async (id) => { if (await confirm(t("confirmDelete"))) deleteMut.mutate(id); }}
              onArchive={async (id) => { if (await confirm(t("confirmArchive"))) archiveMut.mutate(id); }} 
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
