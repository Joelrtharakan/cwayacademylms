"use client";

import React, { useRef, useEffect, useState } from "react";
import { THEME } from "@/lib/cway-theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { CheckCircle } from "lucide-react";

export default function VideoLesson({ lesson, enrollmentId }: { lesson: any, enrollmentId: string }) {
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completed, setCompleted] = useState(lesson.isCompleted);
  const [markedThisSession, setMarkedThisSession] = useState(false);

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/student/enrollments/${enrollmentId}/lessons/${lesson.id}/complete`),
    onSuccess: (res) => {
      setCompleted(true);
      setMarkedThisSession(true);
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      // If course is completed, we could show a modal or redirect
      if (res.data.data.courseCompleted) {
        alert("Congratulations! You've completed the course.");
      }
    }
  });

  const progressMutation = useMutation({
    mutationFn: (seconds: number) => api.post(`/student/enrollments/${enrollmentId}/lessons/${lesson.id}/progress`, { watchedSeconds: seconds }),
  });

  useEffect(() => {
    let interval: any;
    if (videoRef.current && !completed && !markedThisSession) {
      interval = setInterval(() => {
        const currentSeconds = videoRef.current?.currentTime || 0;
        if (currentSeconds > 0) {
          progressMutation.mutate(Math.floor(currentSeconds));
        }
      }, 10000); // Save progress every 10 seconds
    }
    return () => clearInterval(interval);
  }, [lesson.id, completed, markedThisSession, progressMutation]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: THEME.HERO, marginBottom: 8 }}>{lesson.title}</h2>
          {lesson.content && (
            <p style={{ color: THEME.MUTED, fontSize: 15, lineHeight: 1.6 }}>{lesson.content}</p>
          )}
        </div>
        
        {completed ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8A9E8C", fontSize: 14, fontWeight: 600, background: "rgba(138,158,140,0.1)", padding: "6px 12px", borderRadius: 999 }}>
            <CheckCircle size={16} /> Completed
          </div>
        ) : (
          <button 
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            style={{ background: THEME.HERO, color: THEME.LIGHT, border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Mark Complete
          </button>
        )}
      </div>

      <div style={{ background: "black", borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
        {lesson.videoUrl ? (
          lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be") ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={lesson.videoUrl.replace("watch?v=", "embed/")} 
              title={lesson.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              ref={videoRef}
              src={lesson.videoUrl} 
              controls 
              onEnded={() => completeMutation.mutate()}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              poster={lesson.thumbnail || undefined}
            />
          )
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14 }}>
            Video content is currently unavailable.
          </div>
        )}
      </div>
    </div>
  );
}
