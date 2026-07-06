"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstructorDiscussions, gradeDiscussion } from "@/lib/api/instructor";
import { MessageCircle, CheckCircle, Clock, ChevronDown, ChevronUp, User, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function InstructorForumsPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gradingScores, setGradingScores] = useState<Record<string, string>>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<Record<string, string>>({});

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
      toast.success("Grade saved successfully");
      queryClient.invalidateQueries({ queryKey: ["instructor-discussions"] });
      setExpandedId(null);
    },
    onError: () => toast.error("Failed to save grade"),
  });

  const handleGrade = (id: string) => {
    const scoreStr = gradingScores[id];
    const score = parseInt(scoreStr, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Please enter a valid score (0-100)");
      return;
    }
    gradeMut.mutate({ id, score, feedback: gradingFeedbacks[id] || "" });
  };

  return (
    <div className="max-w-[1200px] mx-auto" style={{ padding: '24px' }}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-cway-dark-green mb-2 leading-tight">
            Discussion Forums
          </h1>
          <p className="text-[15px] text-cway-text-muted m-0">
            Moderate and grade student discussion posts across your courses.
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
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load discussions</h3>
          <p className="text-red-600 m-0 text-sm">An error occurred while fetching discussions. Please try again later.</p>
        </div>
      ) : !discussions || discussions.length === 0 ? (
        <div className="text-center bg-white rounded-2xl border border-cway-border-light shadow-sm" style={{ padding: '48px' }}>
          <MessageCircle size={48} className="text-cway-text-muted/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-cway-dark-green mb-2">No Discussions Found</h3>
          <p className="text-cway-text-muted m-0 text-base">There are currently no student discussion posts to review.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {discussions.map((discussion: any) => {
            const isExpanded = expandedId === discussion.id;
            const isGraded = discussion.score !== null;

            return (
              <div
                key={discussion.id}
                className="bg-white rounded-2xl border border-cway-border-light overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : discussion.id)}
                  style={{ padding: '20px 24px' }}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer transition-colors duration-200 ${
                    isExpanded ? "bg-cway-cream/40" : "bg-white hover:bg-cway-cream/20"
                  }`}
                >
                  <div className="flex items-start md:items-center gap-5 flex-1 min-w-0">
                    {discussion.author?.avatar ? (
                      <Image
                        src={discussion.author.avatar}
                        alt=""
                        width={48}
                        height={48}
                        className="rounded-full object-cover shrink-0 w-12 h-12 border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-cway-cream-dark/60 text-cway-forest flex items-center justify-center font-bold text-lg shrink-0 border border-gray-100 shadow-sm">
                        {discussion.author?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="m-0 text-base md:text-lg font-bold text-cway-dark-green truncate max-w-full">
                          {discussion.title}
                        </h3>
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cway-success bg-cway-success/10 px-2.5 py-1 rounded-md whitespace-nowrap">
                            <CheckCircle size={12} /> Graded: {discussion.score}/100
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cway-gold bg-cway-gold/10 px-2.5 py-1 rounded-md whitespace-nowrap">
                            <Clock size={12} /> Needs Grading
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[13px] text-cway-text-muted">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="shrink-0 text-gray-400" /> <span className="truncate max-w-[120px] md:max-w-[200px] font-medium text-gray-600">{discussion.author?.name}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="shrink-0 text-gray-400" /> 
                          <span className="truncate max-w-[180px] md:max-w-[300px] font-medium text-gray-600">
                            {discussion.course?.title} {discussion.lesson ? `› ${discussion.lesson.title}` : ""}
                          </span>
                        </span>
                        <span className="ml-auto md:ml-0 font-medium text-gray-400">{new Date(discussion.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-cway-text-muted hidden md:flex items-center shrink-0 ml-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ padding: '24px 32px' }} className="border-t border-cway-border-light bg-white animate-fade-in">
                    <div className="mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-cway-text-muted mb-4 flex items-center gap-2">
                        <MessageCircle size={16} /> Student's Post
                      </h4>
                      <div style={{ padding: '24px' }} className="text-[15px] text-cway-dark-green leading-relaxed whitespace-pre-wrap bg-cway-cream/40 rounded-xl border border-gray-50">
                        {discussion.content}
                      </div>
                    </div>

                    {discussion.replies && discussion.replies.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-cway-text-muted mb-4">
                          Replies ({discussion.replies.length})
                        </h4>
                        <div className="flex flex-col gap-4 pl-3 border-l-2 border-gray-100">
                          {discussion.replies.map((reply: any) => (
                            <div key={reply.id} style={{ padding: '20px' }} className="flex gap-4 bg-white rounded-xl border border-cway-border-light shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative">
                              <div className="absolute top-6 -left-4 w-4 h-[2px] bg-gray-100"></div>
                              <div className="w-10 h-10 rounded-full bg-cway-cream-dark/50 text-cway-forest flex items-center justify-center font-bold text-sm shrink-0 border border-gray-100">
                                {reply.author?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm font-bold text-cway-dark-green truncate">{reply.author?.name}</span>
                                  <span className="text-xs text-cway-text-muted shrink-0">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-[14px] text-cway-forest leading-relaxed whitespace-pre-wrap">
                                  {reply.content}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-cway-border-light" style={{ paddingTop: '24px', marginTop: '16px' }}>
                      <h4 className="text-lg font-bold text-cway-dark-green mb-6">
                        {isGraded ? "Update Grade" : "Grade Submission"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 mb-6">
                        <div className="flex flex-col gap-2.5">
                          <label className="text-xs font-bold text-cway-forest">Score (0-100)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            style={{ padding: '12px 16px' }}
                            placeholder={isGraded ? discussion.score.toString() : "e.g. 95"}
                            value={gradingScores[discussion.id] !== undefined ? gradingScores[discussion.id] : (discussion.score || "")}
                            onChange={(e) => setGradingScores(prev => ({ ...prev, [discussion.id]: e.target.value }))}
                            className="w-full bg-white rounded-lg border border-gray-200 text-base font-bold outline-none transition-all duration-200 focus:border-cway-gold focus:ring-2 focus:ring-cway-gold/20 shadow-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <label className="text-xs font-bold text-cway-forest">Feedback (Optional)</label>
                          <input
                            type="text"
                            style={{ padding: '12px 16px' }}
                            placeholder="Great insights! Keep it up..."
                            value={gradingFeedbacks[discussion.id] !== undefined ? gradingFeedbacks[discussion.id] : (discussion.feedback || "")}
                            onChange={(e) => setGradingFeedbacks(prev => ({ ...prev, [discussion.id]: e.target.value }))}
                            className="w-full bg-white rounded-lg border border-gray-200 text-sm outline-none transition-all duration-200 focus:border-cway-gold focus:ring-2 focus:ring-cway-gold/20 shadow-sm"
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: '24px' }}>
                        <button
                          onClick={() => handleGrade(discussion.id)}
                          disabled={gradeMut.isPending}
                          style={{ padding: '12px 24px' }}
                          className={`inline-flex items-center justify-center rounded-lg font-bold text-sm text-white bg-cway-gold hover:bg-[#d49938] transition-all shadow-sm hover:shadow-md ${
                            gradeMut.isPending ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"
                          }`}
                        >
                          {gradeMut.isPending ? "Saving..." : "Save Grade"}
                        </button>
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

