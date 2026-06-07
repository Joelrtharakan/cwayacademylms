import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { createLesson, updateLesson, deleteLesson } from "@/lib/api/modules";
import { Play, Plus, X, UploadCloud, Edit2, Trash2, GripVertical, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function VideosPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", isFree: false, videoUrl: "" });

  // We fetch lessons directly here for better encapsulation
  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", module.id],
    queryFn: () => api.get(`/courses/${module.courseId}/modules`).then(r => r.data.data.find((m:any) => m.id === module.id)?.lessons || []),
  });

  // Filter only VIDEO / standard lessons
  const videos = lessons?.filter((l: any) => l.type === "VIDEO" || (!l.type && l.videoUrl)) || [];

  const createMut = useMutation({
    mutationFn: async () => {
      const lesson = await createLesson(module.id, { title: form.title, type: "VIDEO", isFree: form.isFree, videoUrl: form.videoUrl });
      return lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setForm({ title: "", isFree: false, videoUrl: "" });
      toast.success("Video lesson created!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create video lesson"),
  });

  const updateMut = useMutation({
    mutationFn: async (id: string) => {
      const lesson = await updateLesson(id, { title: form.title, isFree: form.isFree, videoUrl: form.videoUrl });
      return lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setEditingId(null);
      setIsCreating(false);
      setForm({ title: "", isFree: false, videoUrl: "" });
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
    setForm({ title: vid.title, isFree: vid.isFree, videoUrl: vid.videoUrl || "" });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Videos</h2>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Upload and manage video lessons for this module.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { setEditingId(null); setForm({ title: "", isFree: false, videoUrl: "" }); setIsCreating(true); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
          >
            <Plus size={16} /> Add Video
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "32px", boxShadow: "0 10px 30px rgba(26,38,29,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>{editingId ? "Edit Video Lesson" : "New Video Lesson"}</h3>
            <button onClick={() => { setIsCreating(false); setEditingId(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Lesson Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 1. Introduction to the topic"
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>YouTube / Video URL</label>
              <input 
                type="url" 
                value={form.videoUrl}
                onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F8F5", padding: "16px", borderRadius: "8px" }}>
              <input 
                type="checkbox" 
                id="isFree"
                checked={form.isFree}
                onChange={e => setForm({ ...form, isFree: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#B88645" }}
              />
              <div>
                <label htmlFor="isFree" style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1A261D", cursor: "pointer" }}>Make this lesson available for free preview</label>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#8F9E93" }}>Students can watch this video before enrolling.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid #E4E8E0" }}>
              <button 
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                style={{ padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}
              >
                {(createMut.isPending || updateMut.isPending) ? "Saving..." : "Save Video Lesson"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      {isLoading ? (
        <div style={{ padding: "40px", textAlign: "center" }}><Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} /></div>
      ) : videos.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
          <Play size={28} color="#A0AEC0" style={{ margin: "0 auto 16px auto" }} />
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No videos yet</h3>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Click "Add Video" to upload your first lesson.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {videos.map((vid: any) => (
            <div key={vid.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4E8E0" }}>
              <GripVertical size={18} color="#A0AEC0" style={{ cursor: "grab" }} />
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645" }}>
                <Play size={18} fill="currentColor" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 600, color: "#1A261D" }}>{vid.title}</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#8F9E93" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {Math.round(vid.duration / 60)} min</span>
                  {vid.isFree && <span style={{ color: "#2ECC71", fontWeight: 600, background: "rgba(46,204,113,0.1)", padding: "2px 6px", borderRadius: "4px" }}>Free Preview</span>}
                  {vid.videoUrl ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#4299E1" }}><CheckCircle2 size={12} /> Linked</span>
                  ) : (
                    <span style={{ color: "#E53E3E" }}>No Link Provided</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleEdit(vid)} style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "#E4E8E0"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => { if(confirm("Delete video?")) deleteMut.mutate(vid.id); }} style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#E53E3E", cursor: "pointer", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(229,62,62,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
