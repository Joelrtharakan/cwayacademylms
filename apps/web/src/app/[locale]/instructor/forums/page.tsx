"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstructorDiscussions, gradeDiscussion } from "@/lib/api/instructor";
import { MessageCircle, CheckCircle, Clock, ChevronDown, ChevronUp, User, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function InstructorForumsPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gradingScores, setGradingScores] = useState<Record<string, string>>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<Record<string, string>>({});
  const t = useTranslations("instructor.forums");

  const { data: discussions, isLoading, error } = useQuery({
    queryKey: ["instructor-discussions"],
    queryFn: () => getInstructorDiscussions(),
  });

  if (error) {
    console.error("Discussions fetch error:", error);
  }

  const gradeMut = useMutation({
    mutationFn: ({ id, score, feedback }: { id: string; score: number; feedback: string }) =>
      gradeDiscussion(id, { score, feedback }),
    onSuccess: () => {
      toast.success(t("toastSuccess"));
      queryClient.invalidateQueries({ queryKey: ["instructor-discussions"] });
      setExpandedId(null);
    },
    onError: () => toast.error(t("toastError")),
  });

  const handleGrade = (id: string) => {
    const scoreStr = gradingScores[id];
    const score = parseInt(scoreStr, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error(t("toastInvalidScore"));
      return;
    }
    gradeMut.mutate({ id, score, feedback: gradingFeedbacks[id] || "" });
  };

  return (
    <div className="max-w-[1200px] mx-auto" style={{ padding: '24px' }}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-cway-dark-green mb-2 leading-tight">
            {t("title")}
          </h1>
          <p className="text-[15px] text-cway-text-muted m-0">
            {t("desc")}
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-cway-cream-dark/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center bg-red-50 rounded-2xl border border-red-100" style={{ padding: '40px' }}>
          <h3 className="text-lg font-semibold text-red-700 mb-2">{t("errorTitle")}</h3>
          <p className="text-red-600 m-0 text-sm">{t("errorDesc")}</p>
        </div>
      ) : !discussions || discussions.length === 0 ? (
        <div className="text-center bg-white rounded-2xl border border-cway-border-light shadow-sm" style={{ padding: '48px' }}>
          <MessageCircle size={48} className="text-cway-text-muted/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-cway-dark-green mb-2">No Discussions Found</h3>
          <p className="text-cway-text-muted m-0 text-base">There are currently no student discussion posts to review.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {discussions.map((discussion: any) => {
            const isExpanded = expandedId === discussion.id;
            const isGraded = discussion.score !== null;

            return (
              <div
                key={discussion.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  border: `1px solid ${isGraded ? "#E4E8E0" : "rgba(184,134,69,0.3)"}`,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                className="transition-all duration-200"
              >
                {/* ── CARD HEADER ── */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : discussion.id)}
                  style={{ padding: "18px 20px" }}
                  className={`flex items-start justify-between gap-3.5 cursor-pointer transition-colors duration-200 ${
                    isExpanded ? "bg-[#F7F8F5]" : "bg-white hover:bg-[#F7F8F5]/60"
                  }`}
                >
                  {/* Left: Avatar */}
                  <div style={{
                    width: 42, height: 42, minWidth: 42, borderRadius: "50%",
                    background: "rgba(184,134,69,0.12)", color: "#B88645",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 15, flexShrink: 0, border: "1px solid rgba(184,134,69,0.2)"
                  }}>
                    {discussion.author?.avatar ? (
                      <img src={discussion.author.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      discussion.author?.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>

                  {/* Middle Column: Title + Badges + Metadata */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {/* Row 1: Title + Status Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1A261D", lineHeight: 1.3 }}>
                        {discussion.title}
                      </h3>
                      {isGraded ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "3px 10px", borderRadius: 20,
                          background: "rgba(61,122,75,0.12)", color: "#3D7A4B", border: "1px solid rgba(61,122,75,0.25)",
                          whiteSpace: "nowrap"
                        }}>
                          <CheckCircle size={12} /> {t("graded", { score: discussion.score })}
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "3px 10px", borderRadius: 20,
                          background: "rgba(184,134,69,0.12)", color: "#B88645", border: "1px solid rgba(184,134,69,0.25)",
                          whiteSpace: "nowrap"
                        }}>
                          <Clock size={12} /> {t("needsGrading")}
                        </span>
                      )}
                    </div>

                    {/* Row 2: Author & Date */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 13, color: "#7F8E82" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#2D3A2F", fontWeight: 600 }}>
                        <User size={13} style={{ color: "#7F8E82" }} />
                        <span>{discussion.author?.name || "Student"}</span>
                      </span>
                      <span style={{ color: "#7F8E82", fontSize: 12 }}>
                        {new Date(discussion.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Row 3: Course & Lesson Tag */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7F8E82", wordBreak: "break-word" }}>
                      <BookOpen size={13} style={{ flexShrink: 0, color: "#7F8E82" }} />
                      <span style={{ color: "#526658", fontWeight: 500 }}>
                        {discussion.course?.title} {discussion.lesson ? `› ${discussion.lesson.title}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Right: Expand Toggle Button */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "#F7F8F5", border: "1px solid #E4E8E0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#7F8E82", flexShrink: 0, marginTop: 2
                  }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* ── EXPANDED CONTENT PANEL ── */}
                {isExpanded && (
                  <div style={{ padding: "20px", borderTop: "1px solid #E4E8E0", background: "#FFFFFF", display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Student Post */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7F8E82", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <MessageCircle size={14} /> <span>{t("studentPost")}</span>
                      </div>
                      <div style={{
                        padding: "14px 18px", background: "#F7F8F5", borderRadius: 12,
                        border: "1px solid #E4E8E0", color: "#1A261D", fontSize: 14, lineHeight: 1.6,
                        whiteSpace: "pre-wrap", wordBreak: "break-word"
                      }}>
                        {discussion.content}
                      </div>
                    </div>

                    {/* Replies */}
                    {discussion.replies && discussion.replies.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7F8E82", marginBottom: 10 }}>
                          {t("replies", { count: discussion.replies.length })}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 12, borderLeft: "2px solid #EBEEE8" }}>
                          {discussion.replies.map((reply: any) => (
                            <div key={reply.id} style={{ padding: "14px 16px", background: "#FFFFFF", borderRadius: 12, border: "1px solid #E4E8E0", display: "flex", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(184,134,69,0.12)", color: "#B88645", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                                {reply.author?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1A261D" }}>{reply.author?.name}</span>
                                  <span style={{ fontSize: 11, color: "#7F8E82" }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#2D3A2F", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                  {reply.content}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grading Form Section */}
                    <div style={{ paddingTop: 16, borderTop: "1px solid #E4E8E0", display: "flex", flexDirection: "column", gap: 14 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1A261D" }}>
                        {isGraded ? t("updateGrade") : t("gradeSubmission")}
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                        {/* Score & Feedback Inputs */}
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 120 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("scoreLabel")}</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              style={{
                                width: 110, height: 42, padding: "0 12px", borderRadius: 10,
                                border: "1px solid #E4E8E0", background: "#FFFFFF",
                                fontSize: 16, fontWeight: 800, color: "#1A261D", outline: "none"
                              }}
                              placeholder={isGraded ? discussion.score.toString() : "0"}
                              value={gradingScores[discussion.id] !== undefined ? gradingScores[discussion.id] : (discussion.score || "")}
                              onChange={(e) => setGradingScores(prev => ({ ...prev, [discussion.id]: e.target.value }))}
                            />
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 200 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("feedbackLabel")}</label>
                            <input
                              type="text"
                              style={{
                                width: "100%", height: 42, padding: "0 14px", borderRadius: 10,
                                border: "1px solid #E4E8E0", background: "#FFFFFF",
                                fontSize: 14, color: "#1A261D", outline: "none", boxSizing: "border-box"
                              }}
                              placeholder={t("feedbackPlaceholder")}
                              value={gradingFeedbacks[discussion.id] !== undefined ? gradingFeedbacks[discussion.id] : (discussion.feedback || "")}
                              onChange={(e) => setGradingFeedbacks(prev => ({ ...prev, [discussion.id]: e.target.value }))}
                            />
                          </div>
                        </div>

                        {/* Save Grade Button */}
                        <div style={{ marginTop: 4 }}>
                          <button
                            onClick={() => handleGrade(discussion.id)}
                            disabled={gradeMut.isPending}
                            style={{
                              height: 40, padding: "0 24px", borderRadius: 10,
                              background: "#B88645", color: "#FFFFFF",
                              fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
                              border: "none", cursor: gradeMut.isPending ? "not-allowed" : "pointer",
                              transition: "all 0.2s", opacity: gradeMut.isPending ? 0.7 : 1,
                              display: "inline-flex", alignItems: "center", justifyContent: "center"
                            }}
                          >
                            {gradeMut.isPending ? t("saving") : t("saveGrade")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

