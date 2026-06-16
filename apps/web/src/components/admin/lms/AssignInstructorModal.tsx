"use client";

import React, { useState } from "react";
import { X, Loader2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstructors, assignInstructorToCourse } from "@/lib/api/admin";
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
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");

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
      setSearch("");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to send invitation"),
  });

  if (!open) return null;

  const filtered = (instructors as any[]).filter((i: any) =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "#FFFFFF",
    border: "1px solid #D4D9CE",
    borderRadius: 10,
    fontSize: 14,
    color: "#1C2B1E",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
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

        {/* Scrollable body */}
        <div style={{ padding: "20px 28px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A9E8C" }} />
            <input
              type="text"
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
              onFocus={(e) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Instructor list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} style={{ height: 56, background: "#F5F0E8", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
              ))
            ) : filtered.length === 0 ? (
              <p style={{ fontSize: 13, color: "#8A9E8C", textAlign: "center", padding: "20px 0" }}>No instructors found</p>
            ) : (
              filtered.map((inst: any) => (
                <div
                  key={inst.id}
                  onClick={() => setSelectedId(inst.id === selectedId ? "" : inst.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${selectedId === inst.id ? "#C9973A" : "#E4E8E0"}`,
                    background: selectedId === inst.id ? "rgba(201,151,58,0.06)" : "#FAFAF8",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: selectedId === inst.id ? "rgba(201,151,58,0.2)" : "#E4E8E0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: selectedId === inst.id ? "#C9973A" : "#8A9E8C",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {inst.avatar ? (
                      <img src={inst.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      inst.name?.[0] || "I"
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1C2B1E", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {inst.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#8A9E8C", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {inst.email} · {inst.publishedCourses || 0} courses
                    </p>
                  </div>
                  {selectedId === inst.id && (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#C9973A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Admin note */}
          <div>
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
