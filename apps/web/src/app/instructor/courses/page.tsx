"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, BookOpen, Edit2, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getInstructorCourses, deleteCourse } from "@/lib/api/instructor";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "PENDING" | "REJECTED" | "ARCHIVED";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    PUBLISHED: { bg: "rgba(61,122,75,0.1)", text: "#3D7A4B" },
    DRAFT: { bg: "rgba(184,134,69,0.1)", text: "#B88645" },
    PENDING: { bg: "rgba(60,52,137,0.1)", text: "#3c3489" },
    REJECTED: { bg: "rgba(176,58,46,0.1)", text: "#B03A2E" },
    ARCHIVED: { bg: "rgba(143,158,147,0.1)", text: "#8F9E93" },
  };
  const s = map[status] || map.DRAFT;
  return <span style={{ background: s.bg, color: s.text, borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{status}</span>;
}

function CourseCard({ course, onDelete }: { course: any; onDelete: (id: string) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
      style={{ 
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF", 
        border: `1px solid ${hover ? "#B88645" : "#E4E8E0"}`, 
        borderRadius: "16px", 
        overflow: "hidden", 
        transition: "all 0.2s", 
        transform: hover ? "translateY(-2px)" : "none", 
        boxShadow: hover ? "0 10px 25px rgba(26,38,29,0.08)" : "0 1px 3px rgba(26,38,29,0.04)" 
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 160, background: "#F7F8F5", position: "relative", overflow: "hidden" }}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={40} color="rgba(184,134,69,0.2)" />
          </div>
        )}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <StatusBadge status={course.status} />
        </div>
        {course.moduleNumber && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(26,38,29,0.8)", color: "#FFFFFF", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>
            Module {course.moduleNumber}
          </div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#1A261D", fontWeight: 700, lineHeight: 1.3, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {course.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#8F9E93", fontWeight: 500, marginBottom: "20px" }}>
          <span>{course._count?.sections || 0} modules</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Users size={14} /> {course._count?.enrollments || 0} students</span>
        </div>
        {/* Footer */}
        <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #E4E8E0", paddingTop: "16px", marginTop: "auto" }}>
          <Link href={`/instructor/courses/${course.id}`}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "rgba(184,134,69,0.08)", border: "1px solid rgba(184,134,69,0.2)", color: "#B88645", borderRadius: "8px", padding: "8px 0", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.08)"; }}
          >
            <Edit2 size={13} /> Edit
          </Link>
          <Link href={`/instructor/courses/${course.id}/students`}
            title="Manage Students"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F8F5", border: "1px solid #E4E8E0", color: "#1A261D", borderRadius: "8px", padding: "8px 14px", textDecoration: "none", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#E4E8E0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#F7F8F5"; }}
          >
            <Users size={14} />
          </Link>
          <button onClick={() => onDelete(course.id)}
            title="Delete Course"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(176,58,46,0.05)", border: "1px solid rgba(176,58,46,0.15)", color: "#B03A2E", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.05)"; }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorCoursesPage() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["instructor-courses"], queryFn: () => getInstructorCourses() });
  const courses = (data?.courses || []).filter((c: any) => filter === "ALL" || c.status === filter);

  const deleteMut = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => { toast.success("Course deleted"); qc.invalidateQueries({ queryKey: ["instructor-courses"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete"),
  });

  const FILTERS: StatusFilter[] = ["ALL", "PUBLISHED", "DRAFT", "PENDING", "REJECTED"];

  return (
    <div style={{ maxWidth: "1400px" }}>
      {/* Header section */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#1A261D", margin: 0, lineHeight: 1.2 }}>
              My Courses
            </h1>
            <span style={{ background: "rgba(184,134,69,0.15)", color: "#B88645", borderRadius: "100px", padding: "4px 12px", fontSize: "13px", fontWeight: 700 }}>
              {data?.courses?.length || 0}
            </span>
          </div>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "#8F9E93", margin: "6px 0 0 0", lineHeight: 1.5 }}>
            Manage and monitor your course catalog.
          </p>
        </div>
        <Link 
          href="/instructor/courses/new" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            background: "#1A261D", 
            color: "#FFFFFF", 
            borderRadius: "10px", 
            padding: "10px 20px", 
            fontSize: "13px", 
            fontWeight: 600, 
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(26,38,29,0.15)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(26,38,29,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,38,29,0.15)";
          }}
        >
          <Plus size={16} />
          New Course
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "6px", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "12px", padding: "6px", width: "fit-content", marginBottom: "32px", boxShadow: "0 1px 3px rgba(26,38,29,0.02)" }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ 
              background: filter === f ? "#F7F8F5" : "transparent", 
              color: filter === f ? "#1A261D" : "#8F9E93", 
              border: "none",
              borderRadius: "8px", 
              padding: "8px 16px", 
              fontSize: "12px", 
              fontWeight: 700, 
              cursor: "pointer", 
              transition: "all 0.15s", 
              textTransform: "uppercase", 
              letterSpacing: "0.06em",
              boxShadow: filter === f ? "0 1px 2px rgba(26,38,29,0.06)" : "none"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: "320px", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "16px", animation: "pulse 1.5s infinite", opacity: 0.7 }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", background: "#FFFFFF", border: "1px dashed #DCE0D5", borderRadius: "16px" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(184,134,69,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <BookOpen size={28} color="#B88645" />
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#1A261D", marginBottom: "8px", fontWeight: 700 }}>No courses yet</h2>
          <p style={{ color: "#8F9E93", fontSize: "14px", fontStyle: "italic", marginBottom: "4px", fontWeight: 500 }}>"Whatever you do, work at it with all your heart"</p>
          <p style={{ color: "#8F9E93", fontSize: "12px", marginBottom: "28px" }}>— Colossians 3:23</p>
          <Link 
            href="/instructor/courses/new" 
            style={{ 
              display: "inline-block",
              background: "#1A261D", 
              color: "#FFFFFF", 
              borderRadius: "10px", 
              padding: "12px 24px", 
              fontSize: "13px", 
              fontWeight: 600, 
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(26,38,29,0.15)",
            }}
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {courses.map((c: any) => (
            <CourseCard key={c.id} course={c} onDelete={(id) => { if (confirm("Delete this course?")) deleteMut.mutate(id); }} />
          ))}
        </div>
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
