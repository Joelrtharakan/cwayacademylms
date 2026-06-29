"use client";

import React, { useState } from "react";
import { X, Loader2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstructors, assignInstructorToCourse } from "@/lib/api/registrar";
import { toast } from "sonner";

interface AssignInstructorModalProps {
  open: boolean;
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignInstructorModal({
  open,
  courseId,
  courseTitle,
  onClose,
  onSuccess,
}: AssignInstructorModalProps) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: getInstructors,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => assignInstructorToCourse(courseId, { instructorId: selectedId, adminNote: note }),
    onSuccess: () => {
      toast.success("Invitation sent to instructor");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", courseId] });
      onSuccess?.();
      onClose();
      setSelectedId("");
      setNote("");
      setDropdownOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to send invitation"),
  });

  if (!open) return null;

  const selectedInstructor = (instructors as any[]).find((i: any) => i.id === selectedId);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    paddingTop: "12px",
    paddingRight: "16px",
    paddingBottom: "12px",
    paddingLeft: "16px",
    background: "#F9FAFC",
    border: "1px solid #E4E8E0",
    borderRadius: 12,
    fontSize: 14,
    color: "#1C2B1E",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
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
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #EEF0EA", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
              Assign Instructor
            </h2>
            <p style={{ fontSize: 13, color: "#8A9E8C", margin: "4px 0 0 0", maxWidth: 340 }}>
              Sending invitation for: <strong style={{ color: "#1C2B1E" }}>{courseTitle}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F5F0E8", color: "#8A9E8C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", flex: 1, display: "flex", flexDirection: "column", gap: 20, minHeight: 0 }}>
          {/* Dropdown */}
          <div style={{ position: "relative" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Select Instructor
            </label>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "14px 16px" }}
            >
              {selectedInstructor ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E4E8E0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {selectedInstructor.avatar ? <img src={selectedInstructor.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 10, fontWeight: 700, color: "#8A9E8C" }}>{selectedInstructor.name?.[0] || "I"}</span>}
                  </div>
                  <span style={{ fontWeight: 600, color: "#1C2B1E", fontSize: 14 }}>{selectedInstructor.name}</span>
                </div>
              ) : (
                <span style={{ color: "#8A9E8C", fontSize: 14 }}>Select an instructor...</span>
              )}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <path d="M1 1.5L6 6.5L11 1.5" stroke="#8A9E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {dropdownOpen && (
              <div data-lenis-prevent="true" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8, background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: 12, boxShadow: "0 8px 32px rgba(28,43,30,0.12)", zIndex: 10, maxHeight: 240, overflowY: "auto" }}>
                {isLoading ? (
                  <div style={{ padding: 16, textAlign: "center", color: "#8A9E8C" }}>Loading...</div>
                ) : (instructors as any[]).length === 0 ? (
                  <div style={{ padding: 16, textAlign: "center", color: "#8A9E8C" }}>No instructors found</div>
                ) : (
                  (instructors as any[]).map((inst: any) => (
                    <div
                      key={inst.id}
                      onClick={() => { setSelectedId(inst.id); setDropdownOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        cursor: "pointer",
                        background: selectedId === inst.id ? "#FDFBF7" : "transparent",
                        borderBottom: "1px solid #EEF0EA",
                        transition: "background 0.2s ease"
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E4E8E0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {inst.avatar ? <img src={inst.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 14, fontWeight: 700, color: "#8A9E8C" }}>{inst.name?.[0] || "I"}</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1C2B1E" }}>{inst.name}</div>
                        <div style={{ fontSize: 12, color: "#8A9E8C" }}>{inst.email} · {inst.publishedCourses || 0} courses</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Admin note */}
          <div style={{ flexShrink: 0 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Note to Instructor (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any context or instructions for the instructor..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid #EEF0EA", display: "flex", gap: 12, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #D4D9CE", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#8A9E8C", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!selectedId || mutation.isPending}
            style={{
              flex: 2, padding: "12px",
              background: selectedId ? "#C9973A" : "#E4E8E0",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              color: selectedId ? "#FFFFFF" : "#8A9E8C",
              cursor: selectedId ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.2s",
            }}
          >
            {mutation.isPending ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</> : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
