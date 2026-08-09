"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { getModules, createModule, updateModule, deleteModule } from "@/lib/api/modules";
import { ArrowLeft, Plus, GripVertical, Settings, Trash2, Edit2, Play, BookOpen, Loader2, Clock, Eye, Megaphone, Check, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useConfirm } from "@/components/shared/ConfirmContext";
import { toast } from "react-hot-toast";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  goldGlow: "rgba(184,134,69,0.25)",
  dark: "#1A261D",
  darkSoft: "#2D3A2F",
  muted: "#7F8E82",
  surface: "#FFFFFF",
  bgAlt: "#F7F8F5",
  border: "#E2E6DE",
  borderLight: "#EBEEE8",
  red: "#DC4A4A",
  green: "#3D7A4B",
};

export default function CourseManagementPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  
  // Forms
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });

  // Queries
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data),
  });

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules", id],
    queryFn: () => getModules(id),
  });

  // Mutations
  const createModuleMut = useMutation({
    mutationFn: (data: any) => createModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", id] });
      setIsCreatingModule(false);
      setModuleForm({ title: "", description: "" });
      toast.success("Module created successfully");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create module"),
  });

  const updateModuleMut = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: any }) => updateModule(id, moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", id] });
      setEditingModuleId(null);
      toast.success("Module updated");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update module"),
  });

  const deleteModuleMut = useMutation({
    mutationFn: (moduleId: string) => deleteModule(id, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", id] });
      toast.success("Module deleted");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete module"),
  });

  if (courseLoading || modulesLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Loader2 size={36} style={{ animation: "settings-spin 1s linear infinite", color: C.gold }} />
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>Loading course content…</span>
        <style>{`@keyframes settings-spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 40, textAlign: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, margin: "32px 0" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: C.dark, marginBottom: 8 }}>Course not found</h2>
        <Link href="/instructor/courses" style={{ color: C.gold, fontWeight: 700, textDecoration: "underline", fontSize: 14 }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", maxWidth: 1100, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 64, boxSizing: "border-box",
    }}>
      {/* ── UNIFIED COURSE HERO CARD ── */}
      <div style={{
        background: C.surface,
        borderTop: `1px solid ${C.borderLight}`,
        borderRight: `1px solid ${C.borderLight}`,
        borderBottom: `1px solid ${C.borderLight}`,
        borderLeft: `4px solid ${C.gold}`,
        borderRadius: 20,
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",
        display: "flex", flexDirection: "column", gap: 20,
        width: "100%", boxSizing: "border-box",
      }}>
        {/* Top bar: Back link + Status badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", boxSizing: "border-box" }}>
          <Link
            href="/instructor/courses"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "0 12px", height: 28, borderRadius: 20,
              background: C.bgAlt, color: C.darkSoft, border: `1px solid ${C.border}`,
              fontSize: 11, fontWeight: 800, textDecoration: "none",
              transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
              boxSizing: "border-box"
            }}
          >
            <ArrowLeft size={14} />
            <span>Courses</span>
          </Link>

          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: 28, padding: "0 12px", borderRadius: 20,
            fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
            background: course.status === "PUBLISHED" ? "rgba(61,122,75,0.12)" : "rgba(184,134,69,0.12)",
            color: course.status === "PUBLISHED" ? C.green : C.gold,
            border: `1px solid ${course.status === "PUBLISHED" ? "rgba(61,122,75,0.25)" : "rgba(184,134,69,0.25)"}`,
            whiteSpace: "nowrap", flexShrink: 0, boxSizing: "border-box"
          }}>
            {course.status}
          </span>
        </div>

        {/* Middle: Thumbnail + Course Title & Program Badge */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box",
        }}>
          {/* Course Thumbnail Card */}
          {course.thumbnail && (
            <div style={{
              width: 130, height: 130, minWidth: 130,
              borderRadius: 16, overflow: "hidden",
              border: `1px solid ${C.border}`, background: C.bgAlt,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              flexShrink: 0,
            }}>
              <img
                src={course.thumbnail} alt={course.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <div style={{ flex: "1 1 240px", minWidth: 200 }}>
            {/* Program Badge Tag */}
            {(() => {
              const rawTitle = course.program?.title || course.programName || course.programTitle;
              const pTitle = typeof rawTitle === "object" && rawTitle !== null
                ? (rawTitle.en || rawTitle.hi || Object.values(rawTitle)[0] || "")
                : String(rawTitle || "");

              const isPart = Boolean(pTitle && pTitle.trim());

              return (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "4px 12px", borderRadius: 20, marginBottom: 8,
                  background: isPart ? "rgba(184,134,69,0.12)" : C.bgAlt,
                  color: isPart ? C.gold : C.muted,
                  border: `1px solid ${isPart ? "rgba(184,134,69,0.25)" : C.border}`,
                  whiteSpace: "nowrap", maxWidth: "100%"
                }}>
                  <GraduationCap size={14} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isPart ? pTitle : "Standalone Course"}</span>
                </div>
              );
            })()}

            {/* Course Title */}
            <h1 style={{
              margin: "0 0 6px 0", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 800, color: C.dark,
              letterSpacing: "-0.01em", lineHeight: 1.3, wordBreak: "normal", overflowWrap: "break-word"
            }}>
              {course.title || "Untitled Course"}
            </h1>

            {/* Course Description */}
            <p style={{ margin: 0, fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 650 }}>
              Manage modules, videos, assignments, and quizzes for this course.
            </p>
          </div>
        </div>

        {/* Separate Divider Line */}
        <div style={{ width: "100%", height: 1, background: C.borderLight }} />

        {/* Bottom Toolbar: Action buttons */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          width: "100%",
        }}>
          <button
            onClick={() => window.open(`/student/courses/${id}/learn`, '_blank')}
            style={{
              flex: "1 1 170px", height: 44, padding: "0 18px", borderRadius: 12,
              background: C.goldLight, border: `1px solid rgba(184,134,69,0.3)`,
              color: C.gold, fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.color = C.gold; }}
          >
            <Eye size={16} />
            <span>View as Student</span>
          </button>

          <button
            onClick={() => router.push(`/instructor/courses/${id}/gradebook`)}
            style={{
              flex: "1 1 160px", height: 44, padding: "0 18px", borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              color: C.dark, fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.bgAlt; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
          >
            <BookOpen size={16} color={C.muted} />
            <span>Gradebook</span>
          </button>

          <button
            onClick={() => router.push(`/instructor/courses/${id}/announcements`)}
            style={{
              flex: "1 1 170px", height: 44, padding: "0 18px", borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              color: C.dark, fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.bgAlt; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
          >
            <Megaphone size={16} color={C.muted} />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => router.push(`/instructor/courses/${id}/extensions`)}
            style={{
              flex: "1 1 160px", height: 44, padding: "0 18px", borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              color: C.dark, fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.bgAlt; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
          >
            <Clock size={16} color={C.muted} />
            <span>Extensions</span>
          </button>

          <button
            onClick={() => router.push(`/instructor/courses/${id}/setup`)}
            style={{
              flex: "1 1 160px", height: 44, padding: "0 18px", borderRadius: 12,
              background: C.bgAlt, border: `1px solid ${C.border}`,
              color: C.dark, fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.border; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.bgAlt; }}
          >
            <Settings size={16} color={C.muted} />
            <span>Edit Settings</span>
          </button>
        </div>
      </div>

      {/* ── 3. MODULES SECTION ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 12 }}>
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.dark }}>
              Modules
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
              Create modules to organize your curriculum into logical sections.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingModule(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
              color: "#fff", border: "none", borderRadius: 12,
              padding: "12px 24px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", boxShadow: `0 4px 12px ${C.goldLight}`,
              transition: "all 0.2s",
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Module</span>
          </button>
        </div>

        {/* Create Module Form Card */}
        {isCreatingModule && (
          <div style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${C.border}`, padding: 28,
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column", gap: 18,
          }}>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.dark }}>Create New Module</h4>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 6 }}>
                  Module Title *
                </label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Week 1: Introduction to Theology"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 16px", borderRadius: 10,
                    border: `1.5px solid ${C.border}`, background: C.bgAlt,
                    fontSize: 14, color: C.dark, outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 6 }}>
                  Description (Optional)
                </label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Briefly describe what this module covers..."
                  rows={3}
                  onWheel={(e) => e.stopPropagation()}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 16px", borderRadius: 10,
                    border: `1.5px solid ${C.border}`, background: C.bgAlt,
                    fontSize: 14, color: C.dark, outline: "none", resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
                <button
                  onClick={() => createModuleMut.mutate(moduleForm)}
                  disabled={!moduleForm.title.trim() || createModuleMut.isPending}
                  style={{
                    padding: "10px 24px", borderRadius: 10, border: "none",
                    background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
                    color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    opacity: !moduleForm.title.trim() ? 0.5 : 1,
                  }}
                >
                  {createModuleMut.isPending ? "Creating…" : "Save Module"}
                </button>
                <button
                  onClick={() => { setIsCreatingModule(false); setModuleForm({ title: "", description: "" }); }}
                  style={{
                    padding: "10px 20px", borderRadius: 10,
                    border: `1px solid ${C.border}`, background: "transparent",
                    color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modules List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {modules?.length === 0 && !isCreatingModule && (
            <div style={{
              padding: "48px 32px", textAlign: "center",
              background: C.surface, borderRadius: 16,
              border: `2px dashed ${C.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: C.goldLight, color: C.gold,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <BookOpen size={28} />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: C.dark }}>No Modules Yet</h3>
              <p style={{ margin: "0 0 20px", color: C.muted, fontSize: 14 }}>Start building your course by adding your first module.</p>
              <button
                onClick={() => setIsCreatingModule(true)}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: C.gold, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Create Module
              </button>
            </div>
          )}

          {modules?.map((mod: any, index: number) => (
            <div
              key={mod.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.borderLight}`,
                borderRadius: 16,
                padding: "24px 28px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                display: "flex", gap: 18, alignItems: "flex-start",
                transition: "box-shadow 0.25s, transform 0.25s",
              }}
            >
              {/* Drag Icon */}
              <div style={{ paddingTop: 4, color: C.mutedLight, cursor: "grab", flexShrink: 0 }}>
                <GripVertical size={20} />
              </div>

              {/* Card Body */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {editingModuleId === mod.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.gold }}>
                        Editing Module Settings
                      </span>
                    </div>

                    {/* Title Input Field */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>Module Title</label>
                      <input
                        type="text"
                        defaultValue={mod.title}
                        id={`edit-title-${mod.id}`}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "12px 16px", borderRadius: 10,
                          border: `1px solid ${C.border}`, background: "#FFFFFF",
                          fontSize: 15, fontWeight: 700, color: C.dark, outline: "none",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.gold;
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.15)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = C.border;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Description Textarea Field */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>Module Description</label>
                      <textarea
                        defaultValue={mod.description || ""}
                        id={`edit-desc-${mod.id}`}
                        rows={4}
                        placeholder="Add a detailed description for this module..."
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "12px 16px", borderRadius: 10,
                          border: `1px solid ${C.border}`, background: "#FFFFFF",
                          fontSize: 14, fontWeight: 500, color: C.dark, lineHeight: 1.6,
                          outline: "none", resize: "vertical", minHeight: 100, maxHeight: 240,
                          overflowY: "auto", pointerEvents: "auto",
                          transition: "all 0.2s",
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.gold;
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.15)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = C.border;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4, flexWrap: "wrap" }}>
                      <button
                        onClick={() => {
                          const title = (document.getElementById(`edit-title-${mod.id}`) as HTMLInputElement).value;
                          const desc = (document.getElementById(`edit-desc-${mod.id}`) as HTMLTextAreaElement).value;
                          updateModuleMut.mutate({ moduleId: mod.id, data: { title, description: desc } });
                        }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "10px 22px", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
                          color: "#FFFFFF", border: "none", borderRadius: 10,
                          fontSize: 13, fontWeight: 800, cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(184,134,69,0.25)",
                          transition: "all 0.2s",
                        }}
                      >
                        <Check size={15} />
                        <span>{updateModuleMut.isPending ? "Saving..." : "Save Changes"}</span>
                      </button>

                      <button
                        onClick={() => setEditingModuleId(null)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "10px 18px", background: "#F7F8F5",
                          color: C.dark, border: `1px solid ${C.border}`, borderRadius: 10,
                          fontSize: 13, fontWeight: 700, cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal Mode */
                  <>
                    {/* Module Title & Actions Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", width: "100%" }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: C.gold, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                            Module {index + 1}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 12,
                            background: mod.isPublished ? "rgba(61,122,75,0.12)" : C.bgAlt,
                            color: mod.isPublished ? C.green : C.muted,
                            whiteSpace: "nowrap", flexShrink: 0, textTransform: "uppercase",
                          }}>
                            {mod.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                        <h4 style={{
                          margin: 0, fontSize: "clamp(16px, 3.5vw, 18px)", fontWeight: 800,
                          color: C.dark, lineHeight: 1.4, wordBreak: "break-word"
                        }}>
                          {mod.title}
                        </h4>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: "auto" }}>
                        <button
                          onClick={() => setEditingModuleId(mod.id)}
                          title="Edit Module"
                          style={{
                            width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
                            background: C.bgAlt, color: C.darkSoft, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={async () => {
                            if (await confirm("Delete this module and all its contents?")) {
                              deleteModuleMut.mutate(mod.id);
                            }
                          }}
                          title="Delete Module"
                          style={{
                            width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(220,74,74,0.2)",
                            background: "rgba(220,74,74,0.06)", color: C.red, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {mod.description && (
                      <p style={{ margin: 0, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                        {mod.description}
                      </p>
                    )}

                    {/* Bottom Info Bar */}
                    <div style={{
                      borderTop: `1px solid ${C.borderLight}`,
                      paddingTop: 16, marginTop: 4,
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: 13, fontWeight: 600 }}>
                        <Play size={15} color={C.gold} />
                        <span>{mod._count?.lessons || 0} Lessons & Quizzes</span>
                      </div>

                      <button
                        onClick={() => router.push(`/instructor/courses/${id}/modules/${mod.id}`)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "8px 20px", borderRadius: 10,
                          background: C.goldLight, border: `1px solid rgba(184,134,69,0.25)`,
                          color: C.gold, fontSize: 13, fontWeight: 700, cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.color = C.gold; }}
                      >
                        <span>Manage Content</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
