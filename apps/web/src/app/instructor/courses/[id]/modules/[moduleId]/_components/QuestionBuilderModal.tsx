"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuestion, updateQuestion, deleteQuestion } from "@/lib/api/modules";
import { X, Plus, Trash2, CheckCircle2, GripVertical, Save, Edit2 } from "lucide-react";
import { toast } from "react-hot-toast";

type Answer = { id?: string; text: string; isCorrect: boolean };
type Question = {
  id?: string;
  text: string;
  type: string;
  points: number;
  order: number;
  answers: Answer[];
};

export default function QuestionBuilderModal({ quiz, moduleId, onClose }: { quiz: any; moduleId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Question>({ text: "", type: "MCQ", points: 1, order: 0, answers: [{ text: "", isCorrect: true }] });

  // Load existing questions
  useEffect(() => {
    if (quiz.questions) {
      setQuestions(quiz.questions);
    }
  }, [quiz]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const contentArea = document.getElementById("module-content-area");
    if (contentArea) contentArea.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
      if (contentArea) contentArea.style.overflow = "auto";
    };
  }, []);

  const handleSave = async () => {
    if (!form.text?.trim()) return toast.error("Question text is required");
    if (!form.answers || form.answers.length < 2) return toast.error("At least 2 options are required");
    if (!form.answers.some(a => a.isCorrect)) return toast.error("At least one option must be correct");
    if (form.answers.some(a => !a.text?.trim())) return toast.error("All options must have text");

    try {
      if (editingId && editingId !== "new") {
        toast.loading("Updating question...", { id: "saveQuestion" });
        const updatedQuestion = await updateQuestion(editingId, form);
        queryClient.invalidateQueries({ queryKey: ["quizzes", moduleId] });
        setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        toast.success("Question updated!", { id: "saveQuestion" });
      } else {
        toast.loading("Creating question...", { id: "saveQuestion" });
        if (!quiz || !quiz.id) throw new Error("Quiz ID is missing! Cannot save.");
        const newQuestion = await createQuestion(quiz.id, form);
        queryClient.invalidateQueries({ queryKey: ["quizzes", moduleId] });
        setQuestions(prev => [...(prev || []), newQuestion]);
        toast.success("Question created!", { id: "saveQuestion" });
      }
      setEditingId(null);
      resetForm();
    } catch (e: any) {
      // Intentionally removing console.error so Next.js overlay doesn't block the toast message
      const errorMsg = e.response?.data?.message || e.message || "Failed to save question";
      toast.error(`Error: ${errorMsg}`, { id: "saveQuestion", duration: 8000 });
    }
  };

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", moduleId] });
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Question deleted!");
    }
  });

  const resetForm = () => {
    setForm({ text: "", type: "MCQ", points: 1, order: questions.length, answers: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] });
  };

  const handleEdit = (q: any) => {
    setEditingId(q.id);
    setForm({
      text: q.text,
      type: q.type,
      points: q.points,
      order: q.order,
      answers: q.answers?.length ? q.answers : [{ text: "", isCorrect: true }]
    });
  };


  const addOption = () => setForm({ ...form, answers: [...form.answers, { text: "", isCorrect: false }] });
  
  const removeOption = (idx: number) => {
    const newAnswers = [...form.answers];
    newAnswers.splice(idx, 1);
    setForm({ ...form, answers: newAnswers });
  };

  const updateOption = (idx: number, field: string, value: any) => {
    const newAnswers = [...form.answers];
    if (field === 'isCorrect') {
      // For MCQ (single correct), uncheck others if this is checked
      if (value === true) {
        newAnswers.forEach(a => a.isCorrect = false);
      }
    }
    newAnswers[idx] = { ...newAnswers[idx], [field]: value };
    setForm({ ...form, answers: newAnswers });
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(26,38,29,0.8)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }} onWheel={(e) => e.stopPropagation()}>
      <div style={{ width: "100%", maxWidth: "700px", background: "#F7F8F5", maxHeight: "90vh", minHeight: 0, borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ padding: "24px", background: "#FFFFFF", borderBottom: "1px solid #E4E8E0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Question Builder</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#8F9E93" }}>{quiz.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={24} /></button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          
          {editingId ? (
            <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", boxShadow: "0 4px 12px rgba(26,38,29,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{editingId === "new" ? "New Question" : "Edit Question"}</h3>
                <button onClick={() => setEditingId(null)} style={{ background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "8px" }}>Question Text</label>
                <textarea 
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", minHeight: "80px", resize: "vertical", fontFamily: "inherit", fontSize: "14px" }}
                  placeholder="e.g. What is the primary theme of the Gospel of John?"
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "8px" }}>Points</label>
                <input 
                  type="number" 
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                  style={{ width: "100px", padding: "10px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px" }}
                  min={1}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#8F9E93" }}>Answers Options</label>
                  <span style={{ fontSize: "12px", color: "#8F9E93" }}>Select the correct answer</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {form.answers.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: opt.isCorrect ? "rgba(46,204,113,0.05)" : "#F7F8F5", border: `1px solid ${opt.isCorrect ? "#2ECC71" : "#E4E8E0"}`, borderRadius: "8px" }}>
                      <input 
                        type="radio" 
                        name="correct-answer"
                        checked={opt.isCorrect} 
                        onChange={(e) => updateOption(idx, "isCorrect", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "#2ECC71", cursor: "pointer" }}
                      />
                      <input 
                        type="text" 
                        value={opt.text}
                        onChange={(e) => updateOption(idx, "text", e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px" }}
                      />
                      <button onClick={() => removeOption(idx)} style={{ background: "transparent", border: "none", color: "#E53E3E", cursor: "pointer", display: "flex", padding: "4px" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={addOption} style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", color: "#B88645", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                  <Plus size={14} /> Add Option
                </button>
              </div>

              <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
                <button 
                  onClick={handleSave} 
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
                >
                  <Save size={16} /> Save Question
                </button>
              </div>

            </div>
          ) : (
            <>
              {questions.length === 0 ? (
                <div style={{ padding: "60px 40px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No questions yet</h3>
                  <p style={{ margin: "0 0 24px 0", color: "#8F9E93", fontSize: "14px" }}>Start building your quiz by adding your first question.</p>
                  <button onClick={() => { resetForm(); setEditingId("new"); }} style={{ padding: "10px 20px", background: "#1A261D", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                    Create First Question
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {questions.map((q, idx) => (
                    <div key={q.id} style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4E8E0", padding: "20px" }}>
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ width: "24px", height: "24px", background: "rgba(184,134,69,0.1)", color: "#B88645", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: 600, color: "#1A261D", lineHeight: 1.4 }}>{q.text}</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {q.answers?.map((a: any, i: number) => (
                              <div key={a.id || i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: a.isCorrect ? "#1A261D" : "#8F9E93", fontWeight: a.isCorrect ? 600 : 400 }}>
                                {a.isCorrect ? <CheckCircle2 size={16} color="#2ECC71" /> : <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid #E4E8E0" }} />}
                                {a.text}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleEdit(q)} style={{ width: "32px", height: "32px", background: "transparent", border: "1px solid #E4E8E0", color: "#8F9E93", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "#F7F8F5"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => { if(confirm("Delete question?")) deleteMut.mutate(q.id!); }} style={{ width: "32px", height: "32px", background: "transparent", border: "1px solid #E4E8E0", color: "#E53E3E", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(229,62,62,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button onClick={() => { resetForm(); setEditingId("new"); }} style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "16px", background: "rgba(184,134,69,0.05)", border: "1px dashed #B88645", color: "#B88645", borderRadius: "12px", fontWeight: 600, cursor: "pointer", fontSize: "14px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(184,134,69,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(184,134,69,0.05)"}>
                    <Plus size={18} /> Add Another Question
                  </button>

                  <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #E4E8E0", display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "12px 32px", background: "#1A261D", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={18} /> Save & Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
