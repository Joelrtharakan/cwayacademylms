"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function BasicInfoSection({ course, onSave }: { course: any, onSave: () => void }) {
  const [formData, setFormData] = useState({
    title: course.title || "",
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
    onSuccess: () => {
      toast.success("Basic Info saved");
      onSave();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0" }}>Basic Information</h2>
      
      <div style={{ display: "grid", gap: "24px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Course Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }} />
        </div>
        
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Subtitle</label>
          <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Category</label>
            <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <option value="">Select category...</option>
              {catData?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Level</label>
            <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Pricing</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="radio" checked={formData.isFree} onChange={() => setFormData({ ...formData, isFree: true, price: 0 })} /> Free
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="radio" checked={!formData.isFree} onChange={() => setFormData({ ...formData, isFree: false })} /> Paid
              </label>
            </div>
            {!formData.isFree && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", width: "100px" }}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }} />
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", marginBottom: "8px" }}>Language</label>
            <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              {["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MALAYALAM"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

      </div>

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => updateMut.mutate(formData)} disabled={updateMut.isPending} style={{ padding: "12px 24px", borderRadius: "8px", background: "#FFFFFF", color: "#1A261D", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          {updateMut.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
        </button>
      </div>
    </div>
  );
}
