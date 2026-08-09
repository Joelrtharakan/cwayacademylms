import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createAssignment, getAssignments, deleteAssignment, uploadAssignmentAttachment, updateAssignment, getAssignmentSubmissions, gradeSubmission } from "@/lib/api/modules";
import { FileText, Plus, X, UploadCloud, Edit2, Trash2, GripVertical, Calendar, Users, ChevronLeft, Download, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/shared/ConfirmContext";

const SubmissionsViewer = ({ assignment, onBack }: { assignment: any, onBack: () => void }) => {
  const queryClient = useQueryClient();
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions", assignment.id],
    queryFn: () => getAssignmentSubmissions(assignment.id)
  });

  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const gradeMut = useMutation({
    mutationFn: async () => {
      return await gradeSubmission(gradingSubmission.id, Number(grade), feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", assignment.id] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Grade saved!");
      setGradingSubmission(null);
    },
    onError: (err: any) => toast.error("Grading failed")
  });

  if (gradingSubmission) {
    return (
      <div style={{
        background: "#FFFFFF", padding: "24px 28px", borderRadius: 20,
        border: "1px solid #E4E8E0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        width: "100%", boxSizing: "border-box",
      }}>
        <button
          onClick={() => setGradingSubmission(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#F7F8F5", border: "1px solid #E4E8E0",
            color: "#2D3A2F", cursor: "pointer", fontWeight: 700,
            padding: "8px 16px", borderRadius: 10, fontSize: 13, marginBottom: 20,
          }}
        >
          <ChevronLeft size={16} /> <span>Back to list</span>
        </button>

        <h3 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 800, margin: "0 0 6px 0", color: "#1A261D" }}>
          Grading: {gradingSubmission.student?.name || "Student"}
        </h3>
        <p style={{ color: "#7F8E82", fontSize: 13, marginBottom: 24, lineHeight: 1.4 }}>
          Submitted on {new Date(gradingSubmission.submittedAt).toLocaleString()}
        </p>
        
        {/* RESPONSIVE FLEX LAYOUT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", boxSizing: "border-box" }}>
          
          {/* Top Section: Student Response & Attachments */}
          <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "#B88645", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, whiteSpace: "nowrap" }}>
              Student Response
            </h4>
            <div style={{
              background: "#F7F8F5", padding: "18px 20px", borderRadius: 14,
              border: "1px solid #E4E8E0", fontSize: 14, whiteSpace: "pre-wrap",
              wordBreak: "break-word", color: "#1A261D", minHeight: 100, lineHeight: 1.6,
              width: "100%", boxSizing: "border-box",
            }}>
              {gradingSubmission.content || "No text response provided."}
            </div>

            {gradingSubmission.fileUrl && (
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: "#B88645", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, whiteSpace: "nowrap" }}>
                  Submitted Attachment
                </h4>
                {gradingSubmission.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
                  <div style={{ border: "1px solid #E4E8E0", borderRadius: 14, overflow: "hidden" }}>
                    <img src={gradingSubmission.fileUrl} alt="Attachment" style={{ width: "100%", display: "block" }} />
                    <div style={{ padding: 14, background: "#FFFFFF", borderTop: "1px solid #E4E8E0" }}>
                      <a href={gradingSubmission.fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#3D7A4B", textDecoration: "none", fontWeight: 800, fontSize: 13 }}>
                        <Download size={15} /> Download Original
                      </a>
                    </div>
                  </div>
                ) : (
                  <a href={gradingSubmission.fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: 12, textDecoration: "none", color: "#1A261D", fontWeight: 700, fontSize: 13 }}>
                    <Download size={16} /> View / Download File
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Bottom Section: Grade & Feedback Form */}
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <div style={{ background: "#F7F8F5", padding: "22px 24px", borderRadius: 16, border: "1px solid #E4E8E0", width: "100%", boxSizing: "border-box" }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1A261D", margin: "0 0 18px 0" }}>Grade & Feedback</h4>
              
              <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1A261D", marginBottom: 6 }}>Score (out of {assignment.maxScore})</label>
                <input 
                  type="number" 
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  placeholder="e.g. 95"
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: "1px solid #E4E8E0", background: "#FFFFFF", fontSize: 15, fontWeight: 700 }}
                />
              </div>

              <div style={{ marginBottom: 20, width: "100%", boxSizing: "border-box" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1A261D", marginBottom: 6 }}>Feedback</label>
                <textarea 
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the student..."
                  rows={4}
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: "1px solid #E4E8E0", background: "#FFFFFF", fontSize: 14, resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              <button 
                onClick={() => gradeMut.mutate()}
                disabled={gradeMut.isPending || !grade}
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 24px", background: "linear-gradient(135deg, #B88645 0%, #A3763A 100%)", color: "#FFFFFF", borderRadius: 10, fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", opacity: gradeMut.isPending || !grade ? 0.7 : 1, boxShadow: "0 4px 14px rgba(184,134,69,0.25)" }}
              >
                {gradeMut.isPending ? "Saving Grade…" : "Submit Grade"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", fontWeight: 600, marginBottom: "24px" }}>
        <ChevronLeft size={16} /> Back to Assignments
      </button>
      <h3 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 24px 0", fontFamily: "Georgia, serif" }}>Submissions: {assignment.title}</h3>
      
      {isLoading ? (
        <p>Loading submissions...</p>
      ) : !submissions || submissions.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
          <p style={{ margin: 0, color: "#8F9E93" }}>No submissions yet for this assignment.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {submissions.map((sub: any) => (
            <div
              key={sub.id}
              style={{
                display: "flex", flexDirection: "column", gap: 12,
                padding: "16px 20px", background: "#FFFFFF", borderRadius: 16,
                border: "1px solid #E4E8E0", width: "100%", boxSizing: "border-box",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              {/* Top Row: Avatar & Student Details */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minWidth: 0 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%", background: "rgba(184,134,69,0.12)",
                  color: "#B88645", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 15, flexShrink: 0, border: "1px solid rgba(184,134,69,0.2)"
                }}>
                  {sub.student?.name?.charAt(0) || "S"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 2px 0", fontSize: 15, fontWeight: 800, color: "#1A261D", wordBreak: "break-word" }}>
                    {sub.student?.name || "Student"}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#7F8E82", wordBreak: "break-all" }}>
                    {sub.student?.email ? `${sub.student.email} • ` : ""}{new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: 1, background: "#EBEEE8" }} />

              {/* Bottom Row: Status Badge & Grade Button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", width: "100%", boxSizing: "border-box" }}>
                {sub.isGraded ? (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    color: "#3D7A4B", fontWeight: 800, fontSize: 12,
                    background: "rgba(61,122,75,0.12)", padding: "5px 12px",
                    borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    <CheckCircle size={14} />
                    <span>Graded: {sub.grade}/{assignment.maxScore}</span>
                  </div>
                ) : (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    color: "#B88645", fontWeight: 800, fontSize: 12,
                    background: "rgba(184,134,69,0.12)", padding: "5px 12px",
                    borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    <span>Needs Grading</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setGradingSubmission(sub);
                    setGrade(sub.grade?.toString() || "");
                    setFeedback(sub.feedback || "");
                  }}
                  style={{
                    padding: "8px 16px", background: "#F7F8F5", border: "1px solid #E4E8E0",
                    borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer",
                    color: "#1A261D", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "auto",
                  }}
                >
                  {sub.isGraded ? "Edit Grade" : "Grade"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AssignmentsPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", maxScore: "100", dueDate: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState<any>(null);

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
      setForm({ title: "", description: "", maxScore: "100", dueDate: "" });
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
      setForm({ title: "", description: "", maxScore: "100", dueDate: "" });
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
      maxScore: String(assign.maxScore || 100),
      dueDate: assign.dueDate ? new Date(assign.dueDate).toISOString().slice(0, 16) : ""
    });
    setSelectedFile(null);
    setIsCreating(true);
  };

  if (viewingSubmissionsFor) {
    return <SubmissionsViewer assignment={viewingSubmissionsFor} onBack={() => setViewingSubmissionsFor(null)} />;
  }

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap", marginBottom: 28, width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Assignments</h2>
          <p style={{ margin: 0, color: "#7F8E82", fontSize: 13, lineHeight: 1.4 }}>Create tasks for students to submit files or text.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", description: "", maxScore: "100", dueDate: "" });
              setSelectedFile(null);
              setIsCreating(true);
            }}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 20px", background: "linear-gradient(135deg, #B88645 0%, #A3763A 100%)",
              color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 800,
              cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 4px 14px rgba(184,134,69,0.25)"
            }}
          >
            <Plus size={16} /> <span style={{ whiteSpace: "nowrap" }}>Add Assignment</span>
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
                rows={3}
                data-lenis-prevent="true"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", resize: "vertical", overflowY: "auto", minHeight: "120px", maxHeight: "300px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Max Points</label>
                <input 
                  type="number" 
                  value={form.maxScore}
                  onChange={e => setForm({ ...form, maxScore: e.target.value })}
                  min="0"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Due Date & Time (Optional)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input 
                      type="text" 
                      placeholder="DD/MM/YYYY"
                      readOnly
                      value={
                        form.dueDate && form.dueDate.includes("-")
                          ? (() => {
                              const parts = form.dueDate.split("T")[0].split("-");
                              if (parts.length === 3) {
                                 const [yyyy, mm, dd] = parts;
                                 return `${dd}/${mm}/${yyyy}`;
                              }
                              return form.dueDate; 
                            })()
                          : ""
                      }
                      style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", cursor: "pointer", outline: "none", color: "#1A261D" }}
                    />
                    <input 
                      type="date" 
                      value={form.dueDate && form.dueDate.includes("-") ? form.dueDate.split("T")[0] : ""}
                      onChange={e => {
                        const date = e.target.value;
                        const time = form.dueDate && form.dueDate.includes("T") ? form.dueDate.split("T")[1] : "23:59";
                        setForm({ ...form, dueDate: date ? `${date}T${time}` : "" });
                      }}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 10 }}
                    />
                  </div>
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
      {isLoading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} /></div>
      ) : !assignments || assignments.length === 0 ? (
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
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4E8E0", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 200, flex: "1 1 240px" }}>
                  <GripVertical size={18} color="#A0AEC0" style={{ cursor: "grab", flexShrink: 0 }} />
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645", flexShrink: 0 }}>
                    <FileText size={18} fill="currentColor" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#1A261D", wordBreak: "break-word", lineHeight: 1.4 }}>{assign.title}</h4>
                    <div style={{ fontSize: "12px", color: "#8F9E93", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "#8F9E93" }}>{assign.maxScore} Points</span>
                      {assign.dueDate && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={12} /> Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#4299E1" }}><Users size={12} /> {assign._count?.submissions || 0} Submissions</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setViewingSubmissionsFor(assign)}
                    style={{ padding: "8px 16px", background: "#1A261D", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Users size={14} />
                    <span>View Submissions</span>
                  </button>

                  {/* Icon Action Group: Edit & Delete stay together */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button onClick={() => handleEdit(assign)} title="Edit Assignment" style={{ width: "34px", height: "34px", background: "#F7F8F5", border: "1px solid #E4E8E0", color: "#2D3A2F", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={async () => { if(await confirm("Delete assignment?")) deleteMut.mutate(assign.id); }} title="Delete Assignment" style={{ width: "34px", height: "34px", background: "rgba(220,74,74,0.06)", border: "1px solid rgba(220,74,74,0.2)", color: "#DC4A4A", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
