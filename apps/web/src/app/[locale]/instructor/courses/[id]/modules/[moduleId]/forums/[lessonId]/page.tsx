"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { updateLesson } from "@/lib/api/modules";
import { ArrowLeft, Users, MessageSquare, CheckCircle, ChevronDown, ChevronUp, Edit3, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

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

const getInitials = (name: string) => {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function GradeForumPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [expandedDiscussionId, setExpandedDiscussionId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, number | "">>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editMarks, setEditMarks] = useState<number | "">("");

  const { data: modules, isLoading: isModuleLoading } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: () => api.get(`/courses/${courseId}/modules`).then(r => r.data.data),
  });

  const currentModule = modules?.find((m: any) => m.id === moduleId);
  const lesson = currentModule?.lessons?.find((l: any) => l.id === lessonId);

  const { data: discussions, isLoading: isDiscussionsLoading } = useQuery({
    queryKey: ["forumDiscussions", lessonId],
    queryFn: () => api.get(`/forums/lessons/${lessonId}`).then(r => r.data.data),
  });

  React.useEffect(() => {
    if (discussions) {
      const initialGrades: Record<string, number | ""> = {};
      const initialFeedbacks: Record<string, string> = {};
      discussions.forEach((d: any) => {
        if (d.score !== null && d.score !== undefined) {
          initialGrades[d.id] = d.score;
          initialFeedbacks[d.id] = d.feedback || "";
        }
      });
      setGrades(prev => ({ ...prev, ...initialGrades }));
      setFeedbacks(prev => ({ ...prev, ...initialFeedbacks }));
    }
  }, [discussions]);

  const gradeMut = useMutation({
    mutationFn: ({ discussionId, score, feedback }: { discussionId: string, score: number | "", feedback: string }) => 
      api.post(`/forums/discussions/${discussionId}/grade`, { score, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumDiscussions", lessonId] });
      toast.success("Grade saved successfully!");
    },
    onError: () => toast.error("Failed to save grade"),
  });

  const updateForumMut = useMutation({
    mutationFn: () => updateLesson(lessonId, {
      title: editTitle,
      type: "FORUM",
      content: editPrompt,
      duration: 0,
      isFree: false,
      isPreview: false,
      forumMarks: editMarks === "" ? null : Number(editMarks)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
      setIsEditing(false);
      toast.success("Forum details updated!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update forum"),
  });

  const handleSaveGrade = (discussionId: string) => {
    gradeMut.mutate({
      discussionId,
      score: grades[discussionId] !== undefined ? grades[discussionId] : "",
      feedback: feedbacks[discussionId] || ""
    });
  };

  if (isModuleLoading || isDiscussionsLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px", color: C.muted }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${C.gold}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>Loading submissions...</span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ padding: 40, color: C.muted, fontWeight: 600 }}>
        Forum not found.
      </div>
    );
  }

  const maxMarks = lesson.forumMarks;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", paddingBottom: 64 }}>
      
      {/* Back Link */}
      <div style={{ marginBottom: 24 }}>
        <Link 
          href={`/instructor/courses/${courseId}/modules/${moduleId}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}
        >
          <ArrowLeft size={16} /> Back to Module
        </Link>
      </div>

      {/* Header Card */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20,
        padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", marginBottom: 32,
        width: "100%", boxSizing: "border-box",
      }}>
        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: C.dark, margin: 0 }}>Edit Forum Settings</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X size={20} /></button>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Title</label>
              <input 
                type="text" 
                value={editTitle} onChange={e => setEditTitle(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgAlt, fontSize: 14, fontWeight: 700, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Prompt / Instructions</label>
              <textarea 
                value={editPrompt} onChange={e => setEditPrompt(e.target.value)}
                rows={4}
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgAlt, fontSize: 14, outline: "none", resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Total Marks for Grading</label>
              <input 
                type="number" 
                value={editMarks} onChange={e => setEditMarks(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 100"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgAlt, fontSize: 14, outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button onClick={() => setIsEditing(false)} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => updateForumMut.mutate()} disabled={updateForumMut.isPending} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`, color: "#FFFFFF", borderRadius: 10, fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer" }}>
                <Save size={16} /> {updateForumMut.isPending ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", boxSizing: "border-box" }}>
            {/* Top Header Row: Icon, Title, Points Badge & Edit Button */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: "1 1 200px", minWidth: 160 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: C.goldLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.gold, flexShrink: 0, border: "1px solid rgba(184,134,69,0.2)"
                }}>
                  <MessageSquare size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(18px, 3.5vw, 24px)", fontWeight: 800, color: C.dark, margin: 0, lineHeight: 1.3, wordBreak: "break-word" }}>
                      {lesson.title}
                    </h1>
                    <span style={{ padding: "4px 12px", background: C.goldLight, color: C.gold, border: "1px solid rgba(184,134,69,0.25)", borderRadius: 20, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>
                      Max: {maxMarks || 100} Points
                    </span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button 
                  onClick={() => {
                    setEditTitle(lesson.title);
                    setEditPrompt(lesson.content || "");
                    setEditMarks(lesson.forumMarks || "");
                    setIsEditing(true);
                  }}
                  style={{
                    padding: "8px 16px", background: C.bgAlt, border: `1px solid ${C.border}`,
                    borderRadius: 10, color: C.darkSoft, cursor: "pointer", display: "inline-flex",
                    alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, flexShrink: 0,
                    whiteSpace: "nowrap", marginLeft: "auto", boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Edit3 size={15} /> <span>Edit Prompt</span>
                </button>
              )}
            </div>

            {/* Discussion Prompt Guidelines Text */}
            {lesson.content && (
              <div style={{
                background: C.bgAlt, padding: "16px 20px", borderRadius: 14,
                border: `1px solid ${C.borderLight}`, fontSize: 14, lineHeight: 1.6,
                color: C.darkSoft, wordBreak: "break-word"
              }}>
                {lesson.content}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submissions Section Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "0 4px", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: C.dark, margin: 0 }}>
          Student Submissions
        </h2>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.muted }}>
          {discussions?.length || 0} Total
        </span>
      </div>

      {/* Submissions List */}
      {(!discussions || discussions.length === 0) ? (
        <div style={{ background: "#FFFFFF", borderRadius: 20, textAlign: "center", border: `2px dashed ${C.border}`, padding: "50px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <MessageSquare size={36} color={C.muted} style={{ marginBottom: 14 }} />
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 6px 0" }}>No Submissions Yet</h3>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Students haven't posted any replies to this prompt yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", boxSizing: "border-box" }}>
          {discussions.map((discussion: any) => {
            const isExpanded = expandedDiscussionId === discussion.id;
            const hasBeenGraded = discussion.score !== null && discussion.score !== undefined;

            return (
              <div 
                key={discussion.id} 
                style={{
                  background: "#FFFFFF", borderRadius: 18, border: `1px solid ${C.border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                {/* Accordion Top Bar */}
                <div 
                  onClick={() => setExpandedDiscussionId(isExpanded ? null : discussion.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, padding: "20px 24px", cursor: "pointer", flexWrap: "wrap",
                    width: "100%", boxSizing: "border-box", background: isExpanded ? C.bgAlt : "#FFFFFF"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 180 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%", background: C.goldLight,
                      color: C.gold, fontWeight: 800, fontSize: 15, display: "flex",
                      alignItems: "center", justifyContent: "center", border: `1px solid rgba(184,134,69,0.2)`,
                      flexShrink: 0
                    }}>
                      {getInitials(discussion.author?.name || "Student")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: "0 0 2px 0", fontSize: 15, fontWeight: 800, color: C.dark, wordBreak: "break-word" }}>
                        {discussion.author?.name || "Student"}
                      </h4>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        Submitted {new Date(discussion.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: "auto" }}>
                    {hasBeenGraded ? (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        color: C.green, fontWeight: 800, fontSize: 12,
                        background: "rgba(61,122,75,0.12)", padding: "5px 14px",
                        borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        <CheckCircle size={14} />
                        <span>Graded: {discussion.score}{maxMarks ? `/${maxMarks}` : ''}</span>
                      </div>
                    ) : (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        color: C.gold, fontWeight: 800, fontSize: 12,
                        background: "rgba(184,134,69,0.12)", padding: "5px 14px",
                        borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        <Edit3 size={14} />
                        <span>Needs Grading</span>
                      </div>
                    )}
                    
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: isExpanded ? "rgba(0,0,0,0.05)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: C.muted, flexShrink: 0
                    }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div style={{ padding: "0 24px 24px 24px", width: "100%", boxSizing: "border-box" }}>
                    <div style={{ width: "100%", height: 1, background: C.borderLight, marginBottom: 20 }} />
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", boxSizing: "border-box" }}>
                      
                      {/* Student's Post */}
                      <div style={{ width: "100%", boxSizing: "border-box" }}>
                        <h5 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.gold, margin: "0 0 8px 0" }}>
                          Student's Response
                        </h5>
                        <div style={{
                          background: C.bgAlt, padding: "18px 20px", borderRadius: 14,
                          border: `1px solid ${C.border}`, fontSize: 14, lineHeight: 1.6,
                          color: C.dark, whiteSpace: "pre-wrap", wordBreak: "break-word",
                          width: "100%", boxSizing: "border-box"
                        }}>
                          {discussion.content}
                        </div>
                      </div>

                      {/* Instructor Evaluation Form */}
                      <div style={{ width: "100%", boxSizing: "border-box" }}>
                        <div style={{ background: C.bgAlt, padding: "22px 24px", borderRadius: 16, border: `1px solid ${C.border}`, width: "100%", boxSizing: "border-box" }}>
                          <h4 style={{ fontSize: 15, fontWeight: 800, color: C.dark, margin: "0 0 16px 0" }}>
                            Instructor Evaluation
                          </h4>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", boxSizing: "border-box" }}>
                            <div>
                              <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.dark, marginBottom: 6 }}>
                                Points Awarded
                              </label>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input 
                                  type="number"
                                  style={{
                                    width: 100, padding: "10px 14px", borderRadius: 10,
                                    border: `1px solid ${C.border}`, background: "#FFFFFF",
                                    fontSize: 16, fontWeight: 800, color: C.dark, textAlign: "center",
                                    boxSizing: "border-box"
                                  }}
                                  value={grades[discussion.id] !== undefined ? grades[discussion.id] : ""}
                                  onChange={e => setGrades({ ...grades, [discussion.id]: e.target.value === "" ? "" : Number(e.target.value) })}
                                  placeholder="--"
                                  max={maxMarks || undefined}
                                />
                                {maxMarks && <span style={{ color: C.muted, fontWeight: 800, fontSize: 15 }}>/ {maxMarks}</span>}
                              </div>
                            </div>

                            <div>
                              <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.dark, marginBottom: 6 }}>
                                Feedback (Optional)
                              </label>
                              <textarea 
                                style={{
                                  width: "100%", padding: "12px 16px", borderRadius: 10,
                                  border: `1px solid ${C.border}`, background: "#FFFFFF",
                                  fontSize: 14, color: C.dark, outline: "none",
                                  resize: "vertical", minHeight: 100, lineHeight: 1.5,
                                  boxSizing: "border-box"
                                }}
                                placeholder="Leave constructive feedback for the student..."
                                value={feedbacks[discussion.id] !== undefined ? feedbacks[discussion.id] : ""}
                                onChange={e => setFeedbacks({ ...feedbacks, [discussion.id]: e.target.value })}
                              />
                            </div>

                            <button 
                              onClick={() => handleSaveGrade(discussion.id)}
                              disabled={gradeMut.isPending}
                              style={{
                                width: "100%", padding: "12px 24px",
                                background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
                                color: "#FFFFFF", borderRadius: 10, fontWeight: 800,
                                fontSize: 13, border: "none", cursor: "pointer",
                                opacity: gradeMut.isPending ? 0.7 : 1,
                                boxShadow: "0 4px 14px rgba(184,134,69,0.25)",
                                boxSizing: "border-box"
                              }}
                            >
                              {gradeMut.isPending ? "Saving Grade..." : "Save Grade & Feedback"}
                            </button>
                          </div>
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
