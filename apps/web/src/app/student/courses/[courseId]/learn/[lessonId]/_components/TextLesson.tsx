"use client";

import React, { useState } from "react";
import { THEME } from "@/lib/cway-theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { CheckCircle } from "lucide-react";

export default function TextLesson({ lesson, enrollmentId }: { lesson: any, enrollmentId: string }) {
  const queryClient = useQueryClient();
  const [completed, setCompleted] = useState(lesson.isCompleted);

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/student/enrollments/\${enrollmentId}/lessons/\${lesson.id}/complete`),
    onSuccess: (res) => {
      setCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      if (res.data.data.courseCompleted) {
        alert("Congratulations! You've completed the course.");
      }
    }
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 40, borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: THEME.HERO, marginBottom: 16, fontFamily: "Cormorant Garamond, serif" }}>{lesson.title}</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: THEME.MUTED, fontSize: 14 }}>Reading material</span>
          
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
      </div>

      <div 
        className="prose max-w-none" 
        style={{ 
          fontSize: 16, 
          lineHeight: 1.8, 
          color: THEME.TEXT,
          fontFamily: "Inter, sans-serif"
        }}
        dangerouslySetInnerHTML={{ __html: lesson.content || "<p>No content provided.</p>" }} 
      />

      {!completed && (
        <div style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
          <button 
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            style={{ background: THEME.GOLD, color: "white", border: "none", padding: "16px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            I have finished reading
          </button>
        </div>
      )}
    </div>
  );
}
