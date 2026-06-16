"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProgramById, addCourseToProgram } from "@/lib/api/admin";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, BookOpen, UserCircle, Clock, Edit3,
  MoreVertical, Users, CheckCircle, AlertCircle, Mail
} from "lucide-react";
import Link from "next/link";
import { AddCourseModal } from "@/components/admin/lms/AddCourseModal";
import { AssignInstructorModal } from "@/components/admin/lms/AssignInstructorModal";
import { SkeletonRow } from "@/components/shared/SkeletonLoader";

function InvitationBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    UNASSIGNED: { bg: "rgba(138,158,140,0.12)", color: "#8A9E8C", label: "Unassigned" },
    PENDING: { bg: "rgba(201,151,58,0.12)", color: "#C9973A", label: "Invitation Sent" },
    ACCEPTED: { bg: "rgba(74,140,92,0.12)", color: "#4A8C5C", label: "Accepted" },
    DECLINED: { bg: "rgba(140,58,58,0.12)", color: "#8C3A3A", label: "Declined" },
  };
  const s = map[status] || map.UNASSIGNED;
  return (
    <span style={{
      background: s.bg, color: s.color, borderRadius: 999,
      padding: "3px 10px", fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {s.label}
    </span>
  );
}

function CourseStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PUBLISHED: { bg: "rgba(74,140,92,0.12)", color: "#4A8C5C" },
    PENDING: { bg: "rgba(201,151,58,0.12)", color: "#C9973A" },
    DRAFT: { bg: "rgba(138,158,140,0.15)", color: "#8A9E8C" },
    REJECTED: { bg: "rgba(140,58,58,0.12)", color: "#8C3A3A" },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
      {status}
    </span>
  );
}

export default function ProgramDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [assignState, setAssignState] = useState<{ open: boolean; courseId: string; courseTitle: string }>({
    open: false, courseId: "", courseTitle: "",
  });

  const { data: program, isLoading } = useQuery({
    queryKey: ["program", id],
    queryFn: () => getProgramById(id),
  });

  const addCourseMut = useMutation({
    mutationFn: (d: any) => addCourseToProgram(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program", id] });
      toast.success("Course added to program");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add course"),
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100 }}>
        <div style={{ height: 32, background: "#E4E8E0", borderRadius: 8, width: 200, marginBottom: 32, animation: "pulse 1.5s infinite" }} />
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div style={{ textAlign: "center", padding: "80px 40px" }}>
        <p style={{ color: "#8A9E8C" }}>Program not found</p>
        <Link href="/admin/programs" style={{ color: "#C9973A" }}>← Back to Programs</Link>
      </div>
    );
  }

  const courses: any[] = program.courses || [];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Back nav */}
      <Link
        href="/admin/programs"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8A9E8C", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 24, transition: "color 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#1C2B1E"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#8A9E8C"; }}
      >
        <ArrowLeft size={15} /> Back to Programs
      </Link>

      {/* Program header card */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid #E8EAE4",
        boxShadow: "0 2px 12px rgba(28,43,30,0.05)",
        padding: "28px 32px",
        marginBottom: 28,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 24,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(201,151,58,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#C9973A",
            }}>
              <BookOpen size={18} />
            </div>
            <span style={{
              background: program.status === "PUBLISHED" ? "rgba(74,140,92,0.12)" : "rgba(138,158,140,0.15)",
              color: program.status === "PUBLISHED" ? "#4A8C5C" : "#8A9E8C",
              borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            }}>
              {program.status}
            </span>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#1C2B1E", margin: "0 0 6px 0" }}>
            {program.title}
          </h1>
          {program.description && (
            <p style={{ fontSize: 14, color: "#8A9E8C", margin: "0 0 16px 0", lineHeight: 1.6 }}>
              {program.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8A9E8C", fontSize: 13 }}>
              <BookOpen size={14} color="#C9973A" />
              <span><strong style={{ color: "#1C2B1E" }}>{courses.length}</strong> courses</span>
            </div>
            {program.duration && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8A9E8C", fontSize: 13 }}>
                <Clock size={14} />
                <span>{program.duration}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddCourse(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 20px",
            background: "#C9973A",
            border: "none", borderRadius: 10,
            color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(201,151,58,0.25)",
            transition: "all 0.2s", flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#E8B85A"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#C9973A"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Courses section */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8EAE4", boxShadow: "0 1px 4px rgba(28,43,30,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #EEF0EA" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
            Courses in this Program
          </h2>
        </div>

        {courses.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(201,151,58,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: "#C9973A",
            }}>
              <BookOpen size={26} />
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1C2B1E", margin: "0 0 8px" }}>
              No courses yet
            </h3>
            <p style={{ fontSize: 13, color: "#8A9E8C", margin: "0 0 20px" }}>
              Add courses and assign instructors to build this program's curriculum.
            </p>
            <button
              onClick={() => setShowAddCourse(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", background: "#C9973A",
                border: "none", borderRadius: 10, color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              <Plus size={15} /> Add First Course
            </button>
          </div>
        ) : (
          <div>
            {courses.map((course: any, idx: number) => (
              <div
                key={course.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 28px",
                  borderBottom: idx < courses.length - 1 ? "1px solid #F0F2ED" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAF8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {/* Index number */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(201,151,58,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#C9973A", flexShrink: 0,
                }}>
                  {idx + 1}
                </div>

                {/* Thumbnail */}
                <div style={{
                  width: 48, height: 36, borderRadius: 6, flexShrink: 0,
                  background: "#F0F2ED", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <BookOpen size={16} color="#8A9E8C" />
                  )}
                </div>

                {/* Course info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1C2B1E", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {course.title}
                    </p>
                    <CourseStatusBadge status={course.status} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {course.instructor ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#8A9E8C" }}>
                        <UserCircle size={13} />
                        <span>{course.instructor.name}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#8C3A3A" }}>No instructor assigned</span>
                    )}
                    {course._count?.sections > 0 && (
                      <span style={{ fontSize: 12, color: "#8A9E8C" }}>
                        · {course._count.sections} week{course._count.sections !== 1 ? "s" : ""}
                      </span>
                    )}
                    {course._count?.enrollments > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8A9E8C" }}>
                        <Users size={12} />
                        <span>{course._count.enrollments} enrolled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invitation status */}
                <InvitationBadge status={course.invitationStatus || "UNASSIGNED"} />

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {(course.invitationStatus === "UNASSIGNED" || course.invitationStatus === "DECLINED") && (
                    <button
                      onClick={() => setAssignState({ open: true, courseId: course.id, courseTitle: course.title })}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px",
                        background: "rgba(201,151,58,0.1)",
                        border: "1px solid rgba(201,151,58,0.3)",
                        borderRadius: 8, color: "#C9973A", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,151,58,0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,151,58,0.1)"; }}
                    >
                      <Mail size={13} />
                      Assign Instructor
                    </button>
                  )}
                  <Link
                    href={`/admin/courses?search=${encodeURIComponent(course.title)}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 32, height: 32, borderRadius: 8,
                      background: "transparent", border: "1px solid #E4E8E0",
                      color: "#8A9E8C", cursor: "pointer", textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <Edit3 size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCourseModal
        open={showAddCourse}
        programId={id}
        onClose={() => setShowAddCourse(false)}
        onSubmit={(d) => addCourseMut.mutateAsync(d)}
      />

      <AssignInstructorModal
        open={assignState.open}
        courseId={assignState.courseId}
        courseTitle={assignState.courseTitle}
        onClose={() => setAssignState({ open: false, courseId: "", courseTitle: "" })}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["program", id] })}
      />
    </div>
  );
}
