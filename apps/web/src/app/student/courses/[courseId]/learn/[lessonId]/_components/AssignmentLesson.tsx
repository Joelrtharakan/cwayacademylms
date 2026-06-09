"use client";

import React, { useState } from "react";
import { THEME } from "@/lib/cway-theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { ClipboardList, Upload, CheckCircle, Clock } from "lucide-react";

export default function AssignmentLesson({ lesson, enrollmentId }: { lesson: any, enrollmentId: string }) {
  const queryClient = useQueryClient();
  const assignmentId = lesson.assignment?.id;
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: submission, isLoading } = useQuery({
    queryKey: ["assignmentSubmission", assignmentId],
    queryFn: () => api.get(`/student/assignments/${assignmentId}/my-submission`).then(res => res.data.data),
    enabled: !!assignmentId
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      if (content) formData.append("content", content);
      if (file) formData.append("file", file);
      
      // We also hit completeLesson to advance the progress visually
      api.post(`/student/enrollments/${enrollmentId}/lessons/${lesson.id}/complete`);
      
      return api.post(`/student/assignments/${assignmentId}/submit`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignmentSubmission", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    }
  });

  if (!assignmentId) return <div style={{ padding: 40 }}>Assignment data not found for this lesson.</div>;

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: "center", color: THEME.MUTED }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 40, borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: THEME.HERO, marginBottom: 16, fontFamily: "Cormorant Garamond, serif" }}>{lesson.title}</h2>
          {lesson.content && <p style={{ color: THEME.MUTED, fontSize: 15, lineHeight: 1.6 }}>{lesson.content}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: THEME.MUTED, fontSize: 13, background: "rgba(0,0,0,0.02)", padding: "8px 16px", borderRadius: 999 }}>
          <ClipboardList size={16} /> Assignment
        </div>
      </div>

      {submission ? (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", background: submission.isGraded ? "rgba(138,158,140,0.1)" : "rgba(201,151,58,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
            {submission.isGraded ? <CheckCircle color="#8A9E8C" size={24} /> : <Clock color={THEME.GOLD} size={24} />}
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: THEME.HERO }}>
                {submission.isGraded ? "Graded" : "Submitted & Pending Grading"}
              </div>
              <div style={{ fontSize: 13, color: THEME.MUTED }}>
                Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Your Submission</h3>
            {submission.content && (
              <div style={{ background: "rgba(0,0,0,0.02)", padding: 16, borderRadius: 8, fontSize: 14, color: THEME.TEXT, whiteSpace: "pre-wrap", marginBottom: 16 }}>
                {submission.content}
              </div>
            )}
            {submission.fileUrl && (
              <a href={submission.fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: THEME.HERO, color: "white", textDecoration: "none", borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
                View Attached File
              </a>
            )}

            {submission.isGraded && (
              <div style={{ marginTop: 32, borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Feedback & Grade</h3>
                <div style={{ fontSize: 32, fontWeight: 700, color: THEME.HERO, marginBottom: 16 }}>
                  {submission.score} / {submission.assignment?.maxScore || 100}
                </div>
                {submission.feedback && (
                  <div style={{ background: "rgba(201,151,58,0.05)", borderLeft: `4px solid ${THEME.GOLD}`, padding: 16, fontSize: 14, color: THEME.TEXT }}>
                    {submission.feedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 16, padding: 32, border: "1px solid rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: THEME.HERO, marginBottom: 24 }}>Submit your work</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: THEME.HERO, marginBottom: 8 }}>Written Response</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Type your response here or paste a link to your work..."
                style={{ width: "100%", minHeight: 150, padding: 16, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, fontFamily: "Inter, sans-serif" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: THEME.HERO, marginBottom: 8 }}>File Attachment (Optional)</label>
              <div style={{ border: "2px dashed rgba(0,0,0,0.1)", borderRadius: 8, padding: 32, textAlign: "center", position: "relative" }}>
                <input 
                  type="file" 
                  onChange={e => e.target.files && setFile(e.target.files[0])}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                />
                <Upload size={32} color={THEME.MUTED} style={{ margin: "0 auto 12px" }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: THEME.HERO }}>
                  {file ? file.name : "Click or drag file to upload"}
                </div>
                <div style={{ fontSize: 12, color: THEME.MUTED, marginTop: 4 }}>PDF, DOCX, JPG (Max 10MB)</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button 
                onClick={() => submitMutation.mutate()}
                disabled={(!content && !file) || submitMutation.isPending}
                style={{ background: THEME.HERO, color: "white", border: "none", padding: "12px 32px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: (!content && !file) ? 0.5 : 1 }}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
