import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createAssignment, getAssignments, deleteAssignment, uploadAssignmentAttachment } from "@/lib/api/modules";
import { FileText, Plus, X, UploadCloud, Edit2, Trash2, GripVertical, Calendar, Users } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AssignmentsPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", maxScore: 100, dueDate: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments", module.id],
    queryFn: () => getAssignments(module.id),
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const data = {
        title: form.title,
        description: form.description,
        maxScore: Number(form.maxScore),
        dueDate: form.dueDate || undefined,
      };
      const res = await createAssignment(module.id, data);
      if (selectedFile && res.assignment?.id) {
        await uploadAssignmentAttachment(res.assignment.id, selectedFile);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setForm({ title: "", description: "", maxScore: 100, dueDate: "" });
      setSelectedFile(null);
      toast.success("Assignment created!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Creation failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Assignment deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    createMut.mutate();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Assignments</h2>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Create tasks for students to submit files or text.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
          >
            <Plus size={16} /> Add Assignment
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "32px", boxShadow: "0 10px 30px rgba(26,38,29,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>New Assignment</h3>
            <button onClick={() => setIsCreating(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Essay: Understanding Grace"
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Instructions</label>
              <textarea 
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed instructions for the assignment..."
                required
                rows={4}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Max Points</label>
                <input 
                  type="number" 
                  value={form.maxScore}
                  onChange={e => setForm({ ...form, maxScore: Number(e.target.value) })}
                  min="0"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Due Date (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Attachment (Optional)</label>
              <div style={{ border: "2px dashed rgba(184,134,69,0.4)", borderRadius: "12px", padding: "20px", textAlign: "center", background: "rgba(184,134,69,0.02)" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#8F9E93", fontWeight: 500 }}>
                  {selectedFile ? selectedFile.name : "Upload a template or reference file"}
                </p>
                <input 
                  type="file" 
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  id="assignment-upload" 
                  style={{ display: "none" }} 
                />
                <label htmlFor="assignment-upload" style={{ display: "inline-block", padding: "6px 12px", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#1A261D" }}>
                  Select File
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid #E4E8E0" }}>
              <button 
                type="submit"
                disabled={createMut.isPending}
                style={{ padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: createMut.isPending ? 0.7 : 1 }}
              >
                {createMut.isPending ? "Creating..." : "Save Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {!assignments || assignments.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
          <FileText size={28} color="#A0AEC0" style={{ margin: "0 auto 16px auto" }} />
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No assignments</h3>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Test student understanding with assignments.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {assignments.map((item: any) => {
            const assign = item.assignment;
            if (!assign) return null;
            return (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4E8E0" }}>
                <GripVertical size={18} color="#A0AEC0" style={{ cursor: "grab" }} />
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645" }}>
                  <FileText size={18} fill="currentColor" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 600, color: "#1A261D" }}>{assign.title}</h4>
                  <div style={{ fontSize: "12px", color: "#8F9E93", display: "flex", gap: "16px" }}>
                    <span style={{ fontWeight: 600, color: "#8F9E93" }}>{assign.maxScore} Points</span>
                    {assign.dueDate && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={12} /> Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#4299E1" }}><Users size={12} /> {assign._count?.submissions || 0} Submissions</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "#E4E8E0"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => { if(confirm("Delete assignment?")) deleteMut.mutate(assign.id); }} style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#E53E3E", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(229,62,62,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
