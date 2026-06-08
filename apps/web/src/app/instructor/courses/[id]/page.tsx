"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { getModules, createModule, updateModule, deleteModule, reorderModules } from "@/lib/api/modules";
import { ArrowLeft, Plus, GripVertical, Settings, Trash2, Edit2, Play, BookOpen, ExternalLink, Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CourseManagementPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

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

  // Reorder is optimistic UI or just refresh
  const handleDragEnd = (result: any) => {
    // Implement standard dnd or generic array swap for reorder
    // For now, leaving as basic list, but structure supports it
  };

  if (courseLoading || modulesLoading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: "#F5F0E8", minHeight: "100vh" }}>
        <h2 style={{ fontFamily: "Georgia, serif", color: "#1A261D" }}>Course not found</h2>
        <Link href="/instructor/courses" style={{ color: "#B88645", textDecoration: "underline" }}>Back to Courses</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 70px)", margin: "-32px -36px", background: "#F7F8F5", color: "#1A261D", display: "flex", flexDirection: "column" }}>
      
      {/* Sticky Top Header */}
      <header style={{ position: "sticky", top: "70px", zIndex: 50, background: "#FFFFFF", padding: "16px 40px", borderBottom: "4px solid #B88645", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#1A261D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/instructor/courses" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8F9E93", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F5F0E8"} onMouseLeave={(e) => e.currentTarget.style.color = "#8A9E8C"}>
            <ArrowLeft size={18} /> Courses
          </Link>
          <div style={{ height: "24px", width: "1px", background: "rgba(184,134,69,0.3)" }}></div>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, margin: 0, color: "#B88645" }}>{course.title || "Untitled Course"}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
              <span style={{ fontSize: "11px", background: course.status === "PUBLISHED" ? "rgba(46,204,113,0.2)" : "#E4E8E0", color: course.status === "PUBLISHED" ? "#2ECC71" : "#8A9E8C", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                {course.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Course Info Strip */}
      <div style={{ background: "#FFFFFF", padding: "24px 40px", borderBottom: "1px solid #E4E8E0", display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ width: "120px", height: "80px", background: "#F7F8F5", borderRadius: "8px", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#8F9E93", fontSize: "12px", fontWeight: 600 }}>No Image</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700, color: "#1A261D", fontFamily: "Georgia, serif" }}>Course Content</h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#8F9E93" }}>Manage modules, videos, assignments, and quizzes for this course.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.push(`/instructor/courses/${id}/announcements`)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "8px", color: "#1A261D", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F7F8F5"} onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
            <BookOpen size={16} /> Announcements
          </button>
          <button onClick={() => router.push(`/instructor/courses/${id}/setup`)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#F7F8F5", border: "1px solid #E4E8E0", borderRadius: "8px", color: "#1A261D", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#E4E8E0"} onMouseLeave={e => e.currentTarget.style.background = "#F7F8F5"}>
            <Settings size={16} /> Edit Course Settings
          </button>
        </div>
      </div>

      {/* Main Area */}
      <main style={{ maxWidth: "1000px", margin: "40px auto", width: "100%", padding: "0 40px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Modules</h3>
            <p style={{ fontSize: "14px", color: "#8F9E93", margin: 0 }}>Create modules to organize your curriculum into logical sections.</p>
          </div>
          <button 
            onClick={() => setIsCreatingModule(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#B88645", border: "none", borderRadius: "8px", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(184,134,69,0.2)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <Plus size={18} /> Add Module
          </button>
        </div>

        {/* Create Module Inline Form */}
        {isCreatingModule && (
          <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "24px", boxShadow: "0 10px 30px rgba(26,38,29,0.04)" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#1A261D" }}>Create New Module</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Module Title</label>
                <input 
                  type="text" 
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Week 1: Introduction to Theology"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", color: "#1A261D" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Description (Optional)</label>
                <textarea 
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Briefly describe what this module covers..."
                  rows={3}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", color: "#1A261D", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button 
                  onClick={() => createModuleMut.mutate(moduleForm)}
                  disabled={!moduleForm.title.trim() || createModuleMut.isPending}
                  style={{ padding: "10px 20px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: !moduleForm.title.trim() ? "not-allowed" : "pointer", opacity: !moduleForm.title.trim() ? 0.5 : 1 }}
                >
                  {createModuleMut.isPending ? "Creating..." : "Save Module"}
                </button>
                <button 
                  onClick={() => { setIsCreatingModule(false); setModuleForm({ title: "", description: "" }); }}
                  style={{ padding: "10px 20px", background: "transparent", color: "#8F9E93", border: "1px solid #E4E8E0", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modules List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {modules?.length === 0 && !isCreatingModule && (
            <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
              <div style={{ width: "64px", height: "64px", background: "rgba(184,134,69,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", color: "#B88645" }}>
                <BookOpen size={28} />
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>No Modules Yet</h3>
              <p style={{ margin: "0 0 24px 0", color: "#8F9E93", fontSize: "14px" }}>Start building your course by adding your first module.</p>
              <button 
                onClick={() => setIsCreatingModule(true)}
                style={{ padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
              >
                Create Module
              </button>
            </div>
          )}

          {modules?.map((mod: any, index: number) => (
            <div key={mod.id} style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4E8E0", padding: "20px", display: "flex", gap: "16px", boxShadow: "0 2px 8px rgba(26,38,29,0.04)", transition: "box-shadow 0.2s" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,38,29,0.08)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,38,29,0.04)"}>
              <div style={{ display: "flex", alignItems: "flex-start", paddingTop: "4px", color: "#8F9E93", cursor: "grab" }}>
                <GripVertical size={20} />
              </div>
              
              <div style={{ flex: 1 }}>
                {editingModuleId === mod.id ? (
                  // Inline Edit Mode
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                    <input 
                      type="text" 
                      defaultValue={mod.title}
                      id={`edit-title-${mod.id}`}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}
                    />
                    <textarea 
                      defaultValue={mod.description || ""}
                      id={`edit-desc-${mod.id}`}
                      rows={2}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", color: "#8F9E93", resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => {
                          const title = (document.getElementById(`edit-title-${mod.id}`) as HTMLInputElement).value;
                          const desc = (document.getElementById(`edit-desc-${mod.id}`) as HTMLTextAreaElement).value;
                          updateModuleMut.mutate({ moduleId: mod.id, data: { title, description: desc } });
                        }}
                        style={{ padding: "6px 16px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingModuleId(null)}
                        style={{ padding: "6px 16px", background: "transparent", color: "#8F9E93", border: "1px solid #E4E8E0", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#B88645", textTransform: "uppercase", letterSpacing: "0.05em" }}>Module {index + 1}</span>
                          {mod.isPublished ? (
                            <span style={{ fontSize: "11px", background: "rgba(46,204,113,0.1)", color: "#2ECC71", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>Published</span>
                          ) : (
                            <span style={{ fontSize: "11px", background: "#F7F8F5", color: "#8F9E93", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>Draft</span>
                          )}
                        </div>
                        <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>{mod.title}</h4>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setEditingModuleId(mod.id)} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#F7F8F5"; e.currentTarget.style.color = "#F5F0E8"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8A9E8C"; }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { if(confirm("Are you sure you want to delete this module?")) deleteModuleMut.mutate(mod.id); }} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "#E53E3E", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(229,62,62,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {mod.description && (
                      <p style={{ fontSize: "14px", color: "#8F9E93", margin: "0 0 16px 0", lineHeight: 1.5 }}>{mod.description}</p>
                    )}
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: mod.description ? "0" : "16px", paddingTop: "16px", borderTop: "1px solid #E4E8E0" }}>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#8F9E93", fontSize: "13px", fontWeight: 500 }}>
                          <Play size={14} color="#B88645" />
                          <span>{mod._count?.lessons || 0} Lessons & Quizzes</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/instructor/courses/${id}/modules/${mod.id}`)}
                        style={{ padding: "8px 16px", background: "rgba(184,134,69,0.1)", border: "1px solid rgba(184,134,69,0.3)", borderRadius: "6px", color: "#B88645", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,134,69,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(184,134,69,0.1)"; }}
                      >
                        Manage Content
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
