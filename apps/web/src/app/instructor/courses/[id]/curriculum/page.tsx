"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { useConfirm } from "@/components/shared/ConfirmContext";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Loader2, BookOpen, Play, FileText,
  HelpCircle, ClipboardList, MessageSquare, Trash2, Edit2,
  ChevronDown, ChevronUp, GripVertical, Award, Save, Eye
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/shared/SkeletonLoader";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
  isFree?: boolean;
  duration?: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  weekNumber?: number;
  lessons: Lesson[];
  _count?: { lessons: number };
}

// ─── Content Type Config ─────────────────────────────────────────────────────

const CONTENT_TYPES = [
  { type: "VIDEO", label: "Video Lesson", icon: Play, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { type: "READING", label: "Reading Material", icon: FileText, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { type: "QUIZ", label: "Quiz", icon: HelpCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { type: "ASSIGNMENT", label: "Assignment", icon: ClipboardList, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  { type: "FORUM", label: "Discussion Forum", icon: MessageSquare, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
];

// ─── AddContentModal ────────────────────────────────────────────────────────

function AddContentModal({
  open,
  sectionId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  sectionId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"select" | "form">("select");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", duration: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setStep("select"); setSelectedType(null); setForm({ title: "", content: "", duration: "" }); }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedType) return;
    setLoading(true);
    try {
      await api.post(`/modules/${sectionId}/lessons`, {
        title: form.title,
        type: selectedType,
        content: form.content || null,
        duration: form.duration ? parseInt(form.duration) * 60 : 0,
      });
      toast.success("Content added successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add content");
    } finally {
      setLoading(false);
    }
  };

  const typeConfig = CONTENT_TYPES.find((t) => t.type === selectedType);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", background: "#FFFFFF",
    border: "1px solid #D4D9CE", borderRadius: 10,
    fontSize: 14, color: "#1C2B1E", outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const handleFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#C9973A"; e.target.style.boxShadow = "0 0 0 3px rgba(201,151,58,0.12)"; };
  const handleBlur = (e: React.FocusEvent<any>) => { e.target.style.borderColor = "#D4D9CE"; e.target.style.boxShadow = "none"; };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(28,43,30,0.6)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#FFFFFF", borderRadius: 20, boxShadow: "0 24px 80px rgba(28,43,30,0.2)", width: "100%", maxWidth: 520 }}>
        {/* Header */}
        <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid #EEF0EA" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
            {step === "select" ? "Choose Content Type" : `Add ${typeConfig?.label}`}
          </h2>
          <p style={{ fontSize: 13, color: "#8A9E8C", margin: "4px 0 0 0" }}>
            {step === "select" ? "What type of content do you want to add?" : "Fill in the details for this lesson"}
          </p>
        </div>

        {step === "select" ? (
          <div style={{ padding: "20px 26px 26px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CONTENT_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.type}
                    onClick={() => { setSelectedType(t.type); setStep("form"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                      background: "#FAFAF8", border: "1.5px solid #E4E8E0", borderRadius: 12,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.background = t.bg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.background = "#FAFAF8"; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} style={{ color: t.color }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1C2B1E" }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={onClose} style={{ width: "100%", marginTop: 16, padding: "10px", background: "transparent", border: "1px solid #D4D9CE", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#8A9E8C", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "20px 26px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
            {typeConfig && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: typeConfig.bg, borderRadius: 10, border: `1px solid ${typeConfig.color}30` }}>
                <typeConfig.icon size={16} style={{ color: typeConfig.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: typeConfig.color }}>{typeConfig.label}</span>
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Title *
              </label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={`e.g. ${typeConfig?.label} title...`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} required autoFocus />
            </div>
            {(selectedType === "VIDEO") && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Duration (minutes)
                </label>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 15" min="1" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
            )}
            {(selectedType === "READING" || selectedType === "ASSIGNMENT" || selectedType === "QUIZ" || selectedType === "FORUM") && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Description / Instructions
                </label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Describe what students should do or learn..." rows={3} style={{ ...inputStyle, resize: "vertical" }} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => setStep("select")} style={{ flex: 1, padding: "11px", background: "transparent", border: "1px solid #D4D9CE", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#8A9E8C", cursor: "pointer" }}>
                ← Back
              </button>
              <button type="submit" disabled={!form.title.trim() || loading} style={{ flex: 2, padding: "11px", background: form.title.trim() ? "#C9973A" : "#E4E8E0", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, color: form.title.trim() ? "#FFFFFF" : "#8A9E8C", cursor: form.title.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}>
                {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Adding...</> : "Add Content"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── LessonItem ─────────────────────────────────────────────────────────────

function LessonItem({ lesson, onDelete }: { lesson: Lesson; onDelete: (id: string) => void }) {
  const typeConf = CONTENT_TYPES.find((t) => t.type === lesson.type) || CONTENT_TYPES[0];
  const Icon = typeConf.icon;

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 10,
        background: "#FAFAF8", border: "1px solid #EEF0EA",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F0E8"; e.currentTarget.style.borderColor = "#E0D9CC"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#FAFAF8"; e.currentTarget.style.borderColor = "#EEF0EA"; }}
    >
      <GripVertical size={14} style={{ color: "#D4D9CE", flexShrink: 0, cursor: "grab" }} />
      <div style={{ width: 28, height: 28, borderRadius: 6, background: typeConf.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} style={{ color: typeConf.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1C2B1E", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {lesson.title}
        </p>
        <p style={{ fontSize: 11, color: "#8A9E8C", margin: "1px 0 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {typeConf.label}{lesson.duration ? ` · ${Math.round(lesson.duration / 60)} min` : ""}
        </p>
      </div>
      <button
        onClick={() => onDelete(lesson.id)}
        style={{ width: 26, height: 26, borderRadius: 6, background: "transparent", border: "none", color: "#8A9E8C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(140,58,58,0.1)"; e.currentTarget.style.color = "#8C3A3A"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8A9E8C"; }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── WeekCard ────────────────────────────────────────────────────────────────

function WeekCard({
  section,
  weekIndex,
  courseId,
  onRefresh,
}: {
  section: Section;
  weekIndex: number;
  courseId: string;
  onRefresh: () => void;
}) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [collapsed, setCollapsed] = useState(false);
  const [addModal, setAddModal] = useState(false);

  const deleteLessonMut = useMutation({
    mutationFn: (lessonId: string) => api.delete(`/lessons/${lessonId}`).then((r) => r.data),
    onSuccess: () => { onRefresh(); toast.success("Content removed"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to remove"),
  });

  const lessons: Lesson[] = section.lessons || [];

  return (
    <>
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #E8EAE4",
          boxShadow: "0 1px 4px rgba(28,43,30,0.04)",
          overflow: "hidden",
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Week header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            background: "#FAFAF8",
            borderBottom: collapsed ? "none" : "1px solid #EEF0EA",
            cursor: "pointer",
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "rgba(28,43,30,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1C2B1E" }}>{weekIndex + 1}</span>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>{section.title}</p>
              <p style={{ fontSize: 12, color: "#8A9E8C", margin: "2px 0 0 0" }}>
                {lessons.length > 0 ? `${lessons.length} item${lessons.length !== 1 ? "s" : ""}` : "No content yet"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {lessons.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#4A8C5C", background: "rgba(74,140,92,0.1)", padding: "3px 8px", borderRadius: 999 }}>
                {lessons.length} item{lessons.length !== 1 ? "s" : ""}
              </span>
            )}
            {collapsed ? <ChevronDown size={16} color="#8A9E8C" /> : <ChevronUp size={16} color="#8A9E8C" />}
          </div>
        </div>

        {/* Content area */}
        {!collapsed && (
          <div style={{ padding: "16px 20px" }}>
            {lessons.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#8A9E8C", margin: "0 0 12px" }}>
                  No content added to this week yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    onDelete={async (id) => { if (await confirm("Remove this content?")) deleteLessonMut.mutate(id); }}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setAddModal(true)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px", background: "transparent",
                  border: "1.5px dashed #D4D9CE", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, color: "#8A9E8C", cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9973A"; e.currentTarget.style.color = "#C9973A"; e.currentTarget.style.background = "rgba(201,151,58,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D4D9CE"; e.currentTarget.style.color = "#8A9E8C"; e.currentTarget.style.background = "transparent"; }}
              >
                <Plus size={15} /> Add Curriculum Item
              </button>
              
              <Link
                href={`/instructor/courses/${courseId}/modules/${section.id}`}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px", background: "#F7F8F5",
                  border: "1px solid #E4E8E0", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, color: "#4A5568", cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9973A"; e.currentTarget.style.color = "#1A261D"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.color = "#4A5568"; }}
              >
                Upload Media & Resources
              </Link>
            </div>
          </div>
        )}
      </div>

      <AddContentModal
        open={addModal}
        sectionId={section.id}
        onClose={() => setAddModal(false)}
        onSuccess={onRefresh}
      />
    </>
  );
}

// ─── Main Curriculum Builder Page ─────────────────────────────────────────────

export default function CurriculumBuilderPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // Fetch course + sections
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data),
  });

  const { data: sections, isLoading: sectionsLoading, refetch: refetchSections } = useQuery({
    queryKey: ["modules", id],
    queryFn: () => api.get(`/courses/${id}/modules`).then((r) => r.data.data),
  });

  const handleSubmitForReview = async () => {
    setPublishLoading(true);
    try {
      await api.post(`/courses/${id}/submit-review`);
      toast.success("Course submitted for admin review!");
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setPublishLoading(false);
    }
  };

  const totalItems = Array.isArray(sections) ? sections.reduce((sum: number, s: Section) => sum + (s.lessons?.length || 0), 0) : 0;
  const weeksFilled = Array.isArray(sections) ? sections.filter((s: Section) => (s.lessons?.length || 0) > 0).length : 0;

  const isLoading = courseLoading || sectionsLoading;

  if (isLoading) {
    return (
      <div style={{ display: "flex", gap: 28, maxWidth: 1200 }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: 32, marginBottom: 24 }}><Skeleton width={200} height={28} /></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ marginBottom: 16 }}><Skeleton height={80} borderRadius={16} /></div>
          ))}
        </div>
        <div style={{ width: 320 }}><Skeleton height={400} borderRadius={16} /></div>
      </div>
    );
  }

  const weeks: Section[] = Array.isArray(sections) ? [...sections].sort((a, b) => a.order - b.order) : [];

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Back nav */}
      <Link
        href={`/instructor/courses/${id}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8A9E8C", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 24, transition: "color 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#1C2B1E"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#8A9E8C"; }}
      >
        <ArrowLeft size={15} /> Back to Course
      </Link>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* ── Left: Week Cards ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#1C2B1E", margin: "0 0 6px 0" }}>
              Curriculum Builder
            </h1>
            <p style={{ fontSize: 14, color: "#8A9E8C", margin: 0 }}>
              Build your course structure by adding content to each module.
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, border: "1px solid #E8EAE4", padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1C2B1E" }}>Curriculum Progress</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#C9973A" }}>{weeksFilled}/6 weeks</span>
              </div>
              <div style={{ height: 8, background: "#EEF0EA", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${(weeksFilled / 6) * 100}%`, height: "100%", background: "linear-gradient(90deg, #C9973A, #E8B85A)", borderRadius: 999, transition: "width 0.5s ease" }} />
              </div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#1C2B1E", margin: 0, fontFamily: "Georgia, serif" }}>{totalItems}</p>
              <p style={{ fontSize: 11, color: "#8A9E8C", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Items</p>
            </div>
          </div>

          {/* Week cards */}
          {weeks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#FFFFFF", borderRadius: 16, border: "1px dashed #E8EAE4" }}>
              <div style={{ width: "64px", height: "64px", background: "rgba(184,134,69,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", color: "#B88645" }}>
                <BookOpen size={28} />
              </div>
              <h3 style={{ fontSize: 18, color: "#1C2B1E", margin: "0 0 8px", fontWeight: 700 }}>No Modules Found</h3>
              <p style={{ fontSize: 14, color: "#8A9E8C", margin: "0 0 24px" }}>Please go back to the course page to create your modules first.</p>
              <Link href={`/instructor/courses/${id}`} style={{ padding: "10px 24px", background: "#C9973A", color: "#FFFFFF", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Back to Course</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {weeks.map((section, idx) => (
                <WeekCard
                  key={section.id}
                  section={section}
                  weekIndex={idx}
                  courseId={id}
                  onRefresh={() => refetchSections()}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Settings Sidebar ── */}
        <div style={{ width: 300, flexShrink: 0, position: "sticky", top: 100 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E8EAE4", boxShadow: "0 2px 12px rgba(28,43,30,0.06)", overflow: "hidden" }}>
            {/* Course thumbnail */}
            <div style={{ height: 140, background: "linear-gradient(135deg, #1C2B1E, #2D4A35)", position: "relative", overflow: "hidden" }}>
              {course?.thumbnail ? (
                <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 8 }}>
                  <BookOpen size={32} color="rgba(201,151,58,0.6)" />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>No Thumbnail</span>
                </div>
              )}
              {/* Course status badge */}
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                  background: course?.status === "PUBLISHED" ? "rgba(74,140,92,0.9)" : "rgba(0,0,0,0.5)",
                  color: "#FFFFFF", padding: "4px 10px", borderRadius: 999,
                }}>
                  {course?.status || "DRAFT"}
                </span>
              </div>
            </div>

            <div style={{ padding: "20px 20px 24px" }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#1C2B1E", margin: "0 0 4px", lineHeight: 1.3 }}>
                {course?.title || "Course Title"}
              </h3>
              {course?.subtitle && (
                <p style={{ fontSize: 13, color: "#8A9E8C", margin: "0 0 16px", lineHeight: 1.4 }}>
                  {course.subtitle}
                </p>
              )}

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Modules", value: weeks.length },
                  { label: "Items", value: totalItems },
                  { label: "Filled", value: weeksFilled },
                  { label: "Price", value: course?.price ? `₹${course.price}` : "Free" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#F5F0E8", borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#1C2B1E", margin: "0 0 2px", fontFamily: "Georgia, serif" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "#8A9E8C", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  href={`/instructor/courses/${id}/setup`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "11px", background: "transparent",
                    border: "1px solid #D4D9CE", borderRadius: 10,
                    fontSize: 13, fontWeight: 600, color: "#1C2B1E", textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F0E8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Edit2 size={14} /> Edit Settings
                </Link>
                {course?.status === "DRAFT" && (
                  <button
                    onClick={handleSubmitForReview}
                    disabled={publishLoading || totalItems < 3}
                    title={totalItems < 3 ? "Add at least 3 content items before submitting" : ""}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "12px",
                      background: totalItems >= 3 ? "#C9973A" : "#E4E8E0",
                      border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                      color: totalItems >= 3 ? "#FFFFFF" : "#8A9E8C",
                      cursor: totalItems >= 3 ? "pointer" : "not-allowed",
                      boxShadow: totalItems >= 3 ? "0 4px 12px rgba(201,151,58,0.25)" : "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { if (totalItems >= 3) e.currentTarget.style.background = "#E8B85A"; }}
                    onMouseLeave={(e) => { if (totalItems >= 3) e.currentTarget.style.background = "#C9973A"; }}
                  >
                    {publishLoading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Submitting...</> : <><Eye size={15} /> Submit for Review</>}
                  </button>
                )}
                {course?.status === "PENDING" && (
                  <div style={{ background: "rgba(201,151,58,0.1)", borderRadius: 10, padding: "12px", textAlign: "center", border: "1px solid rgba(201,151,58,0.3)" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#C9973A", margin: 0 }}>⏳ Awaiting Review</p>
                    <p style={{ fontSize: 11, color: "#8A9E8C", margin: "4px 0 0" }}>Admin will review your submission</p>
                  </div>
                )}
                {course?.status === "PUBLISHED" && (
                  <div style={{ background: "rgba(74,140,92,0.1)", borderRadius: 10, padding: "12px", textAlign: "center", border: "1px solid rgba(74,140,92,0.3)" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#4A8C5C", margin: 0 }}>✓ Published</p>
                    <p style={{ fontSize: 11, color: "#8A9E8C", margin: "4px 0 0" }}>This course is live</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
