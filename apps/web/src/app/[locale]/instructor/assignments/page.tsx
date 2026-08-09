"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, Clock, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { getInstructorAssignments, gradeSubmission } from "@/lib/api/instructor";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";

const GOLD = "var(--gold-primary, #C9A84C)";
const SURFACE = "#FFFFFF";
const DARK = "#1A261D";
const MUTED = "#8F9E93";

type Tab = "ungraded" | "graded" | "all";

function SubmissionCard({ sub, onGrade, t }: { sub: any; onGrade: (id: string, grade: number, feedback: string) => void; t: any }) {
  const [expanded, setExpanded] = useState(!sub.isGraded);
  const [grade, setGrade] = useState(sub.grade ?? "");
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const [showFile, setShowFile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const maxScore = sub.assignment?.maxScore || 100;

  const courseTitle = sub.assignment?.lesson?.section?.course?.title || sub.assignment?.course?.title || "";

  return (
    <div style={{ background: SURFACE, border: `1px solid ${sub.isGraded ? "rgba(61,122,75,0.3)" : "#E4E8E0"}`, borderRadius: 16, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer", width: "100%", boxSizing: "border-box" }}
      >
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: `rgba(184,134,69,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, fontWeight: 800, color: "#B88645" }}>
          {sub.student?.name?.slice(0, 2).toUpperCase() || "ST"}
        </div>

        <div style={{ flex: "1 1 200px", minWidth: 160 }}>
          <div style={{ fontWeight: 800, color: DARK, fontSize: 15, marginBottom: 2 }}>{sub.student?.name}</div>
          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4, overflowWrap: "break-word" }}>
            <span style={{ color: DARK, fontWeight: 600 }}>{sub.assignment?.title}</span>
            {courseTitle && <span> · {courseTitle}</span>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: "auto" }}>
          {sub.isGraded ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#3D7A4B", background: "rgba(61,122,75,0.12)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              <CheckCircle size={14} /> {sub.grade}/{maxScore}
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#B88645", background: "rgba(184,134,69,0.12)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              <Clock size={14} /> {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
            </span>
          )}
          {expanded ? <ChevronUp size={16} color={MUTED} /> : <ChevronDown size={16} color={MUTED} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #E4E8E0", width: "100%", boxSizing: "border-box" }}>
          {/* Content */}
          {sub.content && (
            <div style={{ marginTop: 16, padding: 16, background: "#F7F8F5", borderRadius: 12, color: DARK, fontSize: 14, lineHeight: 1.6, border: "1px solid #E4E8E0", overflowWrap: "break-word" }}>
              {sub.content}
            </div>
          )}
          {sub.fileUrl && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12, width: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "100%" }}>
                <button onClick={() => setShowFile(!showFile)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "rgba(184,134,69,0.12)", borderRadius: 10, color: "#B88645", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
                  <FileText size={16} /> {showFile ? t("hideFile") : t("viewFile")}
                </button>
                <a href={sub.fileUrl} target="_blank" download style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "#F7F8F5", border: "1px solid #E4E8E0", borderRadius: 10, color: DARK, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                  <Download size={16} /> {t("download")}
                </a>
              </div>
              {showFile && (
                !imageError ? (
                  <img 
                    src={sub.fileUrl} 
                    alt="Submission" 
                    onError={() => setImageError(true)}
                    style={{ width: "100%", maxHeight: 600, objectFit: "contain", border: "1px solid #E4E8E0", borderRadius: 12, background: "#F7F8F5" }} 
                  />
                ) : (
                  <iframe src={sub.fileUrl + (sub.fileUrl.toLowerCase().endsWith('.pdf') ? '#view=FitH' : '')} style={{ width: "100%", height: 600, border: "1px solid #E4E8E0", borderRadius: 12, background: "#FFFFFF" }} />
                )
              )}
            </div>
          )}

          {/* Grading */}
          <div style={{ marginTop: 20, padding: "18px 20px", background: "#F7F8F5", borderRadius: 14, border: "1px solid #E4E8E0", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{t("score")}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min={0} max={maxScore} value={grade} onChange={e => setGrade(e.target.value)}
                  style={{ width: 84, background: "#FFFFFF", border: `1px solid #E4E8E0`, borderRadius: 10, padding: "8px 12px", color: DARK, fontSize: 18, fontWeight: 800, textAlign: "center", outline: "none" }} />
                <span style={{ color: MUTED, fontSize: 14, fontWeight: 700 }}>/ {maxScore}</span>
              </div>
            </div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder={t("feedbackPlaceholder")} rows={3}
              style={{ width: "100%", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: 10, padding: "12px", color: DARK, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <button onClick={() => grade !== "" && onGrade(sub.id, Number(grade), feedback)}
              style={{ marginTop: 14, background: GOLD, color: "#FFFFFF", borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", transition: "all 0.2s" }}>
              {t("saveGrade")}
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
  const t = useTranslations("instructor.assignments");

  const { data: allSubs = [], isLoading } = useQuery({
    queryKey: ["instructor-assignments"],
    queryFn: () => getInstructorAssignments(),
  });

  const gradeMut = useMutation({
    mutationFn: ({ id, grade, feedback }: any) => gradeSubmission(id, { grade, feedback }),
    onSuccess: () => { toast.success(t("toastGraded")); qc.invalidateQueries({ queryKey: ["instructor-assignments"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("toastGradeFail")),
  });

  const filtered = tab === "ungraded" ? allSubs.filter((s: any) => !s.isGraded)
    : tab === "graded" ? allSubs.filter((s: any) => s.isGraded)
    : allSubs;

  const ungradedCount = allSubs.filter((s: any) => !s.isGraded).length;

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", boxSizing: "border-box" }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: DARK, marginBottom: 24, letterSpacing: "-0.01em" }}>{t("title")}</h1>

      {/* Tabs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: 8, background: "#F7F8F5", borderRadius: 14, padding: 6, marginBottom: 28,
        width: "100%", boxSizing: "border-box", border: "1px solid #E4E8E0"
      }}>
        {(["ungraded", "graded", "all"] as Tab[]).map((tabId) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            style={{
              background: tab === tabId ? GOLD : "transparent",
              color: tab === tabId ? "#FFFFFF" : MUTED,
              borderRadius: 10, padding: "9px 14px", border: "none", cursor: "pointer",
              fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
              whiteSpace: "nowrap", width: "100%", boxSizing: "border-box"
            }}>
            {tabId === "ungraded" && ungradedCount > 0 && (
              <span style={{ background: tab === tabId ? "#FFFFFF" : GOLD, color: tab === tabId ? GOLD : "#FFFFFF", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>{ungradedCount}</span>
            )}
            <span>{t(`tabs.${tabId}`)}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: 90, background: SURFACE, borderRadius: 16, marginBottom: 16, border: "1px solid #E4E8E0", animation: "pulse 1.5s infinite" }} />)
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: SURFACE, borderRadius: 20, border: "1px dashed #E4E8E0" }}>
          <CheckCircle size={40} color={GOLD} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>{t("caughtUp", { tab: tab === "all" ? "" : t(`tabs.${tab}`) })}</p>
        </div>
      ) : (
        filtered.map((sub: any) => (
          <SubmissionCard key={sub.id} sub={sub} onGrade={(id, grade, feedback) => gradeMut.mutate({ id, grade, feedback })} t={t} />
        ))
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
