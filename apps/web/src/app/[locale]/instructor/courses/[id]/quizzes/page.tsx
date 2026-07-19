"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/store/auth.store";
import { format } from "date-fns";

const GOLD = "#B88645";
const SURFACE = "#FFFFFF";
const MUTED = "#8A9E8C";

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
      <div style={{ display: "flex", height: "60vh", alignItems: "center", justifyContent: "center", color: MUTED }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: GOLD }} />
        <span style={{ marginLeft: 12, fontSize: 15, fontWeight: 500 }}>Loading quizzes...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#1A261D", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: "#1A261D", margin: 0 }}>Quiz Results</h1>
          <p style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{course?.title}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Sidebar: List of Quizzes */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {quizzes.length === 0 ? (
            <div style={{ color: MUTED, fontSize: 13, padding: 20 }}>No quizzes in this course</div>
          ) : (
            quizzes.map((q: any) => (
              <button key={q.id} onClick={() => setSelectedQuiz(q.id)}
                style={{ padding: "14px 16px", borderRadius: 12, background: selectedQuiz === q.id ? "rgba(184,134,69,0.1)" : SURFACE, border: `1px solid ${selectedQuiz === q.id ? GOLD : "#E4E8E0"}`, textAlign: "left", cursor: "pointer", transition: "all 0.15s", boxShadow: selectedQuiz === q.id ? "none" : "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedQuiz === q.id ? GOLD : "#1A261D", marginBottom: 4 }}>{q.title}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{q.lessonTitle}</div>
              </button>
            ))
          )}
        </div>

        {/* Content: Selected Quiz Details */}
        {selectedQuiz && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 16 }}>
              <button 
                onClick={handleReset}
                disabled={resetMutation.isPending}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: `1px solid ${GOLD}`, borderRadius: 8, padding: "8px 16px", color: GOLD, fontSize: 13, fontWeight: 600, cursor: resetMutation.isPending ? "not-allowed" : "pointer", opacity: resetMutation.isPending ? 0.6 : 1, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
              >
                <RotateCcw size={16} />
                {resetMutation.isPending ? "Resetting..." : "Reset All Attempts"}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ background: SURFACE, border: "1px solid #E4E8E0", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Attempts</div>
                <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 28, color: "#1A261D", marginTop: 4 }}>{stats?.totalAttempts || 0}</div>
              </div>
              <div style={{ background: SURFACE, border: "1px solid #E4E8E0", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pass Rate</div>
                <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 28, color: GOLD, marginTop: 4 }}>{Math.round(stats?.passRate || 0)}%</div>
              </div>
              <div style={{ background: SURFACE, border: "1px solid #E4E8E0", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg Score</div>
                <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 28, color: "#4ADE80", marginTop: 4 }}>{Math.round(stats?.avgScore || 0)}%</div>
              </div>
            </div>

            {/* Attempts Table */}
            <div style={{ background: SURFACE, border: "1px solid #E4E8E0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E8E0" }}>
                <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#1A261D", margin: 0 }}>Recent Attempts</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F7F8F5" }}>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Student</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Score</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</th>
                    <th style={{ padding: "12px 20px", textAlign: "right", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a: any) => (
                    <tr key={a.id} style={{ borderTop: "1px solid #E4E8E0", background: "#FFFFFF", transition: "background 0.15s" }}>
                      <td style={{ padding: "12px 20px", fontSize: 13, color: "#1A261D", fontWeight: 600 }}>{a.student?.name}</td>
                      <td style={{ padding: "12px 20px", fontSize: 12, color: MUTED }}>{format(new Date(a.startedAt), "MMM d, yyyy h:mm a")}</td>
                      <td style={{ padding: "12px 20px", fontSize: 14, fontWeight: 700, color: a.passed ? "#4A8C5C" : "#E53E3E" }}>{a.score}%</td>
                      <td style={{ padding: "12px 20px" }}>
                        {a.passed ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#4A8C5C", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}><CheckCircle size={14} /> Passed</span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#E53E3E", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}><XCircle size={14} /> Failed</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right" }}>
                        {!a.passed && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to reset attempts for ${a.student?.name}?`)) {
                                resetStudentMutation.mutate(a.studentId);
                              }
                            }}
                            disabled={resetStudentMutation.isPending}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 4,
                              background: "rgba(184, 134, 69, 0.1)", color: "#B88645", border: "1px solid rgba(184, 134, 69, 0.2)", cursor: resetStudentMutation.isPending ? "not-allowed" : "pointer"
                            }}
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {attempts.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "48px", textAlign: "center", color: MUTED, fontSize: 13, background: "#FFFFFF" }}>No attempts yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
