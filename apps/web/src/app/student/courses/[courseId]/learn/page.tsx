"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { THEME } from "@/lib/cway-theme";

export default function CoursePlayerRedirectPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ["enrollment", params.courseId],
    queryFn: () => api.get(`/student/courses/\${params.courseId}/learn`).then(res => res.data.data),
  });

  useEffect(() => {
    if (enrollment) {
      let firstIncompleteLessonId = null;
      let firstLessonId = null;

      for (const section of enrollment.course.sections) {
        for (const lesson of section.lessons) {
          if (!firstLessonId) firstLessonId = lesson.id;
          if (!lesson.isCompleted && !firstIncompleteLessonId) {
            firstIncompleteLessonId = lesson.id;
            break;
          }
        }
        if (firstIncompleteLessonId) break;
      }

      const targetLessonId = firstIncompleteLessonId || firstLessonId;
      
      if (targetLessonId) {
        router.replace(`/student/courses/\${params.courseId}/learn/\${targetLessonId}`);
      }
    }
  }, [enrollment, params.courseId, router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: THEME.SURFACE }}>
      <div style={{ width: 40, height: 40, border: `4px solid \${THEME.MUTED}`, borderTopColor: THEME.GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );
}
