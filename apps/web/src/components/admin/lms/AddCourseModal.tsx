"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/lib/api/admin";

interface AddCourseModalProps {
  open: boolean;
  programId: string;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; price: number; courseCode: string }) => Promise<void>;
  onDuplicate?: (courseId: string) => Promise<void>;
}

export function AddCourseModal({ open, programId, onClose, onSubmit, onDuplicate }: AddCourseModalProps) {
  const [mode, setMode] = useState<"NEW" | "EXISTING">("NEW");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [form, setForm] = useState({ title: "", courseCode: "", description: "", price: "" });
  const [loading, setLoading] = useState(false);

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses-list"],
    queryFn: () => getCourses(),
    enabled: mode === "EXISTING"
  });
  const courses = coursesData?.courses || coursesData || [];

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "NEW") {
        if (!form.title.trim()) return;
        await onSubmit({
          title: form.title,
          courseCode: form.courseCode,
          description: form.description,
          price: form.price ? parseFloat(form.price) : 0,
        });
        setForm({ title: "", courseCode: "", description: "", price: "" });
      } else {
        if (!selectedCourseId) return;
        await onDuplicate?.(selectedCourseId);
        setSelectedCourseId("");
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    background: "#FFFFFF",
    border: "1px solid #D4D9CE",
    borderRadius: 10,
    fontSize: 14,
    color: "#1C2B1E",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#8A9E8C",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,43,30,0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(28,43,30,0.2)",
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #EEF0EA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
              Add Course to Program
            </h2>
            <p style={{ fontSize: 13, color: "#8A9E8C", margin: "4px 0 0 0" }}>
              Create a new course under this program
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F5F0E8", color: "#8A9E8C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #EEF0EA", padding: "0 28px" }}>
          <button
            type="button"
            onClick={() => setMode("NEW")}
            style={{
              padding: "16px 20px", background: "transparent", border: "none", borderBottom: mode === "NEW" ? "2px solid #C9973A" : "2px solid transparent",
              color: mode === "NEW" ? "#C9973A" : "#8A9E8C", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
          >
            Create New
          </button>
          <button
            type="button"
            onClick={() => setMode("EXISTING")}
            style={{
              padding: "16px 20px", background: "transparent", border: "none", borderBottom: mode === "EXISTING" ? "2px solid #C9973A" : "2px solid transparent",
              color: mode === "EXISTING" ? "#C9973A" : "#8A9E8C", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
          >
            From Existing
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          {mode === "NEW" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Course Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Week 1: Introduction to the Gospel"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
                  required={mode === "NEW"}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Course Code</label>
                <input
                  type="text"
                  value={form.courseCode}
                  onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                  placeholder="e.g. CWA101"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Briefly describe this course..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", overflowY: "auto", overscrollBehavior: "contain" }}
                  onWheel={(e) => e.stopPropagation()}
                  onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0 for free"
                  min="0"
                  step="1"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Select Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ ...inputStyle, appearance: "none" }}
                  required={mode === "EXISTING"}
                >
                  <option value="" disabled>Select an existing course to duplicate</option>
                  {isLoadingCourses ? (
                    <option disabled>Loading courses...</option>
                  ) : (
                    courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))
                  )}
                </select>
                <p style={{ fontSize: 12, color: "#8A9E8C", marginTop: 8 }}>
                  This will create a copy of the selected course, including all its sections, lessons, and quizzes, directly in this program.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #D4D9CE", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#8A9E8C", cursor: "pointer" }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={(mode === "NEW" && !form.title.trim()) || (mode === "EXISTING" && !selectedCourseId) || loading}
              style={{
                flex: 2, padding: "12px",
                background: ((mode === "NEW" && form.title.trim()) || (mode === "EXISTING" && selectedCourseId)) ? "#C9973A" : "#E4E8E0",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
                color: ((mode === "NEW" && form.title.trim()) || (mode === "EXISTING" && selectedCourseId)) ? "#FFFFFF" : "#8A9E8C",
                cursor: ((mode === "NEW" && form.title.trim()) || (mode === "EXISTING" && selectedCourseId)) ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
              }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {mode === "NEW" ? "Creating..." : "Duplicating..."}</> : mode === "NEW" ? "Add Course" : "Duplicate Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
