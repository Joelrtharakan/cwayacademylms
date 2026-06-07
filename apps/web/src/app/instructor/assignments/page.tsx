"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, Clock, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { getInstructorAssignments, gradeSubmission } from "@/lib/api/instructor";
import { formatDistanceToNow } from "date-fns";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

type Tab = "ungraded" | "graded" | "all";

function SubmissionCard({ sub, onGrade }: { sub: any; onGrade: (id: string, grade: number, feedback: string) => void }) {
  const [expanded, setExpanded] = useState(!sub.isGraded);
  const [grade, setGrade] = useState(sub.grade ?? "");
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const maxScore = sub.assignment?.maxScore || 100;

  return (
    <div style={{ background: SURFACE, border: `1px solid ${sub.isGraded ? "rgba(74,222,128,0.2)" : "rgba(201,151,58,0.3)"}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)}
        style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${GOLD}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, fontWeight: 700, color: GOLD }}>
          {sub.student?.name?.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: "#F5F0E8", fontSize: 14 }}>{sub.student?.name}</div>
          <div style={{ fontSize: 12, color: MUTED }}>{sub.assignment?.title} · {sub.assignment?.lesson?.section?.course?.title}</div>
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
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Content */}
          {sub.content && (
            <div style={{ marginTop: 16, padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 8, color: "#F5F0E8", fontSize: 13, lineHeight: 1.6 }}>
              {sub.content}
            </div>
          )}
          {sub.fileUrl && (
            <a href={sub.fileUrl} target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: GOLD, textDecoration: "none", fontSize: 13 }}>
              <Download size={14} /> Download Submission File
            </a>
          )}

          {/* Grading */}
          <div style={{ marginTop: 20, padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(201,151,58,0.15)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Score:</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" min={0} max={maxScore} value={grade} onChange={e => setGrade(e.target.value)}
                  style={{ width: 80, background: "rgba(255,255,255,0.06)", border: `1px solid ${GOLD}`, borderRadius: 8, padding: "8px 12px", color: "#F5F0E8", fontSize: 18, fontWeight: 700, textAlign: "center", outline: "none" }} />
                <span style={{ color: MUTED, fontSize: 14 }}>/ {maxScore}</span>
              </div>
            </div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write your feedback for the student..." rows={3}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 8, padding: "10px 12px", color: "#F5F0E8", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <button onClick={() => grade !== "" && onGrade(sub.id, Number(grade), feedback)}
              style={{ marginTop: 10, background: GOLD, color: DARK, borderRadius: 100, padding: "9px 24px", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
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
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 26, color: "#F5F0E8", marginBottom: 24 }}>Assignments & Grading</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4, marginBottom: 24, width: "fit-content" }}>
        {(["ungraded", "graded", "all"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: tab === t ? GOLD : "transparent", color: tab === t ? DARK : MUTED, borderRadius: 7, padding: "7px 16px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
            {t === "ungraded" && ungradedCount > 0 && <span style={{ background: "#FBBF24", color: DARK, borderRadius: 100, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{ungradedCount}</span>}
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
