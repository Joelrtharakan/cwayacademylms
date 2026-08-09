import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuiz, getQuizzes, updateQuiz, deleteQuiz } from "@/lib/api/modules";
import { Award, Plus, X, Edit2, Trash2, GripVertical, Clock, HelpCircle, Loader2, List } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import QuestionBuilderModal from "./QuestionBuilderModal";
import { useConfirm } from "@/components/shared/ConfirmContext";

export default function QuizzesPanel({ module }: { module: any }) {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSettingsId, setEditingSettingsId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", instructions: "", passingScore: "70", timeLimit: "0", maxAttempts: "3" });

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes", module.id],
    queryFn: () => getQuizzes(module.id),
  });

  const createMut = useMutation({
    mutationFn: () => createQuiz(module.id, {
      title: form.title,
      instructions: form.instructions,
      passingScore: Number(form.passingScore),
      timeLimit: Number(form.timeLimit) > 0 ? Number(form.timeLimit) : null,
      maxAttempts: Number(form.maxAttempts)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setForm({ title: "", instructions: "", passingScore: "70", timeLimit: "0", maxAttempts: "3" });
      toast.success("Quiz created! Now add questions.");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create quiz"),
  });

  const updateMut = useMutation({
    mutationFn: (id: string) => updateQuiz(id, {
      title: form.title,
      instructions: form.instructions,
      passingScore: Number(form.passingScore),
      timeLimit: Number(form.timeLimit) > 0 ? Number(form.timeLimit) : null,
      maxAttempts: Number(form.maxAttempts)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setEditingSettingsId(null);
      setForm({ title: "", instructions: "", passingScore: "70", timeLimit: "0", maxAttempts: "3" });
      toast.success("Quiz settings updated");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update quiz"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Quiz deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingSettingsId) {
      updateMut.mutate(editingSettingsId);
    } else {
      createMut.mutate();
    }
  };

  const handleEditSettings = (quiz: any, lessonContent: string) => {
    setEditingSettingsId(quiz.id);
    setForm({
      title: quiz.title,
      instructions: lessonContent || "",
      passingScore: quiz.passingScore.toString(),
      timeLimit: quiz.timeLimit ? (quiz.timeLimit / 60).toString() : "0",
      maxAttempts: quiz.maxAttempts.toString()
    });
    setIsCreating(true);
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap", marginBottom: 28, width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Quizzes</h2>
          <p style={{ margin: 0, color: "#7F8E82", fontSize: 13, lineHeight: 1.4 }}>Test student comprehension with multiple choice questions.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => {
              setEditingSettingsId(null);
              setForm({ title: "", instructions: "", passingScore: "70", timeLimit: "", maxAttempts: "3" });
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
            <Plus size={16} /> <span style={{ whiteSpace: "nowrap" }}>Add Quiz</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "16px", border: "1px solid #E4E8E0", marginBottom: "32px", boxShadow: "0 4px 20px rgba(26,38,29,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>{editingSettingsId ? "Edit Quiz Settings" : "New Quiz Settings"}</h3>
            <button onClick={() => { setIsCreating(false); setEditingSettingsId(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Quiz Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Chapter 1 Quiz"
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Instructions / Description</label>
              <textarea 
                value={form.instructions}
                onChange={e => setForm({ ...form, instructions: e.target.value })}
                placeholder="Briefly describe what this quiz covers..."
                rows={2}
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Passing Score (%)</label>
                <input 
                  type="number" 
                  value={form.passingScore}
                  onChange={e => setForm({ ...form, passingScore: e.target.value })}
                  min="0" max="100"
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Time Limit (Mins)</label>
                <input 
                  type="number" 
                  value={form.timeLimit}
                  onChange={e => setForm({ ...form, timeLimit: e.target.value })}
                  min="0"
                  placeholder="0 for no limit"
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Max Attempts</label>
                <input 
                  type="number" 
                  value={form.maxAttempts}
                  onChange={e => setForm({ ...form, maxAttempts: e.target.value })}
                  min="1"
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid #E4E8E0" }}>
              <button 
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                style={{ padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}
              >
                {editingSettingsId ? (updateMut.isPending ? "Saving..." : "Save Changes") : (createMut.isPending ? "Creating..." : "Save Quiz Settings")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} /></div>
      ) : !quizzes || quizzes.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "16px", border: "1px dashed #E4E8E0" }}>
          <Award size={28} color="#A0AEC0" style={{ margin: "0 auto 16px auto" }} />
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No quizzes</h3>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Test student understanding with quizzes.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {quizzes.map((item: any) => {
            const quiz = item.quiz;
            if (!quiz) return null;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex", flexDirection: "column", gap: 14,
                  padding: "20px 22px", background: "#FFFFFF", borderRadius: 16,
                  border: "1px solid #E4E8E0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  width: "100%", boxSizing: "border-box",
                }}
              >
                {/* Top Row: Award Icon + Title & Top-Right Edit/Delete Action Icons */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: "1 1 180px", minWidth: 160 }}>
                    <GripVertical size={18} color="#7F8E82" style={{ cursor: "grab", flexShrink: 0, marginTop: 4 }} />
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, background: "rgba(184,134,69,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#B88645", flexShrink: 0, border: "1px solid rgba(184,134,69,0.2)"
                    }}>
                      <Award size={20} fill="currentColor" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 800, color: "#1A261D", wordBreak: "break-word", lineHeight: 1.3 }}>
                        {quiz.title}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7F8E82", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#3D7A4B", background: "rgba(61,122,75,0.1)", padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>
                          Pass: {quiz.passingScore}%
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                          <Clock size={13} /> {quiz.timeLimit ? `${quiz.timeLimit / 60} Mins` : "No Limit"}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#1976D2", fontWeight: 700, whiteSpace: "nowrap" }}>
                          <HelpCircle size={13} /> {quiz._count?.questions || 0} Questions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Action Icons (Edit Settings & Delete) */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: "auto" }}>
                    <button
                      onClick={() => handleEditSettings(quiz, item.content)}
                      title="Edit Settings"
                      style={{
                        width: 34, height: 34, background: "#F7F8F5", border: "1px solid #E4E8E0",
                        color: "#2D3A2F", cursor: "pointer", borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={async () => { if(await confirm("Delete quiz?")) deleteMut.mutate(quiz.id); }}
                      title="Delete Quiz"
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

                {/* Bottom Row: 2 Main Action Buttons (Flexible Stack/Grid) */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  width: "100%",
                  boxSizing: "border-box",
                }}>
                  <a
                    href={`/instructor/courses/${id}/quizzes`}
                    style={{
                      flex: "1 1 130px",
                      padding: "10px 16px", background: "#FFFFFF", border: "1px solid #B88645",
                      color: "#B88645", textDecoration: "none", borderRadius: 10, fontSize: 12,
                      fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center",
                      justifyContent: "center", gap: 6, whiteSpace: "nowrap", textAlign: "center",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)", boxSizing: "border-box",
                    }}
                  >
                    <List size={14} /> <span>View Attempts</span>
                  </a>

                  <button
                    onClick={() => setActiveQuizId(quiz.id)}
                    style={{
                      flex: "1 1 130px",
                      padding: "10px 16px", background: "linear-gradient(135deg, #B88645 0%, #A3763A 100%)",
                      border: "none", color: "#FFFFFF", borderRadius: 10, fontSize: 12,
                      fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap",
                      boxShadow: "0 3px 10px rgba(184,134,69,0.25)", textAlign: "center",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, boxSizing: "border-box",
                    }}
                  >
                    <Edit2 size={14} /> <span>Edit Questions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeQuizId && (
        <QuestionBuilderModal 
          quiz={quizzes.find((q: any) => q.quiz?.id === activeQuizId)?.quiz} 
          moduleId={module.id}
          onClose={() => setActiveQuizId(null)} 
        />
      )}
    </div>
  );
}
