"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Edit2, Trash2, Users, Archive, Layers } from "lucide-react";
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

function resolveTitle(title: any): string {
  if (!title) return "Untitled Course";
  if (typeof title === "string") return title;
  return title.en || title.hi || Object.values(title)[0] || "Untitled Course";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    PUBLISHED: { bg: "rgba(61,122,75,0.12)", text: C.green },
    DRAFT: { bg: "rgba(184,134,69,0.12)", text: C.gold },
    PENDING: { bg: "rgba(60,52,137,0.12)", text: "#3c3489" },
    REJECTED: { bg: "rgba(220,74,74,0.12)", text: C.red },
    ARCHIVED: { bg: "rgba(127,142,130,0.12)", text: C.muted },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        borderRadius: 8,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
}

function CourseCard({
  course,
  onDelete,
  onArchive,
  t,
}: {
  course: any;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  t: any;
}) {
  const [hover, setHover] = useState(false);
  const titleStr = resolveTitle(course.title);
  const programTitleStr = course.program?.title ? resolveTitle(course.program.title) : null;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: C.surface,
        border: `1px solid ${hover ? C.gold : C.borderLight}`,
        borderRadius: 18,
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? "0 12px 28px rgba(26,38,29,0.08)" : "0 1px 3px rgba(0,0,0,0.03)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 175, background: C.bgAlt, position: "relative", overflow: "hidden" }}>
        {course.thumbnail ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              src={course.thumbnail}
              alt={titleStr}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={42} color="rgba(184,134,69,0.25)" />
          </div>
        )}

        {course.moduleNumber && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(26,38,29,0.85)",
              color: "#FFFFFF",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Module {course.moduleNumber}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ marginBottom: 10 }}>
          <StatusBadge status={course.status} />
        </div>

        <h3
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 17,
            color: C.dark,
            fontWeight: 800,
            lineHeight: 1.4,
            marginBottom: 8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
          title={titleStr}
        >
          {titleStr}
        </h3>

        {programTitleStr && (
          <div
            style={{
              fontSize: 11,
              color: C.gold,
              fontWeight: 700,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: C.goldLight,
              padding: "3px 9px",
              borderRadius: 6,
              display: "inline-block",
              alignSelf: "flex-start",
              maxWidth: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {programTitleStr}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 12,
            color: C.muted,
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Layers size={13} /> {course._count?.sections || 0} module(s)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Users size={13} /> {course._count?.enrollments || 0} student(s)
          </span>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            borderTop: `1px solid ${C.borderLight}`,
            paddingTop: 14,
            marginTop: "auto",
          }}
        >
          <Link
            href={`/instructor/courses/${course.id}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: C.goldLight,
              border: `1px solid rgba(184,134,69,0.25)`,
              color: C.gold,
              borderRadius: 10,
              padding: "9px 0",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.gold;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.goldLight;
              e.currentTarget.style.color = C.gold;
            }}
          >
            <Edit2 size={13} /> Edit
          </Link>

          <Link
            href={`/instructor/courses/${course.id}/students`}
            title="Manage Students"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: C.bgAlt,
              border: `1px solid ${C.border}`,
              color: C.dark,
              borderRadius: 10,
              padding: "9px 12px",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.bgAlt;
            }}
          >
            <Users size={15} />
          </Link>

          {course.status !== "ARCHIVED" && (
            <button
              onClick={() => onArchive(course.id)}
              title="Archive Course"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.bgAlt,
                border: `1px solid ${C.border}`,
                color: C.muted,
                borderRadius: 10,
                padding: "9px 12px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.border;
                e.currentTarget.style.color = C.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.bgAlt;
                e.currentTarget.style.color = C.muted;
              }}
            >
              <Archive size={15} />
            </button>
          )}

          <button
            onClick={() => onDelete(course.id)}
            title="Delete Course"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(220,74,74,0.06)",
              border: "1px solid rgba(220,74,74,0.2)",
              color: C.red,
              borderRadius: 10,
              padding: "9px 12px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.red;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(220,74,74,0.06)";
              e.currentTarget.style.color = C.red;
            }}
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

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => getInstructorCourses(),
  });

  const courses = (data?.courses || []).filter(
    (c: any) => filter === "ALL" || c.status === filter
  );

  const deleteMut = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      toast.success("Course deleted");
      qc.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete course"),
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => updateCourse(id, { status: "ARCHIVED" }),
    onSuccess: () => {
      toast.success("Course archived");
      qc.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to archive course"),
  });

  const FILTERS: StatusFilter[] = [
    "ALL",
    "PUBLISHED",
    "DRAFT",
    "PENDING",
    "REJECTED",
    "ARCHIVED",
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1150,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        paddingBottom: 64,
        boxSizing: "border-box",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── HEADER CARD (RESPONSIVE LAPTOP & MOBILE) ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderTop: `1px solid ${C.border}`,
          borderRight: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          borderLeft: `4px solid ${C.gold}`,
          borderRadius: 20,
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(22px, 3vw, 26px)",
                fontWeight: 800,
                color: C.dark,
                fontFamily: "Georgia, serif",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              My Courses
            </h1>
            <span
              style={{
                background: C.goldLight,
                color: C.gold,
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 12,
                fontWeight: 800,
                border: `1px solid rgba(184,134,69,0.2)`,
              }}
            >
              {data?.courses?.length || 0}
            </span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.4 }}>
            Manage and monitor your course catalog.
          </p>
        </div>
      </div>

      {/* ── RESPONSIVE FILTER CHIPS (2 COLS MOBILE, 3 COLS TABLET, 6 COLS DESKTOP) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 w-full">
        {FILTERS.map((f) => {
          const active = filter === f;
          const count =
            f === "ALL"
              ? data?.courses?.length || 0
              : data?.courses?.filter((c: any) => c.status === f).length || 0;

          const labelMap: Record<string, string> = {
            ALL: "All",
            PUBLISHED: "Published",
            DRAFT: "Draft",
            PENDING: "Pending",
            REJECTED: "Rejected",
            ARCHIVED: "Archived",
          };

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: 12,
                border: active ? "none" : `1px solid ${C.borderLight}`,
                background: active
                  ? `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`
                  : C.surface,
                color: active ? "#FFFFFF" : C.muted,
                fontSize: 13,
                fontWeight: active ? 800 : 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: active
                  ? `0 4px 14px ${C.goldGlow}`
                  : "0 1px 3px rgba(0,0,0,0.03)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <span style={{ whiteSpace: "nowrap" }}>{labelMap[f] || f}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 10,
                  background: active ? "rgba(255,255,255,0.25)" : C.bgAlt,
                  color: active ? "#FFFFFF" : C.darkSoft,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── COURSE GRID ── */}
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 340,
                background: C.surface,
                border: `1px solid ${C.borderLight}`,
                borderRadius: 18,
                opacity: 0.7,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ height: 175, background: C.bgAlt }} />
              <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
                <div style={{ height: 20, width: 60, background: C.bgAlt, borderRadius: 6 }} />
                <div style={{ height: 24, width: "80%", background: C.bgAlt, borderRadius: 4 }} />
                <div style={{ height: 16, width: "40%", background: C.bgAlt, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: C.surface,
            border: `2px dashed ${C.border}`,
            borderRadius: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: C.goldLight,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: C.gold,
            }}
          >
            <BookOpen size={26} />
          </div>
          <h2 style={{ fontSize: 20, color: C.dark, marginBottom: 8, fontWeight: 800 }}>
            No courses found
          </h2>
          <p style={{ color: C.muted, fontSize: 13, fontStyle: "italic", marginBottom: 4, fontWeight: 500 }}>
            "Whatever you do, work at it with all your heart"
          </p>
          <p style={{ color: C.muted, fontSize: 12 }}>— Colossians 3:23</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {courses.map((c: any) => (
            <CourseCard
              key={c.id}
              course={c}
              onDelete={async (id) => {
                if (await confirm("Delete this course?")) deleteMut.mutate(id);
              }}
              onArchive={async (id) => {
                if (await confirm("Archive this course? It will no longer be visible to new students.")) archiveMut.mutate(id);
              }}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
