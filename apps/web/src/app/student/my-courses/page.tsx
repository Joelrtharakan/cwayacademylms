"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { THEME } from "@/lib/cway-theme";
import Link from "next/link";
import { BookOpen, Award, CheckCircle } from "lucide-react";

export default function MyCoursesPage() {
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
  const inProgress = enrollments.filter((e: any) => e.status === "ACTIVE" && e.progress < 100);
  const completed = enrollments.filter((e: any) => e.progress >= 100);

  return (
    <div style={{ padding: "24px 0", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, color: THEME.HERO, marginBottom: 8 }}>
          My Courses
        </h1>
        <p style={{ color: THEME.MUTED, fontSize: 16 }}>
          Track your progress and revisit your learning journey.
        </p>
      </div>

      {inProgress.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={20} color={THEME.GOLD} /> In Progress
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {inProgress.map((enrollment: any) => (
              <Link 
                key={enrollment.id} 
                href={`/student/courses/\${enrollment.course.id}/learn`}
                style={{ textDecoration: "none" }}
              >
                <div style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s", height: "100%", display: "flex", flexDirection: "column" }}
                     onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)"; }}
                     onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ height: 160, background: THEME.MUTED, position: "relative" }}>
                    {enrollment.course.thumbnail && (
                      <img src={enrollment.course.thumbnail} alt={enrollment.course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "rgba(201,151,58,0.2)" }}>
                      <div style={{ height: "100%", background: THEME.GOLD, width: `\${enrollment.progress}%` }} />
                    </div>
                  </div>
                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ color: THEME.HERO, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                      {enrollment.course.title}
                    </h3>
                    <p style={{ color: THEME.MUTED, fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                      Instructor: {enrollment.course.instructor.name}
                    </p>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 500 }}>
                      <span style={{ color: THEME.MUTED }}>{Math.round(enrollment.progress)}% Complete</span>
                      <span style={{ color: THEME.GOLD }}>Continue →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={20} color={"#8A9E8C"} /> Completed Courses
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {completed.map((enrollment: any) => (
              <div key={enrollment.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 160, background: THEME.MUTED, position: "relative" }}>
                  {enrollment.course.thumbnail && (
                    <img src={enrollment.course.thumbnail} alt={enrollment.course.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                  )}
                  <div style={{ position: "absolute", top: 12, right: 12, background: "#8A9E8C", color: "white", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={14} /> COMPLETED
                  </div>
                </div>
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ color: THEME.HERO, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                    {enrollment.course.title}
                  </h3>
                  <p style={{ color: THEME.MUTED, fontSize: 14, marginBottom: 16 }}>
                    Instructor: {enrollment.course.instructor.name}
                  </p>
                  <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
                    <Link href={`/student/courses/\${enrollment.course.id}/learn`} style={{ flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 8, border: `1px solid \${THEME.MUTED}`, color: THEME.HERO, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                      Review
                    </Link>
                    <Link href="/student/certificates" style={{ flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 8, background: THEME.HERO, color: THEME.LIGHT, textDecoration: "none", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Award size={16} /> Certificate
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {enrollments.length === 0 && (
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
