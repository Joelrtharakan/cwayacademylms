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
      setOverview(curr.overview || course.description || "");
      try { setObjectives(JSON.parse(curr.objectives || "[]")); } catch (e) {}
      try { setWeeklyPlan(JSON.parse(curr.weeklyPlan || "[]")); } catch (e) {}
    } else if (curr === null) {
      setOverview(course.description || "");
    }
  }, [curr, course.description]);

  const updateMut = useMutation({
    mutationFn: (data: any) => api.put(`/courses/${course.id}/curriculum`, data).then(r => r.data.data),
    onSuccess: () => {
      toast.success("Description saved");
      onSave();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to save description"),
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
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>Course Description</h2>
      <p style={{ fontSize: "14px", color: "#8F9E93", marginBottom: "32px" }}>Provide a high-level overview of your course and its learning objectives.</p>

      {isLoading ? (
        <Loader2 className="animate-spin text-cway-gold" />
      ) : (
        <div style={{ display: "grid", gap: "32px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Course Overview</label>
            <textarea 
              value={overview} 
              onChange={e => {
                setOverview(e.target.value);
                e.target.style.height = 'inherit';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }} 
              rows={3} 
              data-lenis-prevent="true" 
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", resize: "none", overflowY: "auto", minHeight: "120px", maxHeight: "300px" }} 
              placeholder="Briefly describe what this course is about..." 
              ref={(el) => {
                if (el) {
                  el.style.height = 'inherit';
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
            />
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
        <button 
          onClick={() => updateMut.mutate({ overview, objectives, weeklyPlan })} 
          disabled={updateMut.isPending} 
          style={{ 
            padding: "12px 24px", 
            borderRadius: "8px", 
            background: updateMut.isPending ? "#E4E8E0" : "#C9973A", 
            color: updateMut.isPending ? "#8A9E8C" : "#FFFFFF", 
            fontWeight: 700, 
            border: "none", 
            cursor: updateMut.isPending ? "not-allowed" : "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { if (!updateMut.isPending) e.currentTarget.style.background = "#E8B85A"; }}
          onMouseLeave={(e) => { if (!updateMut.isPending) e.currentTarget.style.background = "#C9973A"; }}
        >
          {updateMut.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Description
        </button>
      </div>
    </div>
  );
}
