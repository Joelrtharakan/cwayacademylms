"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/store/auth.store";
import { format } from "date-fns";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  dark: "#1A261D",
  darkSoft: "#2D3A2F",
  muted: "#7F8E82",
  surface: "#FFFFFF",
  bgAlt: "#F7F8F5",
  border: "#E2E6DE",
  borderLight: "#EBEEE8",
  red: "#DC4A4A",
  green: "#3D7A4B",
};

export default function CourseQuizzesPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get course to find its quizzes (we need to fetch sections -> lessons -> quizzes)
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data.data),
  });

  const quizzes = course?.sections?.flatMap((s: any) => s.lessons.filter((l: any) => l.quiz).map((l: any) => ({ ...l.quiz, lessonTitle: l.title }))) || [];
  
  const [selectedQuiz, setSelectedQuiz] = useState<any>(quizzes[0]?.id || null);

  // When selectedQuiz changes, fetch its attempts and stats
  const { data: attempts = [] } = useQuery({
    queryKey: ["quiz-attempts", selectedQuiz],
    queryFn: () => api.get(`/quizzes/${selectedQuiz}/attempts`).then(r => r.data.data),
    enabled: !!selectedQuiz,
  });

  const { data: stats } = useQuery({
    queryKey: ["quiz-stats", selectedQuiz],
    queryFn: () => api.get(`/quizzes/${selectedQuiz}/stats`).then(r => r.data.data),
    enabled: !!selectedQuiz,
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/quizzes/${selectedQuiz}/reset`);
    },
    onSuccess: (res) => {
      toast.success(res.data?.message || "Quiz attempts reset successfully");
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", selectedQuiz] });
      queryClient.invalidateQueries({ queryKey: ["quiz-stats", selectedQuiz] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reset quiz");
    }
  });

  const resetStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      return api.post(`/quizzes/${selectedQuiz}/reset`, { studentId });
    },
    onSuccess: (res) => {
      toast.success(res.data?.message || "Student's quiz attempts reset successfully");
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", selectedQuiz] });
      queryClient.invalidateQueries({ queryKey: ["quiz-stats", selectedQuiz] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reset student's quiz");
    }
  });

  const handleReset = () => {
    if (confirm("Are you sure you want to reset this quiz? This will delete all current student attempts and scores, allowing everyone to retake it.")) {
      resetMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "60vh", alignItems: "center", justifyContent: "center", color: C.muted }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: C.gold }} />
        <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 700 }}>Loading quizzes...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 800, color: C.dark, margin: 0 }}>Quiz Results</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{course?.title}</p>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", width: "100%", boxSizing: "border-box" }}>
        
        {/* Sidebar: List of Quizzes */}
        <div style={{ flex: "1 1 240px", minWidth: 220, display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 12, fontWeight: 800, color: C.gold, textTransform: "uppercase", letterSpacing: "0.08em" }}>Select Quiz</h3>
          {quizzes.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13, padding: 20, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>No quizzes in this course</div>
          ) : (
            quizzes.map((q: any) => {
              const isSel = selectedQuiz === q.id || (!selectedQuiz && quizzes[0]?.id === q.id);
              return (
                <button key={q.id} onClick={() => setSelectedQuiz(q.id)}
                  style={{
                    padding: "14px 18px", borderRadius: 14,
                    background: isSel ? C.goldLight : C.surface,
                    border: `1px solid ${isSel ? C.gold : C.border}`,
                    textAlign: "left", cursor: "pointer", transition: "all 0.2s",
                    boxShadow: isSel ? "0 2px 8px rgba(184,134,69,0.15)" : "0 1px 2px rgba(0,0,0,0.02)",
                    width: "100%", boxSizing: "border-box"
                  }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: isSel ? C.gold : C.dark, marginBottom: 3, wordBreak: "break-word" }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, wordBreak: "break-word" }}>{q.lessonTitle}</div>
                </button>
              );
            })
          )}
        </div>

        {/* Content: Selected Quiz Details */}
        {(selectedQuiz || quizzes[0]?.id) && (
          <div style={{ flex: "3 1 400px", minWidth: 280, display: "flex", flexDirection: "column", gap: 20, width: "100%", boxSizing: "border-box" }}>
            
            {/* Action Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>
                {quizzes.find((q: any) => q.id === (selectedQuiz || quizzes[0]?.id))?.title || "Quiz Analytics"}
              </div>
              <button 
                onClick={handleReset}
                disabled={resetMutation.isPending}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: C.surface, border: `1px solid ${C.gold}`, borderRadius: 10,
                  padding: "8px 16px", color: C.gold, fontSize: 13, fontWeight: 700,
                  cursor: resetMutation.isPending ? "not-allowed" : "pointer",
                  opacity: resetMutation.isPending ? 0.6 : 1,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)", whiteSpace: "nowrap", marginLeft: "auto"
                }}
              >
                <RotateCcw size={15} />
                <span>{resetMutation.isPending ? "Resetting..." : "Reset All Attempts"}</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, width: "100%", boxSizing: "border-box" }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Attempts</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginTop: 4 }}>{stats?.totalAttempts || 0}</div>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pass Rate</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: C.gold, marginTop: 4 }}>{Math.round(stats?.passRate || 0)}%</div>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg Score</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 800, color: C.green, marginTop: 4 }}>{Math.round(stats?.avgScore || 0)}%</div>
              </div>
            </div>

            {/* Attempts Table (Scrollable Container) */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.borderLight}` }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>Recent Student Attempts</h3>
              </div>
              
              <div style={{ width: "100%", overflowX: "auto", boxSizing: "border-box" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr style={{ background: C.bgAlt }}>
                      <th style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Student</th>
                      <th style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Date</th>
                      <th style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Score</th>
                      <th style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Status</th>
                      <th style={{ padding: "12px 18px", textAlign: "right", fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a: any) => (
                      <tr key={a.id} style={{ borderTop: `1px solid ${C.borderLight}`, background: "#FFFFFF" }}>
                        <td style={{ padding: "12px 18px", fontSize: 13, color: C.dark, fontWeight: 700, whiteSpace: "nowrap" }}>{a.student?.name || "Student"}</td>
                        <td style={{ padding: "12px 18px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{format(new Date(a.startedAt), "MMM d, yyyy h:mm a")}</td>
                        <td style={{ padding: "12px 18px", fontSize: 14, fontWeight: 800, color: a.passed ? C.green : C.red, whiteSpace: "nowrap" }}>{a.score}%</td>
                        <td style={{ padding: "12px 18px", whiteSpace: "nowrap" }}>
                          {a.passed ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.green, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}><CheckCircle size={14} /> Passed</span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.red, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}><XCircle size={14} /> Failed</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                          {!a.passed && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to reset attempts for ${a.student?.name}?`)) {
                                  resetStudentMutation.mutate(a.studentId);
                                }
                              }}
                              disabled={resetStudentMutation.isPending}
                              style={{
                                fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 6,
                                background: C.goldLight, color: C.gold, border: `1px solid rgba(184, 134, 69, 0.25)`,
                                cursor: resetStudentMutation.isPending ? "not-allowed" : "pointer"
                              }}
                            >
                              Reset
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {attempts.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: C.muted, fontSize: 13, background: "#FFFFFF" }}>No student attempts recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
