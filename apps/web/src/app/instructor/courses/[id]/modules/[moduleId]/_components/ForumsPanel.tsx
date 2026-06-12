"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, MessageSquare, Save, Edit, Users, X } from "lucide-react";
import { toast } from "sonner";
import { createLesson, updateLesson, deleteLesson } from "@/lib/api/modules";
import { api } from "@/store/auth.store";
import Link from "next/link";

export default function ForumsPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingForumId, setEditingForumId] = useState<string | null>(null);
  
  const [forumTitle, setForumTitle] = useState("");
  const [forumPrompt, setForumPrompt] = useState("");
  const [forumMarks, setForumMarks] = useState<number | "">("");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", module.id],
    queryFn: () => api.get(`/courses/${module.courseId}/modules`).then(r => r.data.data.find((m:any) => m.id === module.id)?.lessons || []),
  });

  const forums = Array.isArray(lessons) ? lessons.filter((l: any) => l.type === "FORUM") : [];

  const resetForm = () => {
    setIsCreating(false);
    setEditingForumId(null);
    setForumTitle("");
    setForumPrompt("");
    setForumMarks("");
  };

  const createMut = useMutation({
    mutationFn: () => createLesson(module.id, {
      title: forumTitle,
      type: "FORUM",
      content: forumPrompt,
      duration: 0,
      isFree: false,
      isPreview: false,
      forumMarks: forumMarks === "" ? null : Number(forumMarks)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      resetForm();
      toast.success("Learning Forum created!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create forum"),
  });

  const updateMut = useMutation({
    mutationFn: () => updateLesson(editingForumId!, {
      title: forumTitle,
      type: "FORUM",
      content: forumPrompt,
      duration: 0,
      isFree: false,
      isPreview: false,
      forumMarks: forumMarks === "" ? null : Number(forumMarks)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      resetForm();
      toast.success("Learning Forum updated!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update forum"),
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
        {!isCreating && !editingForumId && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#B88645", color: "#FFFFFF", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
          >
            <Plus size={16} /> Add Forum Prompt
          </button>
        )}
      </div>

      {(isCreating || editingForumId) && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1A261D" }}>
              {isCreating ? "New Forum Prompt" : "Edit Forum Prompt"}
            </h3>
            <button onClick={resetForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={18} /></button>
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Discussion Topic / Title</label>
            <input 
              value={forumTitle} onChange={e => setForumTitle(e.target.value)}
              placeholder="e.g. Discuss your favorite chapter..."
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Prompt Guidelines / Instructions</label>
            <textarea 
              value={forumPrompt} onChange={e => setForumPrompt(e.target.value)}
              placeholder="What should students discuss in this forum? Provide clear guidelines..."
              rows={4}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D", resize: "vertical" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Maximum Marks (Optional)</label>
            <input 
              type="number"
              value={forumMarks} onChange={e => setForumMarks(e.target.value ? Number(e.target.value) : "")}
              placeholder="Leave blank if ungraded"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button 
              onClick={resetForm}
              style={{ background: "transparent", color: "#8F9E93", border: "1px solid #E4E8E0", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button 
              onClick={() => isCreating ? createMut.mutate() : updateMut.mutate()}
              disabled={!forumTitle || !forumPrompt || createMut.isPending || updateMut.isPending}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: (!forumTitle || !forumPrompt) ? "#E4E8E0" : "#1A261D", color: "#FFFFFF", border: "none", padding: "10px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: (!forumTitle || !forumPrompt) ? "not-allowed" : "pointer" }}
            >
              <Save size={16} /> {(createMut.isPending || updateMut.isPending) ? "Saving..." : "Save Prompt"}
            </button>
          </div>
        </div>
      )}

      {/* Forums List */}
      {!forums || forums.length === 0 ? (
        !isCreating && !editingForumId && (
          <div style={{ textAlign: "center", padding: "48px 0", background: "#FFFFFF", border: "1px dashed #E4E8E0", borderRadius: "12px" }}>
            <MessageSquare size={32} color="#8F9E93" style={{ margin: "0 auto 12px auto" }} />
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No learning forums</h3>
            <p style={{ margin: 0, color: "#8F9E93", fontSize: "13px" }}>Create a prompt to start a discussion in this module.</p>
          </div>
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {forums.map((forum: any) => (
            <div key={forum.id} style={{ background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <MessageSquare size={16} color="#B88645" />
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1A261D" }}>{forum.title}</h4>
                    {forum.forumMarks && (
                      <span style={{ padding: "2px 8px", background: "#FDF8F3", color: "#B88645", border: "1px solid #F3E8D6", borderRadius: "12px", fontSize: "11px", fontWeight: 700 }}>
                        {forum.forumMarks} Marks
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, color: "#8A9E8C", fontSize: "14px", lineHeight: "1.5" }}>{forum.content}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => {
                      setEditingForumId(forum.id);
                      setForumTitle(forum.title);
                      setForumPrompt(forum.content);
                      setForumMarks(forum.forumMarks || "");
                      setIsCreating(false);
                    }}
                    style={{ background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F3F4F0"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    title="Edit Forum"
                  >
                    <Edit size={16} />
                  </button>
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
                    title="Delete Forum"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ borderTop: "1px solid #E4E8E0", paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <Link href={`/instructor/courses/${module.courseId}/modules/${module.id}/forums/${forum.id}`} style={{ textDecoration: "none" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FDF8F3", color: "#B88645", border: "1px solid #F3E8D6", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                    <Users size={14} /> Grade Replies
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
