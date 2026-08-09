"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, MessageSquare, Save, Edit, Users, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLesson, updateLesson, deleteLesson } from "@/lib/api/modules";
import { api } from "@/store/auth.store";
import { Link } from "@/i18n/routing";
import { useConfirm } from "@/components/shared/ConfirmContext";

export default function ForumsPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isCreating, setIsCreating] = useState(false);
  const [editingForumId, setEditingForumId] = useState<string | null>(null);
  
  const [forumTitle, setForumTitle] = useState("");
  const [forumPrompt, setForumPrompt] = useState("");
  const [forumMarks, setForumMarks] = useState<number | "">("");
  const [forumDueDate, setForumDueDate] = useState("");
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minute = i % 2 === 0 ? '00' : '30';
    const time24 = `${hour}:${minute}`;
    const time12 = new Date(`2000-01-01T${time24}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return { time24, time12 };
  });

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
    setForumDueDate("");
  };

  const createMut = useMutation({
    mutationFn: () => createLesson(module.id, {
      title: forumTitle,
      type: "FORUM",
      content: forumPrompt,
      duration: 0,
      isFree: false,
      isPreview: false,
      forumMarks: forumMarks === "" ? null : Number(forumMarks),
      dueDate: forumDueDate ? new Date(forumDueDate).toISOString() : undefined,
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
      forumMarks: forumMarks === "" ? null : Number(forumMarks),
      dueDate: forumDueDate ? new Date(forumDueDate).toISOString() : undefined,
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


  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap", marginBottom: 28, width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Learning Forums</h2>
          <p style={{ margin: 0, color: "#7F8E82", fontSize: 13, lineHeight: 1.4 }}>Create discussion prompts for students in this module.</p>
        </div>
        {!isCreating && !editingForumId && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 20px", background: "linear-gradient(135deg, #B88645 0%, #A3763A 100%)",
              color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 800,
              cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 4px 14px rgba(184,134,69,0.25)"
            }}
          >
            <Plus size={16} /> <span style={{ whiteSpace: "nowrap" }}>New Forum Topic</span>
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
              value={forumPrompt} 
              onChange={e => setForumPrompt(e.target.value)}
              placeholder="What should students discuss in this forum? Provide clear guidelines..."
              rows={3}
              data-lenis-prevent="true"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D", resize: "vertical", overflowY: "auto", minHeight: "120px", maxHeight: "300px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Total Marks for Grading</label>
              <input 
                type="number"
                value={forumMarks} onChange={e => setForumMarks(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 100 (Leave blank for default 100)"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D" }}
              />
            </div>
            <div>
              <div style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Due Date & Time (Optional)</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input 
                    type="text" 
                    placeholder="DD/MM/YYYY"
                    readOnly
                    value={
                      forumDueDate && forumDueDate.includes("-")
                        ? (() => {
                            const parts = forumDueDate.split("T")[0].split("-");
                            if (parts.length === 3) {
                               const [yyyy, mm, dd] = parts;
                               return `${dd}/${mm}/${yyyy}`;
                            }
                            return forumDueDate; 
                          })()
                        : ""
                    }
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none", color: "#1A261D", background: "#FFFFFF", cursor: "pointer" }}
                  />
                  <input 
                    type="date" 
                    value={forumDueDate && forumDueDate.includes("-") ? forumDueDate.split("T")[0] : ""}
                    onChange={e => {
                      const date = e.target.value;
                      const time = forumDueDate && forumDueDate.includes("T") ? forumDueDate.split("T")[1] : "23:59";
                      setForumDueDate(date ? `${date}T${time}` : "");
                    }}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 10 }}
                  />
                </div>
                <div style={{ position: "relative", flex: 1 }}>
                  <div 
                    onClick={() => setIsTimeOpen(!isTimeOpen)}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#FFFFFF", fontSize: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span style={{ color: forumDueDate ? "#1A261D" : "#8F9E93" }}>
                      {forumDueDate && forumDueDate.includes("T") 
                        ? new Date(`2000-01-01T${forumDueDate.split("T")[1]}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                        : "Select Time"}
                    </span>
                    <span style={{ fontSize: "10px", color: "#8F9E93" }}>▼</span>
                  </div>
                  {isTimeOpen && (
                    <div 
                      onWheel={(e) => e.stopPropagation()}
                      style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", maxHeight: "200px", overflowY: "auto", zIndex: 100 }}
                    >
                      {timeOptions.map(({ time24, time12 }) => (
                        <div 
                          key={time24}
                          onClick={() => {
                            const date = forumDueDate && forumDueDate.includes("T") ? forumDueDate.split("T")[0] : new Date().toISOString().split("T")[0];
                            setForumDueDate(`${date}T${time24}`);
                            setIsTimeOpen(false);
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#F7F8F5"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          style={{ padding: "10px 16px", fontSize: "14px", cursor: "pointer", color: "#1A261D", borderBottom: "1px solid rgba(0,0,0,0.02)" }}
                        >
                          {time12}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
      {isLoading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} /></div>
      ) : !forums || forums.length === 0 ? (
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
            <div
              key={forum.id}
              style={{
                display: "flex", flexDirection: "column", gap: 14,
                padding: "20px 22px", background: "#FFFFFF", borderRadius: 16,
                border: "1px solid #E4E8E0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                width: "100%", boxSizing: "border-box", transition: "all 0.2s",
              }}
            >
              {/* Top Row: Title, Marks Badge, Prompt Text & Top-Right Edit/Delete Action Icons */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", width: "100%" }}>
                <div style={{ flex: "1 1 180px", minWidth: 160 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <MessageSquare size={18} color="#B88645" style={{ flexShrink: 0 }} />
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1A261D", wordBreak: "break-word", lineHeight: 1.3 }}>
                      {forum.title}
                    </h4>
                    {forum.forumMarks ? (
                      <span style={{ padding: "3px 10px", background: "rgba(184,134,69,0.12)", color: "#B88645", border: "1px solid rgba(184,134,69,0.25)", borderRadius: 12, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>
                        Max: {forum.forumMarks} Marks
                      </span>
                    ) : (
                      <span style={{ padding: "3px 10px", background: "#F7F8F5", color: "#7F8E82", border: "1px solid #E4E8E0", borderRadius: 12, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>
                        Max: 100 Marks (Default)
                      </span>
                    )}
                  </div>
                  {forum.content && (
                    <p style={{ margin: "4px 0 0 0", color: "#7F8E82", fontSize: 13, lineHeight: 1.5, wordBreak: "break-word" }}>
                      {forum.content}
                    </p>
                  )}
                </div>

                {/* Right Action Icons (Edit & Delete) */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: "auto" }}>
                  <button
                    onClick={() => {
                      setEditingForumId(forum.id);
                      setForumTitle(forum.title);
                      setForumPrompt(forum.content);
                      setForumMarks(forum.forumMarks || "");
                      setForumDueDate(forum.dueDate ? new Date(forum.dueDate).toISOString().slice(0, 16) : "");
                      setIsCreating(false);
                    }}
                    title="Edit Forum Prompt"
                    style={{
                      width: 34, height: 34, background: "#F7F8F5", border: "1px solid #E4E8E0",
                      color: "#2D3A2F", cursor: "pointer", borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={async () => {
                      if(await confirm("Delete this forum? All student posts will be lost.")) {
                        deleteMut.mutate(forum.id);
                      }
                    }}
                    disabled={deleteMut.isPending}
                    title="Delete Forum"
                    style={{
                      width: 34, height: 34, background: "rgba(220,74,74,0.06)", border: "1px solid rgba(220,74,74,0.2)",
                      color: "#DC4A4A", cursor: "pointer", borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Divider Line */}
              <div style={{ width: "100%", height: 1, background: "#EBEEE8" }} />

              {/* Bottom Row: Grade Replies Button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                <Link href={`/instructor/courses/${module.courseId}/modules/${module.id}/forums/${forum.id}`} style={{ textDecoration: "none" }}>
                  <button style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg, #B88645 0%, #A3763A 100%)", color: "#FFFFFF",
                    border: "none", padding: "9px 18px", borderRadius: 10, fontSize: 13,
                    fontWeight: 800, cursor: "pointer", boxShadow: "0 3px 10px rgba(184,134,69,0.25)",
                    whiteSpace: "nowrap",
                  }}>
                    <Users size={15} /> <span>Grade Replies</span>
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
