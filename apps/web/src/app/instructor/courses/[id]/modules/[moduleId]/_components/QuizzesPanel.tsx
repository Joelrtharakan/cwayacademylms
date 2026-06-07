import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuiz, getQuizzes, deleteQuiz } from "@/lib/api/modules";
import { Award, Plus, X, Edit2, Trash2, GripVertical, Clock, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import QuestionBuilderModal from "./QuestionBuilderModal";

export default function QuizzesPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", instructions: "", passingScore: 70, timeLimit: 0, maxAttempts: 3 });

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes", module.id],
    queryFn: () => getQuizzes(module.id),
  });

  const createMut = useMutation({
    mutationFn: () => createQuiz(module.id, {
      title: form.title,
      instructions: form.instructions,
      passingScore: Number(form.passingScore),
      timeLimit: form.timeLimit > 0 ? Number(form.timeLimit) : null,
      maxAttempts: Number(form.maxAttempts)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setForm({ title: "", instructions: "", passingScore: 70, timeLimit: 0, maxAttempts: 3 });
      toast.success("Quiz created! Now add questions.");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create quiz"),
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
    createMut.mutate();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Quizzes</h2>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Build multiple choice quizzes to test comprehension.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
          >
            <Plus size={16} /> Add Quiz
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "32px", boxShadow: "0 10px 30px rgba(26,38,29,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>New Quiz Settings</h3>
            <button onClick={() => setIsCreating(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={20} /></button>
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
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Instructions / Description</label>
              <textarea 
                value={form.instructions}
                onChange={e => setForm({ ...form, instructions: e.target.value })}
                placeholder="Briefly describe what this quiz covers..."
                rows={2}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Passing Score (%)</label>
                <input 
                  type="number" 
                  value={form.passingScore}
                  onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })}
                  min="0" max="100"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Time Limit (Mins)</label>
                <input 
                  type="number" 
                  value={form.timeLimit}
                  onChange={e => setForm({ ...form, timeLimit: Number(e.target.value) })}
                  min="0"
                  placeholder="0 for no limit"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Max Attempts</label>
                <input 
                  type="number" 
                  value={form.maxAttempts}
                  onChange={e => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                  min="1"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid #E4E8E0" }}>
              <button 
                type="submit"
                disabled={createMut.isPending}
                style={{ padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: createMut.isPending ? 0.7 : 1 }}
              >
                {createMut.isPending ? "Creating..." : "Save Quiz Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {!quizzes || quizzes.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
          <Award size={28} color="#A0AEC0" style={{ margin: "0 auto 16px auto" }} />
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No quizzes</h3>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Test student understanding with quizzes.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {quizzes.map((item: any) => {
            const quiz = item.quiz;
            if (!quiz) return null;
            return (
              <div key={item.id} style={{ padding: "16px", background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4E8E0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <GripVertical size={18} color="#A0AEC0" style={{ cursor: "grab" }} />
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645" }}>
                    <Award size={18} fill="currentColor" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 600, color: "#1A261D" }}>{quiz.title}</h4>
                    <div style={{ fontSize: "12px", color: "#8F9E93", display: "flex", gap: "16px" }}>
                      <span style={{ fontWeight: 600, color: "#2ECC71" }}>Pass: {quiz.passingScore}%</span>
                      {quiz.timeLimit ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {quiz.timeLimit / 60} Mins</span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> No Time Limit</span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#4299E1" }}><HelpCircle size={12} /> {quiz._count?.questions || 0} Questions</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setActiveQuizId(quiz.id)} style={{ padding: "6px 12px", background: "#B88645", border: "none", color: "#FFFFFF", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Edit Questions</button>
                    <button onClick={() => { if(confirm("Delete quiz?")) deleteMut.mutate(quiz.id); }} style={{ width: "28px", height: "28px", background: "transparent", border: "none", color: "#E53E3E", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(229,62,62,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <Trash2 size={14} />
                    </button>
                  </div>
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
