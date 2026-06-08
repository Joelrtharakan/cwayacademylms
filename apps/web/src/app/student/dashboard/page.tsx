"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, useAuthStore } from "@/store/auth.store";
import { THEME } from "@/lib/cway-theme";
import Link from "next/link";
import { PlayCircle, Clock, BookOpen, Award, ChevronRight, CheckCircle } from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: () => api.get("/student/dashboard").then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${THEME.MUTED}`, borderTopColor: THEME.GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const enrollments = data?.enrollments || [];
  const activeEnrollment = data?.activeEnrollment;
  const inProgress = enrollments.filter((e: any) => e.status === "ACTIVE" && e.progress < 100);
  const completed = enrollments.filter((e: any) => e.progress >= 100);

  return (
    <div style={{ padding: "24px 0", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, color: THEME.HERO, marginBottom: 8 }}>
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p style={{ color: THEME.MUTED, fontSize: 16 }}>
          Ready to continue your theological journey?
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
        {/* Main Content */}
        <div>
          {/* Continue Learning */}
          {activeEnrollment && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, display: "flex", alignItems: "center", gap: 8 }}>
                  <PlayCircle size={24} color={THEME.GOLD} /> Continue Learning
                </h2>
              </div>
              <div style={{ 
                background: "white", 
                borderRadius: 16, 
                overflow: "hidden", 
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ height: 160, background: THEME.HERO, position: "relative" }}>
                  {activeEnrollment.course.thumbnail && (
                    <img 
                      src={activeEnrollment.course.thumbnail} 
                      alt={activeEnrollment.course.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
                    />
                  )}
                  <div style={{ position: "absolute", top: 16, left: 16, background: THEME.GOLD, color: "white", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    IN PROGRESS
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: THEME.HERO, marginBottom: 8 }}>{activeEnrollment.course.title}</h3>
                  <p style={{ color: THEME.MUTED, fontSize: 14, marginBottom: 24 }}>
                    Instructor: {activeEnrollment.course.instructor.name} • {activeEnrollment.course.moduleNumber ? `Module ${activeEnrollment.course.moduleNumber}` : ''}
                  </p>
                  
                  {/* Progress Bar */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: THEME.MUTED, fontWeight: 500 }}>
                      <span>Course Progress</span>
                      <span style={{ color: THEME.GOLD }}>{Math.round(activeEnrollment.progress)}%</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(201,151,58,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: THEME.GOLD, width: `${activeEnrollment.progress}%`, borderRadius: 3 }} />
                    </div>
                  </div>

                  <Link 
                    href={`/student/courses/${activeEnrollment.course.id}/learn`}
                    style={{ 
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      background: THEME.HERO, color: THEME.LIGHT, padding: "12px 24px", borderRadius: 8,
                      textDecoration: "none", fontWeight: 600, transition: "background 0.2s"
                    }}
                  >
                    <PlayCircle size={18} /> Resume Course
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Courses */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO }}>Enrolled Courses</h2>
              <Link href="/student/my-courses" style={{ color: THEME.GOLD, textDecoration: "none", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center" }}>
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {inProgress.slice(0, 4).map((enrollment: any) => (
                <Link 
                  key={enrollment.id} 
                  href={`/student/courses/${enrollment.course.id}/learn`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s" }}
                       onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)"; }}
                       onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ height: 140, background: THEME.MUTED, position: "relative" }}>
                      {enrollment.course.thumbnail && (
                        <img src={enrollment.course.thumbnail} alt={enrollment.course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(201,151,58,0.2)" }}>
                        <div style={{ height: "100%", background: THEME.GOLD, width: `${enrollment.progress}%` }} />
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <h3 style={{ color: THEME.HERO, fontSize: 16, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {enrollment.course.title}
                      </h3>
                      <p style={{ color: THEME.MUTED, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                        <BookOpen size={14} /> {enrollment.course._count?.sections || 0} Modules
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Stats Overview */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: THEME.HERO, marginBottom: 16 }}>Overview</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(201,151,58,0.1)", color: THEME.GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: THEME.HERO }}>{inProgress.length}</div>
                  <div style={{ fontSize: 12, color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>Courses in Progress</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(138,158,140,0.1)", color: "#8A9E8C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: THEME.HERO }}>{completed.length}</div>
                  <div style={{ fontSize: 12, color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>Courses Completed</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(201,151,58,0.1)", color: THEME.GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: THEME.HERO }}>{completed.length}</div>
                  <div style={{ fontSize: 12, color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>Certificates Earned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines / Schedule */}
          <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: THEME.HERO }}>Upcoming</h3>
              <Clock size={16} color={THEME.MUTED} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ textAlign: "center", padding: "20px 0", color: THEME.MUTED, fontSize: 14 }}>
                No upcoming assignments due.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
