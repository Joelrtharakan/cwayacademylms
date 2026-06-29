"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface CreateProgramModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; duration: string }) => Promise<void>;
}

export function CreateProgramModal({ open, onClose, onSubmit }: CreateProgramModalProps) {
  const [form, setForm] = useState({ title: "", description: "", duration: "" });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({ title: "", description: "", duration: "" });
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
          maxWidth: 520,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #EEF0EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
              Create New Program
            </h2>
            <p style={{ fontSize: 13, color: "#8A9E8C", margin: "4px 0 0 0" }}>
              Programs group related courses into a structured learning path
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              background: "#F5F0E8",
              color: "#8A9E8C",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Program Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Foundations of Christian Theology"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the program's learning outcomes and goals..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", overflowY: "auto", overscrollBehavior: "contain" }}
                onWheel={(e) => e.stopPropagation()}
                onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 6 months · 4 courses"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "transparent",
                border: "1px solid #D4D9CE",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: "#8A9E8C",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || loading}
              style={{
                flex: 2,
                padding: "12px",
                background: form.title.trim() ? "#C9973A" : "#E4E8E0",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                color: form.title.trim() ? "#FFFFFF" : "#8A9E8C",
                cursor: form.title.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s",
              }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : "Create Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
