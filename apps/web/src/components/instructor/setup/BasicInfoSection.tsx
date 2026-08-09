"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function BasicInfoSection({ course, onSave }: { course: any, onSave: () => void }) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    title: course.title || "",
    courseCode: course.courseCode || "",
    subtitle: course.subtitle || "",
    categoryId: course.categoryId || "",
    language: course.language || "ENGLISH",
    level: course.level || "BEGINNER",
    price: course.price || 0,
    currency: course.currency || "INR",
    isFree: course.isFree,
    welcomeMessage: course.welcomeMessage || "",
    congratsMessage: course.congratsMessage || "",
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => api.put(`/courses/${course.id}`, data).then((r) => r.data.data),
    onSuccess: (updatedCourse) => {
      toast.success("Basic Info saved");
      qc.setQueryData(["course", course.id], updatedCourse);
      onSave();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px 28px", border: "1px solid #E4E8E0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 800, color: "#1A261D", margin: "0 0 20px 0" }}>Basic Information</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, width: "100%", boxSizing: "border-box" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Course Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E8E0", fontSize: 14, outline: "none", color: "#1A261D" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Course Code</label>
            <input type="text" value={formData.courseCode} onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E8E0", fontSize: 14, outline: "none", color: "#1A261D" }} placeholder="e.g. CWA101" />
          </div>
        </div>
        
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Subtitle</label>
          <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E8E0", fontSize: 14, outline: "none", color: "#1A261D" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, width: "100%", boxSizing: "border-box" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Category</label>
            <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E8E0", fontSize: 14, outline: "none", color: "#1A261D", background: "#FFFFFF" }}>
              <option value="">Select category...</option>
              {catData?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Level</label>
            <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E8E0", fontSize: 14, outline: "none", color: "#1A261D", background: "#FFFFFF" }}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, width: "100%", boxSizing: "border-box" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Pricing</label>
            <div style={{ display: "flex", gap: 16, alignItems: "center", minHeight: 44 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#1A261D" }}>
                <input type="radio" checked={formData.isFree} onChange={() => setFormData({ ...formData, isFree: true, price: 0 })} /> Free
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#1A261D" }}>
                <input type="radio" checked={!formData.isFree} onChange={() => setFormData({ ...formData, isFree: false })} /> Paid
              </label>
            </div>
            {!formData.isFree && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} style={{ padding: "12px", borderRadius: 10, border: "1px solid #E4E8E0", width: 100, fontSize: 14 }}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value === "" ? "" : Number(e.target.value) })} style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E8E0", fontSize: 14 }} />
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#7F8E82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Language</label>
            <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #E4E8E0", fontSize: 14, outline: "none", color: "#1A261D", background: "#FFFFFF" }}>
              {["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MALAYALAM"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

      </div>

      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
        <button 
          onClick={() => updateMut.mutate(formData)} 
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
          {updateMut.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
        </button>
      </div>
    </div>
  );
}
