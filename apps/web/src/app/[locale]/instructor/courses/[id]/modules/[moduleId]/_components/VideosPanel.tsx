import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { createLesson, updateLesson, deleteLesson } from "@/lib/api/modules";
import { Play, Plus, X, UploadCloud, Edit2, Trash2, GripVertical, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/shared/ConfirmContext";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
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

export default function VideosPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", isFree: false, videoUrl: "", durationMinutes: 0 });

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", module.id],
    queryFn: () => api.get(`/courses/${module.courseId}/modules`).then(r => r.data.data.find((m:any) => m.id === module.id)?.lessons || []),
  });

  const videos = lessons?.filter((l: any) => l.type === "VIDEO" || (!l.type && l.videoUrl)) || [];

  const createMut = useMutation({
    mutationFn: async () => {
      const lesson = await createLesson(module.id, { title: form.title, type: "VIDEO", isFree: form.isFree, videoUrl: form.videoUrl, duration: form.durationMinutes * 60 });
      return lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setForm({ title: "", isFree: false, videoUrl: "", durationMinutes: 0 });
      toast.success("Video lesson created!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create video lesson"),
  });

  const updateMut = useMutation({
    mutationFn: async (id: string) => {
      const lesson = await updateLesson(id, { title: form.title, isFree: form.isFree, videoUrl: form.videoUrl, duration: form.durationMinutes * 60 });
      return lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setEditingId(null);
      setIsCreating(false);
      setForm({ title: "", isFree: false, videoUrl: "", durationMinutes: 0 });
      toast.success("Video lesson updated!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update video lesson"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Video deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      updateMut.mutate(editingId);
    } else {
      createMut.mutate();
    }
  };

  const handleEdit = (vid: any) => {
    setEditingId(vid.id);
    setIsCreating(true);
    setForm({ title: vid.title, isFree: vid.isFree, videoUrl: vid.videoUrl || "", durationMinutes: Math.round((vid.duration || 0) / 60) });
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      {/* Top Header Card */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap", marginBottom: 28, width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0", color: C.dark, fontFamily: "Georgia, serif" }}>Videos</h2>
          <p style={{ margin: 0, color: C.muted, fontSize: 13, lineHeight: 1.4 }}>Upload and manage video lessons for this module.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { setEditingId(null); setForm({ title: "", isFree: false, videoUrl: "", durationMinutes: 0 }); setIsCreating(true); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
              color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 800,
              cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 4px 14px rgba(184,134,69,0.25)"
            }}
          >
            <Plus size={16} /> <span>Add Video</span>
          </button>
        )}
      </div>

      {/* Video Create/Edit Form */}
      {isCreating && (
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 28, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.dark }}>{editingId ? "Edit Video Lesson" : "New Video Lesson"}</h3>
            <button onClick={() => { setIsCreating(false); setEditingId(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 6 }}>Lesson Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 1. Introduction to the topic"
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgAlt, fontSize: 14 }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 6 }}>YouTube / Video URL</label>
              <input 
                type="url" 
                value={form.videoUrl}
                onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgAlt, fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 6 }}>Duration (Minutes)</label>
              <input 
                type="number" 
                value={form.durationMinutes || ""}
                onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                placeholder="e.g. 15"
                min="0"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgAlt, fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.bgAlt, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
              <input 
                type="checkbox" 
                id="isFree"
                checked={form.isFree}
                onChange={e => setForm({ ...form, isFree: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: C.gold }}
              />
              <div>
                <label htmlFor="isFree" style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.dark, cursor: "pointer" }}>Make this lesson available for free preview</label>
                <p style={{ margin: "2px 0 0 0", fontSize: 13, color: C.muted }}>Students can watch this video before enrolling.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <button 
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                style={{ padding: "11px 24px", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`, color: "#FFFFFF", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}
              >
                {(createMut.isPending || updateMut.isPending) ? "Saving..." : "Save Video Lesson"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      {isLoading ? (
        <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Loader2 size={26} style={{ animation: "spin 1s linear infinite", color: C.gold }} /></div>
      ) : videos.length === 0 ? (
        <div style={{ padding: "50px 24px", textAlign: "center", background: "#FFFFFF", borderRadius: 18, border: `2px dashed ${C.border}` }}>
          <Play size={30} color={C.muted} style={{ margin: "0 auto 14px auto" }} />
          <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 800, color: C.dark }}>No videos yet</h3>
          <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>Click "Add Video" to upload your first lesson.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", boxSizing: "border-box" }}>
          {videos.map((vid: any) => (
            <div
              key={vid.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, padding: "16px 20px", background: "#FFFFFF", borderRadius: 16,
                border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                flexWrap: "wrap", width: "100%", boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                <GripVertical size={18} color={C.muted} style={{ cursor: "grab", flexShrink: 0 }} />
                <div style={{ width: 42, height: 42, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, flexShrink: 0 }}>
                  <Play size={18} fill="currentColor" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    margin: "0 0 4px 0", fontSize: 15, fontWeight: 800, color: C.dark,
                    lineHeight: 1.4, wordBreak: "break-word"
                  }}>
                    {vid.title}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: C.muted, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}><Clock size={13} /> {Math.round((vid.duration || 0) / 60)} min</span>
                    {vid.isFree && <span style={{ color: "#2E7D32", fontWeight: 800, background: "rgba(46,125,50,0.1)", padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>Free Preview</span>}
                    {vid.videoUrl ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#1976D2", fontWeight: 700, whiteSpace: "nowrap" }}><CheckCircle2 size={13} /> Linked</span>
                    ) : (
                      <span style={{ color: C.red, fontWeight: 700, whiteSpace: "nowrap" }}>No Link Provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: "auto" }}>
                <button
                  onClick={() => handleEdit(vid)}
                  title="Edit Video"
                  style={{ width: 34, height: 34, background: C.bgAlt, border: `1px solid ${C.border}`, color: C.darkSoft, cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={async () => { if(await confirm("Delete video?")) deleteMut.mutate(vid.id); }}
                  title="Delete Video"
                  style={{ width: 34, height: 34, background: "rgba(220,74,74,0.06)", border: "1px solid rgba(220,74,74,0.2)", color: C.red, cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
