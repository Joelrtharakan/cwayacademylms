"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { THEME } from "@/lib/cway-theme";
import Link from "next/link";
import { BookOpen, Award, CheckCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MyCoursesPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: () => api.get("/student/dashboard").then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ width: 40, height: 40, border: `4px solid \${THEME.MUTED}`, borderTopColor: THEME.GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const enrollments = data?.enrollments || [];
  const programEnrollments = data?.programEnrollments || [];

  const programCourseIds = new Set<string>();
  programEnrollments.forEach((pe: any) => {
    pe.program.courses.forEach((c: any) => programCourseIds.add(c.id));
  });

  const standaloneEnrollments = enrollments.filter((e: any) => !programCourseIds.has(e.courseId));
  const standaloneInProgress = standaloneEnrollments.filter((e: any) => e.status === "ACTIVE" && e.progress < 100);
  const standaloneCompleted = standaloneEnrollments.filter((e: any) => e.progress >= 100);

  const renderCourseCard = (course: any, enrollment: any | null, isProgramCourse: boolean = false) => {
    const isCompleted = enrollment && enrollment.progress >= 100;
    const isLocked = !enrollment;

    const cardContent = (
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s", height: "100%", display: "flex", flexDirection: "column", opacity: isLocked ? 0.7 : 1, cursor: isLocked ? "default" : "pointer" }}
           onClick={(e) => {
             if (!isLocked && !(e.target as HTMLElement).closest('a')) {
               router.push(`/student/courses/${course.id}/learn`);
             }
           }}
           onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)"; } }}
           onMouseLeave={e => { if (!isLocked) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; } }}
      >
        <div style={{ height: 160, background: THEME.MUTED, position: "relative", filter: isLocked ? "grayscale(100%)" : "none" }}>
          {course.thumbnail && (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image src={course.thumbnail} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
            </div>
          )}
          {isCompleted && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "#8A9E8C", color: "white", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle size={14} /> COMPLETED
            </div>
          )}
          {isLocked && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              LOCKED
            </div>
          )}
          {!isCompleted && !isLocked && enrollment && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "rgba(201,151,58,0.2)" }}>
              <div style={{ height: "100%", background: THEME.GOLD, width: `${enrollment.progress}%` }} />
            </div>
          )}
        </div>
        <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ color: THEME.HERO, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {course.title}
          </h3>
          <p style={{ color: THEME.MUTED, fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            Instructor: {course.instructor?.name}
          </p>
          
          <div style={{ marginTop: "auto" }}>
            {isCompleted && (
              <div style={{ display: "flex", gap: 12 }}>
                <Link href={`/student/courses/${course.id}/learn`} style={{ flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 8, border: `1px solid ${THEME.MUTED}`, color: THEME.HERO, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                  Review
                </Link>
                {!isProgramCourse && (
                  <Link href="/student/certificates" style={{ flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 8, background: THEME.HERO, color: THEME.LIGHT, textDecoration: "none", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Award size={16} /> Certificate
                  </Link>
                )}
              </div>
            )}
            {!isCompleted && !isLocked && enrollment && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 500 }}>
                <span style={{ color: THEME.MUTED }}>{Math.round(enrollment.progress)}% Complete</span>
                <span style={{ color: THEME.GOLD }}>Continue →</span>
              </div>
            )}
            {isLocked && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: 13, fontWeight: 500, color: THEME.MUTED, background: "#f5f5f5", padding: "8px", borderRadius: "8px" }}>
                Unlocks after completing previous course
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (isLocked) return <div key={course.id}>{cardContent}</div>;

    return (
      <div key={course.id} style={{ textDecoration: "none" }}>
        {cardContent}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px 0", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, color: THEME.HERO, marginBottom: 8 }}>
          My Courses
        </h1>
        <p style={{ color: THEME.MUTED, fontSize: 16 }}>
          Track your progress and revisit your learning journey.
        </p>
      </div>

      {programEnrollments.map((pe: any) => {
        const isProgramCompleted = pe.program.courses.every((c: any) => {
          const e = enrollments.find((e: any) => e.courseId === c.id);
          return e && e.progress >= 100;
        });

        return (
          <div key={pe.id} style={{ marginBottom: 56 }}>
            <div style={{ marginBottom: 24, borderBottom: `2px solid ${THEME.GOLD}`, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: THEME.GOLD, textTransform: "uppercase", letterSpacing: "1px" }}>Enrolled Program</span>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: THEME.HERO, marginTop: 4 }}>
                  {pe.program.title}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {isProgramCompleted && (
                  <>
                    <Link href={`/student/programs/${pe.program.id}/grade-sheet`} style={{ background: "white", color: THEME.HERO, border: `1px solid ${THEME.HERO}`, textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "8px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <FileText size={16} /> Grade Sheet
                    </Link>
                    <Link href="/student/certificates" style={{ background: THEME.HERO, color: THEME.LIGHT, textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "8px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Award size={16} /> Program Certificate
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {pe.program.courses.map((course: any) => {
                const enrollment = enrollments.find((e: any) => e.courseId === course.id);
                return renderCourseCard(course, enrollment, true);
              })}
            </div>
          </div>
        );
      })}

      {standaloneInProgress.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={20} color={THEME.GOLD} /> Standalone Courses - In Progress
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {standaloneInProgress.map((enrollment: any) => renderCourseCard(enrollment.course, enrollment))}
          </div>
        </div>
      )}

      {standaloneCompleted.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={20} color={"#8A9E8C"} /> Standalone Courses - Completed
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {standaloneCompleted.map((enrollment: any) => renderCourseCard(enrollment.course, enrollment))}
          </div>
        </div>
      )}

      {enrollments.length === 0 && programEnrollments.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)" }}>
          <BookOpen size={48} color={THEME.MUTED} style={{ opacity: 0.5, margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, marginBottom: 8 }}>You haven't enrolled in any courses yet</h3>
          <p style={{ color: THEME.MUTED, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            Browse our catalog to find theological courses that will equip you for ministry.
          </p>
          <Link href="/courses" style={{ background: THEME.GOLD, color: "white", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, display: "inline-block" }}>
            Explore Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
