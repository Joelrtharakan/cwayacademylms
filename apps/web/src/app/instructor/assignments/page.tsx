"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, Clock, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { getInstructorAssignments, gradeSubmission } from "@/lib/api/instructor";
import { formatDistanceToNow } from "date-fns";

const GOLD = "var(--gold-primary, #C9A84C)";
const SURFACE = "#FFFFFF";
const DARK = "#1A261D";
const MUTED = "#8F9E93";

type Tab = "ungraded" | "graded" | "all";

function SubmissionCard({ sub, onGrade }: { sub: any; onGrade: (id: string, grade: number, feedback: string) => void }) {
  const [expanded, setExpanded] = useState(!sub.isGraded);
  const [grade, setGrade] = useState(sub.grade ?? "");
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const [showFile, setShowFile] = useState(false);
  const maxScore = sub.assignment?.maxScore || 100;

  return (
    <div style={{ background: SURFACE, border: `1px solid ${sub.isGraded ? "var(--success, #4ADE80)" : "var(--border-light, #E2E8F0)"}`, borderRadius: 12, overflow: "hidden", marginBottom: 16, boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)}
        style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `rgba(201,168,76,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, fontWeight: 700, color: "var(--gold-dark, #A68A3D)" }}>
          {sub.student?.name?.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: DARK, fontSize: 15, marginBottom: 2 }}>{sub.student?.name}</div>
          <div style={{ fontSize: 13, color: MUTED }}>{sub.assignment?.title} · {sub.assignment?.lesson?.section?.course?.title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sub.isGraded ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ADE80", fontSize: 13, fontWeight: 700 }}>
              <CheckCircle size={16} /> {sub.grade}/{maxScore}
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: GOLD, fontSize: 12 }}>
              <Clock size={14} /> {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
            </span>
          )}
          {expanded ? <ChevronUp size={16} color={MUTED} /> : <ChevronDown size={16} color={MUTED} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border-light, #E2E8F0)" }}>
          {/* Content */}
          {sub.content && (
            <div style={{ marginTop: 16, padding: 16, background: "var(--cream-light, #F9FAF8)", borderRadius: 8, color: DARK, fontSize: 14, lineHeight: 1.6, border: "1px solid var(--border-light, #E2E8F0)" }}>
              {sub.content}
            </div>
          )}
          {sub.fileUrl && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowFile(!showFile)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(201,168,76,0.1)", borderRadius: 8, color: "var(--gold-dark, #A68A3D)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  <FileText size={16} /> {showFile ? "Hide File" : "View File"}
                </button>
                <a href={sub.fileUrl} target="_blank" download style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "transparent", border: "1px solid var(--border-light, #E2E8F0)", borderRadius: 8, color: MUTED, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                  <Download size={16} /> Download
                </a>
              </div>
              {showFile && (
                <iframe src={sub.fileUrl} style={{ width: "100%", height: 500, border: "1px solid var(--border-light, #E2E8F0)", borderRadius: 8, background: "#FFFFFF" }} />
              )}
            </div>
          )}

          {/* Grading */}
          <div style={{ marginTop: 24, padding: "20px", background: "var(--cream-mid, #F4F5F1)", borderRadius: 12, border: "1px solid rgba(201,168,76,0.2)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Score:</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min={0} max={maxScore} value={grade} onChange={e => setGrade(e.target.value)}
                  style={{ width: 80, background: "#FFFFFF", border: `1px solid rgba(201,168,76,0.4)`, borderRadius: 8, padding: "8px 12px", color: DARK, fontSize: 18, fontWeight: 700, textAlign: "center", outline: "none" }} />
                <span style={{ color: MUTED, fontSize: 15, fontWeight: 600 }}>/ {maxScore}</span>
              </div>
            </div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write your feedback for the student..." rows={3}
              style={{ width: "100%", background: "#FFFFFF", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "12px", color: DARK, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <button onClick={() => grade !== "" && onGrade(sub.id, Number(grade), feedback)}
              style={{ marginTop: 16, background: GOLD, color: "#FFFFFF", borderRadius: 100, padding: "10px 28px", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", transition: "transform 0.2s" }}>
              Save Grade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssignmentsPage() {
  const [tab, setTab] = useState<Tab>("ungraded");
  const qc = useQueryClient();

  const { data: allSubs = [], isLoading } = useQuery({
    queryKey: ["instructor-assignments"],
    queryFn: () => getInstructorAssignments(),
  });

  const gradeMut = useMutation({
    mutationFn: ({ id, grade, feedback }: any) => gradeSubmission(id, { grade, feedback }),
    onSuccess: () => { toast.success("Grade saved! Student notified."); qc.invalidateQueries({ queryKey: ["instructor-assignments"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to grade"),
  });

  const filtered = tab === "ungraded" ? allSubs.filter((s: any) => !s.isGraded)
    : tab === "graded" ? allSubs.filter((s: any) => s.isGraded)
    : allSubs;

  const ungradedCount = allSubs.filter((s: any) => !s.isGraded).length;

  return (
    <div style={{ padding: "24px 32px" }}>
      <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: 28, fontWeight: 700, color: DARK, marginBottom: 32, letterSpacing: "0.5px" }}>Assignments & Grading</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, background: "rgba(201,168,76,0.1)", borderRadius: 12, padding: 6, marginBottom: 32, width: "fit-content" }}>
        {(["ungraded", "graded", "all"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: tab === t ? GOLD : "transparent", color: tab === t ? "#FFFFFF" : "var(--gold-dark)", borderRadius: 8, padding: "8px 20px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
            {t === "ungraded" && ungradedCount > 0 && <span style={{ background: tab === t ? "#FFFFFF" : GOLD, color: tab === t ? GOLD : "#FFFFFF", borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>{ungradedCount}</span>}
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: 80, background: SURFACE, borderRadius: 12, marginBottom: 12, animation: "pulse 1.5s infinite" }} />)
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
          <CheckCircle size={40} color={GOLD} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15 }}>All caught up! No {tab === "all" ? "" : tab} submissions.</p>
        </div>
      ) : (
        filtered.map((sub: any) => (
          <SubmissionCard key={sub.id} sub={sub} onGrade={(id, grade, feedback) => gradeMut.mutate({ id, grade, feedback })} />
        ))
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
