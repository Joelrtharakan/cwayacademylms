"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { updateLesson } from "@/lib/api/modules";
import { ArrowLeft, Users, MessageSquare, CheckCircle, ChevronDown, ChevronUp, Edit3, X, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
      <div className="p-12 text-[#8A9E8C] font-medium flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#C9973A] border-t-transparent rounded-full animate-spin" />
        Loading submissions...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-12 text-[#8A9E8C] font-medium">
        Forum not found.
      </div>
    );
  }

  const maxMarks = lesson.forumMarks;

  return (
    <div className="max-w-6xl mx-auto min-h-screen" style={{ padding: "40px" }}>
      
      {/* Header Section */}
      <div className="mb-12" style={{ marginBottom: "48px" }}>
        <Link 
          href={`/instructor/courses/${courseId}/modules/${moduleId}`}
          className="inline-flex items-center gap-2 text-[#8A9E8C] hover:text-[#1A261D] mb-8 font-bold text-[13px] tracking-widest uppercase transition-colors"
          style={{ marginBottom: "32px" }}
        >
          <ArrowLeft size={16} /> Back to Module
        </Link>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 bg-white rounded-3xl border border-[#E4E8E0] shadow-sm relative group" style={{ padding: "40px" }}>
          
          {!isEditing && (
            <button 
              onClick={() => {
                setEditTitle(lesson.title);
                setEditPrompt(lesson.content || "");
                setEditMarks(lesson.forumMarks || "");
                setIsEditing(true);
              }}
              className="absolute top-6 right-6 p-2 text-[#8A9E8C] hover:bg-[#F3F4F0] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Edit Forum"
            >
              <Edit3 size={18} />
            </button>
          )}

          {isEditing ? (
            <div className="w-full flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-serif font-bold text-xl text-[#1A261D]">Edit Forum Settings</h3>
                <button onClick={() => setIsEditing(false)} className="text-[#8A9E8C] hover:text-[#1A261D]"><X size={18} /></button>
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-[#8A9E8C] mb-2 uppercase tracking-wide">Title</label>
                <input 
                  type="text" 
                  value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-3 border border-[#E4E8E0] rounded-xl focus:outline-none focus:border-[#C9973A] bg-[#FAFAF7]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#8A9E8C] mb-2 uppercase tracking-wide">Prompt / Instructions</label>
                <textarea 
                  value={editPrompt} onChange={e => setEditPrompt(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-[#E4E8E0] rounded-xl focus:outline-none focus:border-[#C9973A] bg-[#FAFAF7] resize-y"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#8A9E8C] mb-2 uppercase tracking-wide">Total Marks for Grading</label>
                <input 
                  type="number" 
                  value={editMarks} onChange={e => setEditMarks(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 100"
                  className="w-full p-3 border border-[#E4E8E0] rounded-xl focus:outline-none focus:border-[#C9973A] bg-[#FAFAF7]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-[#8A9E8C] font-bold text-sm">Cancel</button>
                <button onClick={() => updateForumMut.mutate()} disabled={updateForumMut.isPending} className="flex items-center gap-2 bg-[#1A261D] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#2C3E30] transition-colors disabled:opacity-50">
                  <Save size={16} /> {updateForumMut.isPending ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-[#1A261D] mb-4 leading-tight" style={{ marginBottom: "16px" }}>
                  {lesson.title}
                </h1>
                <p className="text-[#526658] text-[16px] leading-relaxed max-w-3xl">
                  {lesson.content}
                </p>
              </div>
              
              <div className="bg-[#FAFAF7] border border-[#E4E8E0] rounded-2xl flex flex-col items-center shrink-0" style={{ padding: "20px 32px" }}>
                <span className="text-[11px] uppercase font-bold text-[#8A9E8C] tracking-widest mb-1">Max Points</span>
                <span className="text-3xl font-serif font-bold text-[#C9973A]">{maxMarks || "—"}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submissions Section */}
      <div>
        <div className="flex items-center justify-between mb-8 px-2" style={{ marginBottom: "32px" }}>
          <h2 className="text-[22px] font-bold text-[#1A261D] flex items-center gap-3 font-serif">
            Student Submissions
          </h2>
          <span className="text-[14px] font-bold text-[#526658]">
            {discussions?.length || 0} Total
          </span>
        </div>

        {(!discussions || discussions.length === 0) ? (
          <div className="bg-white rounded-3xl text-center border border-[#E4E8E0] shadow-sm" style={{ padding: "64px 32px" }}>
            <MessageSquare size={40} className="text-[#D3D9D5] mx-auto mb-4" style={{ marginBottom: "16px" }} />
            <h3 className="text-[#1A261D] font-bold font-serif text-xl mb-2" style={{ marginBottom: "8px" }}>No Submissions Yet</h3>
            <p className="text-[#8A9E8C] text-[15px]">Students haven't posted any replies to this prompt. Check back later!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {discussions.map((discussion: any) => {
              const isExpanded = expandedDiscussionId === discussion.id;
              const hasBeenGraded = discussion.score !== null && discussion.score !== undefined;

              return (
                <div 
                  key={discussion.id} 
                  className={`bg-white rounded-2xl transition-all duration-300 border overflow-hidden ${
                    isExpanded 
                      ? "shadow-md border-[#C9973A]/40 ring-1 ring-[#C9973A]/20" 
                      : "shadow-sm border-[#E4E8E0] hover:border-[#D3D9D5]"
                  }`}
                >
                  <div 
                    className="flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-6"
                    style={{ padding: "24px 32px" }}
                    onClick={() => setExpandedDiscussionId(isExpanded ? null : discussion.id)}
                  >
                    <div className="flex items-center gap-5 flex-1">
                      <div className="w-12 h-12 rounded-full bg-[#FAFAF7] text-[#1A261D] font-bold text-[14px] flex items-center justify-center border border-[#E4E8E0] shrink-0">
                        {getInitials(discussion.author?.name || "Student")}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-[#1A261D] mb-1" style={{ marginBottom: "4px" }}>{discussion.author?.name || "Student"}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] text-[#8A9E8C] font-medium">Submitted {new Date(discussion.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 self-start md:self-auto">
                      {hasBeenGraded ? (
                        <div className="flex items-center gap-2 text-[#4A8C5C] font-bold text-[13px] bg-[#ECFDF5] rounded-xl border border-[#4A8C5C]/20" style={{ padding: "8px 16px" }}>
                          <CheckCircle size={15} strokeWidth={2.5} /> Graded: {discussion.score}{maxMarks ? `/${maxMarks}` : ''}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#B88645] font-bold text-[13px] bg-[#FFFBEB] rounded-xl border border-[#F59E0B]/20" style={{ padding: "8px 16px" }}>
                          <Edit3 size={15} strokeWidth={2.5} /> Needs Grading
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-[#FAFAF7] text-[#1A261D]" : "bg-transparent text-[#8A9E8C]"}`}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-2" style={{ paddingLeft: "32px", paddingRight: "32px", paddingBottom: "32px" }}>
                      <div className="h-px w-full bg-[#E4E8E0] mb-8" style={{ marginBottom: "32px" }} />
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
                        {/* Student's Post */}
                        <div className="space-y-4" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          <h5 className="text-[12px] font-bold uppercase tracking-widest text-[#8A9E8C]">Student's Response</h5>
                          <div className="bg-[#FAFAF7] rounded-2xl border border-[#E4E8E0]" style={{ padding: "24px" }}>
                            <p className="text-[#1A261D] text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                              {discussion.content}
                            </p>
                          </div>
                        </div>

                        {/* Grading Section */}
                        <div>
                          <div className="bg-white rounded-2xl border border-[#E4E8E0] shadow-sm" style={{ padding: "32px" }}>
                            <h4 className="text-[15px] font-bold text-[#1A261D] mb-6 flex items-center gap-2" style={{ marginBottom: "24px" }}>
                              Instructor Evaluation
                            </h4>
                            
                            <div className="flex flex-col gap-6" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                              <div className="flex flex-col gap-3" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <label className="text-[12px] font-bold uppercase tracking-widest text-[#8A9E8C]">Points Awarded</label>
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="number"
                                    className="w-24 bg-[#FAFAF7] rounded-xl border border-[#E4E8E0] text-[16px] font-bold text-[#1A261D] outline-none focus:border-[#C9973A] focus:bg-white transition-all text-center"
                                    style={{ padding: "12px 16px", minHeight: "48px" }}
                                    value={grades[discussion.id] !== undefined ? grades[discussion.id] : ""}
                                    onChange={e => setGrades({ ...grades, [discussion.id]: e.target.value === "" ? "" : Number(e.target.value) })}
                                    placeholder="--"
                                    max={maxMarks || undefined}
                                  />
                                  {maxMarks && <span className="text-[#8A9E8C] font-bold text-[16px] shrink-0">/ {maxMarks}</span>}
                                </div>
                              </div>

                              <div className="flex flex-col gap-3" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <label className="text-[12px] font-bold uppercase tracking-widest text-[#8A9E8C]">Feedback (Optional)</label>
                                <textarea 
                                  className="w-full bg-[#FAFAF7] rounded-xl border border-[#E4E8E0] text-[15px] text-[#1A261D] outline-none focus:border-[#C9973A] focus:bg-white transition-all min-h-[140px] resize-y leading-relaxed"
                                  style={{ padding: "16px 20px" }}
                                  placeholder="Leave constructive feedback..."
                                  value={feedbacks[discussion.id] !== undefined ? feedbacks[discussion.id] : ""}
                                  onChange={e => setFeedbacks({ ...feedbacks, [discussion.id]: e.target.value })}
                                />
                              </div>

                              <button 
                                onClick={() => handleSaveGrade(discussion.id)}
                                disabled={gradeMut.isPending}
                                className="w-full mt-4 bg-[#1A261D] hover:bg-[#2C3E30] text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ padding: "18px 24px", fontSize: "16px" }}
                              >
                                {gradeMut.isPending ? "Saving..." : "Save Grade & Feedback"}
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

    </div>
  );
}
