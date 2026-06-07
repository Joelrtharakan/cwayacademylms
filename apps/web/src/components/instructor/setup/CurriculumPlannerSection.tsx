"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";

export default function CurriculumPlannerSection({ course, onSave }: { course: any, onSave: () => void }) {
  const [overview, setOverview] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<{week: number, topic: string}[]>([]);

  const { data: curr, isLoading } = useQuery({
    queryKey: ["curriculum", course.id],
    queryFn: () => api.get(`/courses/${course.id}/curriculum`).then(r => r.data.data),
  });

  useEffect(() => {
    if (curr) {
      setOverview(curr.overview || "");
      try { setObjectives(JSON.parse(curr.objectives || "[]")); } catch (e) {}
      try { setWeeklyPlan(JSON.parse(curr.weeklyPlan || "[]")); } catch (e) {}
    }
  }, [curr]);

  const updateMut = useMutation({
    mutationFn: (data: any) => api.put(`/courses/${course.id}/curriculum`, data).then(r => r.data.data),
    onSuccess: () => {
      toast.success("Curriculum saved");
      onSave();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to save curriculum"),
  });

  const addObjective = () => setObjectives([...objectives, ""]);
  const updateObjective = (idx: number, val: string) => {
    const arr = [...objectives];
    arr[idx] = val;
    setObjectives(arr);
  };
  const removeObjective = (idx: number) => setObjectives(objectives.filter((_, i) => i !== idx));

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>Curriculum Planner</h2>
      <p style={{ fontSize: "14px", color: "#8F9E93", marginBottom: "32px" }}>Plan your course structure at a high level before building the actual modules.</p>

      {isLoading ? (
        <Loader2 className="animate-spin text-cway-gold" />
      ) : (
        <div style={{ display: "grid", gap: "32px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Course Overview</label>
            <textarea value={overview} onChange={e => setOverview(e.target.value)} rows={4} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", resize: "vertical" }} placeholder="Briefly describe what this course is about..." />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Learning Objectives</label>
            {objectives.map((obj, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input type="text" value={obj} onChange={e => updateObjective(idx, e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }} placeholder="By the end of this course, students will be able to..." />
                <button onClick={() => removeObjective(idx)} style={{ background: "rgba(229,62,62,0.1)", color: "#E53E3E", border: "none", borderRadius: "8px", padding: "0 16px", cursor: "pointer" }}><Trash2 size={18} /></button>
              </div>
            ))}
            <button onClick={addObjective} style={{ background: "transparent", color: "#B88645", border: "1px dashed #B88645", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={16} /> Add Objective
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => updateMut.mutate({ overview, objectives, weeklyPlan })} disabled={updateMut.isPending} style={{ padding: "12px 24px", borderRadius: "8px", background: "#FFFFFF", color: "#1A261D", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          {updateMut.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Curriculum
        </button>
      </div>
    </div>
  );
}
