import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createAssignment, getAssignments, deleteAssignment, uploadAssignmentAttachment, updateAssignment } from "@/lib/api/modules";
import { FileText, Plus, X, UploadCloud, Edit2, Trash2, GripVertical, Calendar, Users } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AssignmentsPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", maxScore: 100, dueDate: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // Array of time options for the custom dropdown
  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minute = i % 2 === 0 ? '00' : '30';
    const time24 = `${hour}:${minute}`;
    const time12 = new Date(`2000-01-01T${time24}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return { time24, time12 };
  });

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

  const updateMut = useMutation({
    mutationFn: async (id: string) => {
      const data = {
        title: form.title,
        description: form.description,
        maxScore: Number(form.maxScore),
        dueDate: form.dueDate || undefined,
      };
      const res = await updateAssignment(id, data);
      if (selectedFile) {
        await uploadAssignmentAttachment(id, selectedFile);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setEditingId(null);
      setForm({ title: "", description: "", maxScore: 100, dueDate: "" });
      setSelectedFile(null);
      toast.success("Assignment updated!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
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
    if (editingId) {
      updateMut.mutate(editingId);
    } else {
      createMut.mutate();
    }
  };

  const handleEdit = (assign: any) => {
    setEditingId(assign.id);
    setForm({
      title: assign.title,
      description: assign.description || "",
      maxScore: assign.maxScore || 100,
      dueDate: assign.dueDate ? new Date(assign.dueDate).toISOString().slice(0, 16) : ""
    });
    setSelectedFile(null);
    setIsCreating(true);
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
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", description: "", maxScore: 100, dueDate: "" });
              setSelectedFile(null);
              setIsCreating(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
          >
            <Plus size={16} /> Add Assignment
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "32px", boxShadow: "0 10px 30px rgba(26,38,29,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>{editingId ? "Edit Assignment" : "New Assignment"}</h3>
            <button onClick={() => { setIsCreating(false); setEditingId(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={20} /></button>
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
                onWheel={(e) => e.stopPropagation()}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", resize: "vertical", overflowY: "auto" }}
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
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Due Date & Time (Optional)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="date" 
                    defaultValue={form.dueDate ? form.dueDate.split("T")[0] : ""}
                    onChange={e => {
                      const date = e.target.value;
                      const time = form.dueDate && form.dueDate.includes("T") ? form.dueDate.split("T")[1] : "23:59";
                      setForm({ ...form, dueDate: date ? `${date}T${time}` : "" });
                    }}
                    style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                  />
                  <div style={{ position: "relative", flex: 1 }}>
                    <div 
                      onClick={() => setIsTimeOpen(!isTimeOpen)}
                      style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span>
                        {form.dueDate && form.dueDate.includes("T") 
                          ? new Date(`2000-01-01T${form.dueDate.split("T")[1]}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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
                              const date = form.dueDate && form.dueDate.includes("T") ? form.dueDate.split("T")[0] : new Date().toISOString().split("T")[0];
                              setForm({ ...form, dueDate: `${date}T${time24}` });
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
                disabled={createMut.isPending || updateMut.isPending}
                style={{ padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}
              >
                {createMut.isPending || updateMut.isPending ? "Saving..." : editingId ? "Update Assignment" : "Save Assignment"}
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
                  <button onClick={() => handleEdit(assign)} style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "#E4E8E0"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
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
