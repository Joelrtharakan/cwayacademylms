"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { THEME } from "@/lib/cway-theme";
import { usePlayerStore } from "@/store/player.store";
import PlayerNavbar from "@/components/student/player/PlayerNavbar";
import PlayerSidebar from "@/components/student/player/PlayerSidebar";

export default function CoursePlayerLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: { courseId: string }
}) {
  const { setCourseId, setEnrollmentId } = usePlayerStore();

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ["enrollment", params.courseId],
    queryFn: () => api.get(`/student/courses/\${params.courseId}/learn`).then(res => res.data.data),
    retry: 1
  });

  useEffect(() => {
    setCourseId(params.courseId);
  }, [params.courseId, setCourseId]);

  useEffect(() => {
    if (enrollment) {
      setEnrollmentId(enrollment.id);
    }
  }, [enrollment, setEnrollmentId]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: THEME.SURFACE }}>
        <div style={{ width: 40, height: 40, border: `4px solid \${THEME.MUTED}`, borderTopColor: THEME.GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: THEME.SURFACE, flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 24, color: THEME.HERO }}>Enrollment not found</h2>
        <p style={{ color: THEME.MUTED }}>You do not have access to this course.</p>
        <a href="/student/dashboard" style={{ color: THEME.GOLD, textDecoration: "none" }}>Return to Dashboard</a>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: THEME.SURFACE, overflow: "hidden" }}>
      <PlayerNavbar courseTitle={enrollment.course.title} progress={enrollment.progress} />
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div className="hidden md:block">
          <PlayerSidebar courseId={params.courseId} modules={enrollment.course.sections} />
        </div>
        
        <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
