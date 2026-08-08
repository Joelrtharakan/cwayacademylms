"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Megaphone, Loader2, Send, X, Calendar, Bell } from "lucide-react";
import { Link } from "@/i18n/routing";
import { toast } from "react-hot-toast";
import { getInstructorAnnouncements, createAnnouncement, deleteAnnouncement } from "@/lib/api/instructor";
import { api } from "@/store/auth.store";
import { useConfirm } from "@/components/shared/ConfirmContext";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  dark: "#1A261D",
  muted: "#7F8E82",
  border: "#EBEEE8",
};

export default function CourseAnnouncementsPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data),
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements", id],
    queryFn: () => getInstructorAnnouncements(id),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => createAnnouncement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements", id] });
      setIsCreating(false);
      setForm({ title: "", content: "" });
      toast.success("Announcement published successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to post announcement"),
  });

  const deleteMut = useMutation({
    mutationFn: (annId: string) => deleteAnnouncement(id, annId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements", id] });
      toast.success("Announcement deleted");
    },
    onError: () => toast.error("Failed to delete announcement"),
  });

  const getCourseTitle = () => {
    if (!course?.title) return "Untitled Course";
    if (typeof course.title === "string") return course.title;
    return course.title.en || course.title.hi || Object.values(course.title)[0] || "Untitled Course";
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: C.gold }} />
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", maxWidth: 1150, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 64, boxSizing: "border-box",
    }}>
      {/* ── TOP HEADER CARD ── */}
      <div style={{
        background: "#FFFFFF",
        borderTop: `1px solid ${C.border}`,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.gold}`,
        borderRadius: 20,
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Link
            href={`/instructor/courses/${id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 10,
              background: "#F7F8F5", color: "#2D3A2F",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Course</span>
          </Link>

          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "5px 14px", borderRadius: 20,
            background: C.goldLight, color: C.gold, border: `1px solid rgba(184,134,69,0.25)`,
          }}>
            Course Announcements
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: C.goldLight, color: C.gold,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Bell size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.dark, fontFamily: "Georgia, serif" }}>
                Course Announcements
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
                {getCourseTitle()} — Broadcast updates to all enrolled students.
              </p>
            </div>
          </div>

          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 22px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
                color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(184,134,69,0.25)", transition: "all 0.2s",
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              <Plus size={18} /> New Announcement
            </button>
          )}
        </div>
      </div>

      {/* ── COMPOSE ANNOUNCEMENT FORM ── */}
      {isCreating && (
        <div style={{
          background: "#FFFFFF", padding: "28px", borderRadius: 20,
          border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(26,38,29,0.04)",
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.dark }}>
              Compose New Announcement
            </h3>
            <button
              onClick={() => { setIsCreating(false); setForm({ title: "", content: "" }); }}
              style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                Subject / Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Welcome to Week 2 & Live Q&A Schedule"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: "#F7F8F5",
                  fontSize: 14, color: C.dark, boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                Announcement Message
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement details here..."
                rows={5}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: "#F7F8F5",
                  fontSize: 14, color: C.dark, resize: "vertical", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <button
                onClick={() => createMut.mutate(form)}
                disabled={!form.title.trim() || !form.content.trim() || createMut.isPending}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 24px", borderRadius: 10, border: "none",
                  background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
                  color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: (!form.title.trim() || !form.content.trim()) ? "not-allowed" : "pointer",
                  opacity: (!form.title.trim() || !form.content.trim() || createMut.isPending) ? 0.6 : 1,
                  boxShadow: "0 2px 8px rgba(184,134,69,0.2)",
                }}
              >
                <Send size={15} />
                <span>{createMut.isPending ? "Publishing..." : "Publish Announcement"}</span>
              </button>

              <button
                onClick={() => { setIsCreating(false); setForm({ title: "", content: "" }); }}
                style={{
                  padding: "11px 20px", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: "#F7F8F5",
                  color: C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ANNOUNCEMENTS FEED LIST ── */}
      {announcements?.length === 0 && !isCreating ? (
        <div style={{
          background: "#FFFFFF", padding: "60px 24px", textAlign: "center",
          borderRadius: 20, border: `1px dashed ${C.border}`,
        }}>
          <div style={{
            width: 56, height: 56, background: C.goldLight, color: C.gold,
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Megaphone size={26} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>No Announcements Posted</h3>
          <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>You haven't published any announcements for this course yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {announcements?.map((ann: any) => (
            <div
              key={ann.id}
              style={{
                background: "#FFFFFF", borderRadius: 20,
                border: `1px solid ${C.border}`, padding: "24px 28px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                display: "flex", flexDirection: "column", gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: C.goldLight, color: C.gold,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.dark }}>{ann.title}</h3>
                    <div style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <Calendar size={13} />
                      <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (await confirm("Are you sure you want to delete this announcement?")) {
                      deleteMut.mutate(ann.id);
                    }
                  }}
                  title="Delete Announcement"
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: "rgba(229,62,62,0.06)", border: "1px solid rgba(229,62,62,0.2)",
                    color: "#E53E3E", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{
                fontSize: 14, color: C.dark, lineHeight: 1.6,
                whiteSpace: "pre-wrap", background: "#F7F8F5",
                padding: "16px 20px", borderRadius: 14, border: `1px solid ${C.border}`,
              }}>
                {ann.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
