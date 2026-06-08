"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, MessageSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { createLesson, deleteLesson } from "@/lib/api/modules";
import { api } from "@/store/auth.store";

export default function ForumsPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumPrompt, setForumPrompt] = useState("");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", module.id],
    queryFn: () => api.get(`/courses/${module.courseId}/modules`).then(r => r.data.data.find((m:any) => m.id === module.id)?.lessons || []),
  });

  const forums = lessons?.filter((l: any) => l.type === "FORUM") || [];

  const createMut = useMutation({
    mutationFn: () => createLesson(module.id, {
      title: forumTitle,
      type: "FORUM",
      content: forumPrompt,
      duration: 0,
      isFree: false,
      isPreview: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      setIsCreating(false);
      setForumTitle("");
      setForumPrompt("");
      toast.success("Learning Forum created!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create forum"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      toast.success("Learning Forum deleted");
    },
    onError: () => toast.error("Failed to delete forum"),
  });

  if (isLoading) return <div style={{ padding: "40px", color: "#8F9E93" }}>Loading forums...</div>;

  return (
    <div style={{ maxWidth: "800px" }}>
      
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Learning Forums</h2>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Add discussion prompts for students to interact with you and each other.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#B88645", color: "#FFFFFF", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
          >
            <Plus size={16} /> Add Forum Prompt
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#1A261D" }}>New Forum Prompt</h3>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Discussion Topic / Title</label>
            <input 
              value={forumTitle} onChange={e => setForumTitle(e.target.value)}
              placeholder="e.g. Discuss your favorite chapter..."
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Prompt Guidelines / Instructions</label>
            <textarea 
              value={forumPrompt} onChange={e => setForumPrompt(e.target.value)}
              placeholder="What should students discuss in this forum? Provide clear guidelines..."
              rows={4}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button 
              onClick={() => setIsCreating(false)}
              style={{ background: "transparent", color: "#8F9E93", border: "1px solid #E4E8E0", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button 
              onClick={() => forumTitle && forumPrompt && createMut.mutate()}
              disabled={!forumTitle || !forumPrompt || createMut.isPending}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: (!forumTitle || !forumPrompt) ? "#E4E8E0" : "#1A261D", color: "#FFFFFF", border: "none", padding: "10px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: (!forumTitle || !forumPrompt) ? "not-allowed" : "pointer" }}
            >
              <Save size={16} /> {createMut.isPending ? "Saving..." : "Save Prompt"}
            </button>
          </div>
        </div>
      )}

      {/* Forums List */}
      {!forums || forums.length === 0 ? (
        !isCreating && (
          <div style={{ textAlign: "center", padding: "48px 0", background: "#FFFFFF", border: "1px dashed #E4E8E0", borderRadius: "12px" }}>
            <MessageSquare size={32} color="#8F9E93" style={{ margin: "0 auto 12px auto" }} />
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No learning forums</h3>
            <p style={{ margin: 0, color: "#8F9E93", fontSize: "13px" }}>Create a prompt to start a discussion in this module.</p>
          </div>
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {forums.map((forum: any) => (
            <div key={forum.id} style={{ background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", transition: "all 0.2s" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <MessageSquare size={16} color="#B88645" />
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1A261D" }}>{forum.title}</h4>
                </div>
                <p style={{ margin: 0, color: "#8A9E8C", fontSize: "14px", lineHeight: "1.5" }}>{forum.content}</p>
              </div>
              <button 
                onClick={() => {
                  if(confirm("Delete this forum? All student posts will be lost.")) {
                    deleteMut.mutate(forum.id);
                  }
                }}
                disabled={deleteMut.isPending}
                style={{ background: "transparent", border: "none", color: "#F87171", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
