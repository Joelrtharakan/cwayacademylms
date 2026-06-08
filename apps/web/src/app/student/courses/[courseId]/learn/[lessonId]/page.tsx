"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { THEME } from "@/lib/cway-theme";
import { usePlayerStore } from "@/store/player.store";
import VideoLesson from "./_components/VideoLesson";
import TextLesson from "./_components/TextLesson";
import QuizLesson from "./_components/QuizLesson";
import AssignmentLesson from "./_components/AssignmentLesson";
import NotesPanel from "@/components/student/player/NotesPanel";

export default function LessonPage({ params }: { params: { courseId: string, lessonId: string } }) {
  const { setLessonId, notesPanelOpen } = usePlayerStore();

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ["enrollment", params.courseId],
    queryFn: () => api.get(`/student/courses/\${params.courseId}/learn`).then(res => res.data.data),
  });

  useEffect(() => {
    setLessonId(params.lessonId);
  }, [params.lessonId, setLessonId]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: THEME.SURFACE }}>
        <div style={{ width: 40, height: 40, border: `4px solid \${THEME.MUTED}`, borderTopColor: THEME.GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  let lesson = null;
  for (const section of enrollment?.course?.sections || []) {
    const found = section.lessons.find((l: any) => l.id === params.lessonId);
    if (found) {
      lesson = found;
      break;
    }
  }

  if (!lesson) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: THEME.MUTED }}>
        Lesson not found.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {lesson.type === "VIDEO" && <VideoLesson lesson={lesson} enrollmentId={enrollment.id} />}
        {lesson.type === "TEXT" && <TextLesson lesson={lesson} enrollmentId={enrollment.id} />}
        {lesson.type === "QUIZ" && <QuizLesson lesson={lesson} enrollmentId={enrollment.id} />}
        {lesson.type === "ASSIGNMENT" && <AssignmentLesson lesson={lesson} enrollmentId={enrollment.id} />}
      </div>
      
      {notesPanelOpen && (
        <NotesPanel lessonId={params.lessonId} />
      )}
    </div>
  );
}
