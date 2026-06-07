"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { LayoutList, Plus, Loader2 } from "lucide-react";

export default function ModulesSection({ course, onSave }: { course: any; onSave?: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMut = useMutation({
    mutationFn: (data: any) => api.post(`/courses/${course.id}/modules`, data).then(r => r.data.data),
    onSuccess: () => {
      toast.success("Module created");
      setIsAdding(false);
      setTitle("");
      setDescription("");
      if (onSave) onSave();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create module"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    createMut.mutate({ title, description });
  };

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>Course Modules</h2>
      <p style={{ fontSize: "14px", color: "#8F9E93", marginBottom: "32px" }}>Modules are the main building blocks of your course. Each module can contain videos, reading materials, quizzes, and assignments.</p>

      {course.sections?.length > 0 ? (
        <div style={{ display: "grid", gap: "16px" }}>
          {course.sections.map((sec: any) => (
            <div key={sec.id} style={{ border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1A261D", margin: "0 0 4px 0" }}>{sec.title}</h3>
                <p style={{ fontSize: "13px", color: "#8F9E93", margin: 0 }}>{sec.lessons?.length || 0} items</p>
              </div>
              <Link href={`/instructor/courses/${course.id}/modules/${sec.id}`} style={{ padding: "8px 16px", background: "rgba(184,134,69,0.1)", color: "#B88645", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Manage Content</Link>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", border: "2px dashed #E2E8F0", borderRadius: "12px" }}>
          <LayoutList size={32} color="#A0AEC0" style={{ margin: "0 auto 12px auto" }} />
          <p style={{ color: "#8F9E93", fontWeight: 600, margin: "0 0 4px 0" }}>No modules yet</p>
          <p style={{ color: "#8F9E93", fontSize: "13px", margin: "0 0 16px 0" }}>Create your first module to start adding content.</p>
        </div>
      )}

      {isAdding ? (
        <form onSubmit={handleCreate} style={{ marginTop: "24px", padding: "24px", background: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0" }}>New Module</h3>
          <input type="text" placeholder="Module Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "12px" }} />
          <textarea placeholder="Brief description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "16px", resize: "vertical" }} />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setIsAdding(false)} style={{ padding: "10px 20px", borderRadius: "8px", background: "transparent", color: "#8F9E93", fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={createMut.isPending} style={{ padding: "10px 20px", borderRadius: "8px", background: "#FFFFFF", color: "#1A261D", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              {createMut.isPending ? <Loader2 size={16} className="animate-spin" /> : "Create Module"}
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} style={{ marginTop: "24px", padding: "12px 24px", background: "#FFFFFF", color: "#1A261D", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={18} /> Add New Module
        </button>
      )}
    </div>
  );
}
