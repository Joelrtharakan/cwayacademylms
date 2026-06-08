"use client";

import React, { useState } from "react";
import { THEME } from "@/lib/cway-theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

export default function QuizLesson({ lesson, enrollmentId }: { lesson: any, enrollmentId: string }) {
  const queryClient = useQueryClient();
  const quizId = lesson.quiz?.id;
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: attemptsData, isLoading: loadingAttempts } = useQuery({
    queryKey: ["quizAttempts", quizId],
    queryFn: () => api.get(`/student/quizzes/\${quizId}/my-attempts`).then(res => res.data.data),
    enabled: !!quizId
  });

  const startMutation = useMutation({
    mutationFn: () => api.post(`/student/quizzes/\${quizId}/attempt`),
    onSuccess: (res) => {
      setActiveAttempt(res.data.data);
      setAnswers({});
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/student/quizzes/\${quizId}/submit`, {
      attemptId: activeAttempt.attemptId,
      answers,
      timeTaken: 0 // Simplification
    }),
    onSuccess: () => {
      setActiveAttempt(null);
      queryClient.invalidateQueries({ queryKey: ["quizAttempts", quizId] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    }
  });

  if (!quizId) return <div style={{ padding: 40 }}>Quiz data not found for this lesson.</div>;

  if (loadingAttempts || startMutation.isPending) {
    return <div style={{ padding: 40, textAlign: "center", color: THEME.MUTED }}>Loading...</div>;
  }

  const passedAttempt = attemptsData?.find((a: any) => a.passed);

  if (activeAttempt) {
    const quiz = activeAttempt.quiz;
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: THEME.HERO, marginBottom: 24 }}>{quiz.title}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {quiz.questions.map((q: any, i: number) => (
            <div key={q.id} style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: THEME.HERO }}>{i + 1}. {q.text}</h3>
                <span style={{ fontSize: 12, color: THEME.MUTED, fontWeight: 500 }}>{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
              </div>
              
              {q.scriptureRef && <div style={{ fontSize: 13, color: THEME.GOLD, fontStyle: "italic", marginBottom: 16 }}>{q.scriptureRef}</div>}

              {q.type === "MCQ" || q.type === "TRUE_FALSE" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.answers.map((a: any) => (
                    <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 16px", background: answers[q.id] === a.id ? "rgba(201,151,58,0.1)" : "rgba(0,0,0,0.02)", borderRadius: 8, border: `1px solid \${answers[q.id] === a.id ? THEME.GOLD : "transparent"}` }}>
                      <input 
                        type="radio" 
                        name={q.id} 
                        checked={answers[q.id] === a.id} 
                        onChange={() => setAnswers(prev => ({ ...prev, [q.id]: a.id }))}
                        style={{ accentColor: THEME.GOLD }}
                      />
                      <span style={{ fontSize: 14, color: THEME.TEXT }}>{a.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea 
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Type your answer here..."
                  style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14 }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || Object.keys(answers).length < quiz.questions.length}
            style={{ background: THEME.GOLD, color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: Object.keys(answers).length < quiz.questions.length ? 0.5 : 1 }}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", padding: "40px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <HelpCircle size={48} color={THEME.MUTED} style={{ opacity: 0.5, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 32, fontWeight: 700, color: THEME.HERO, marginBottom: 16, fontFamily: "Cormorant Garamond, serif" }}>{lesson.title}</h2>
        {lesson.content && <p style={{ color: THEME.MUTED, fontSize: 15, marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>{lesson.content}</p>}
        
        {passedAttempt ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(138,158,140,0.1)", color: "#8A9E8C", padding: "12px 24px", borderRadius: 999, fontSize: 16, fontWeight: 600 }}>
            <CheckCircle size={20} /> You passed this quiz
          </div>
        ) : (
          <button 
            onClick={() => startMutation.mutate()}
            style={{ background: THEME.HERO, color: THEME.LIGHT, border: "none", padding: "12px 32px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            Start Quiz
          </button>
        )}
      </div>

      {attemptsData && attemptsData.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: THEME.HERO, marginBottom: 16 }}>Previous Attempts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {attemptsData.map((attempt: any, index: number) => (
              <div key={attempt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: THEME.HERO, marginBottom: 4 }}>Attempt {attemptsData.length - index}</div>
                  <div style={{ fontSize: 12, color: THEME.MUTED }}>{new Date(attempt.startedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: attempt.passed ? "#8A9E8C" : THEME.MUTED }}>
                    {Math.round(attempt.score)}%
                  </div>
                  {attempt.passed ? <CheckCircle color="#8A9E8C" size={20} /> : <AlertCircle color={THEME.MUTED} size={20} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
