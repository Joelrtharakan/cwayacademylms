"use client";

import React, { useState } from "react";
import { THEME } from "@/lib/cway-theme";
import { usePlayerStore } from "@/store/player.store";
import { X, Save, Clock, Trash2, Edit2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { format } from "date-fns";

interface NotesPanelProps {
  lessonId: string;
}

export default function NotesPanel({ lessonId }: NotesPanelProps) {
  const { notesPanelOpen, setNotesPanelOpen } = usePlayerStore();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", lessonId],
    queryFn: () => api.get(`/student/lessons/${lessonId}/my-notes`).then(res => res.data.data),
    enabled: !!lessonId && notesPanelOpen
  });

  const saveMutation = useMutation({
    mutationFn: (data: { content: string }) => api.post(`/student/lessons/${lessonId}/notes`, data),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["notes", lessonId] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, content: string }) => api.put(`/student/notes/${data.id}`, { content: data.content }),
    onSuccess: () => {
      setEditingId(null);
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["notes", lessonId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/student/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", lessonId] });
    }
  });

  const handleSave = () => {
    if (!content.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, content });
    } else {
      saveMutation.mutate({ content });
    }
  };

  const handleEdit = (note: any) => {
    setEditingId(note.id);
    setContent(note.content);
  };

  if (!notesPanelOpen) return null;

  return (
    <div style={{ width: 320, background: "white", borderLeft: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: THEME.HERO }}>My Notes</h3>
        <button onClick={() => setNotesPanelOpen(false)} style={{ background: "none", border: "none", color: THEME.MUTED, cursor: "pointer", padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <textarea 
          placeholder="Take a note..."
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ width: "100%", minHeight: 120, padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontFamily: "Inter, sans-serif", fontSize: 14, resize: "vertical", outline: "none" }}
          onFocus={e => e.target.style.borderColor = THEME.GOLD}
          onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {editingId && (
            <button 
              onClick={() => { setEditingId(null); setContent(""); }}
              style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${THEME.MUTED}`, background: "transparent", color: THEME.TEXT, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!content.trim() || saveMutation.isPending || updateMutation.isPending}
            style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: THEME.GOLD, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: !content.trim() ? 0.5 : 1 }}
          >
            <Save size={14} /> {editingId ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 20, color: THEME.MUTED, fontSize: 14 }}>Loading notes...</div>
        ) : notes?.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: THEME.MUTED, fontSize: 14 }}>
            No notes for this lesson yet.
          </div>
        ) : (
          notes?.map((note: any) => (
            <div key={note.id} style={{ background: "rgba(0,0,0,0.02)", borderRadius: 8, padding: 16, position: "relative", group: "note-item" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.MUTED, fontSize: 11 }}>
                  <Clock size={12} /> {format(new Date(note.updatedAt), "MMM d, h:mm a")}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => handleEdit(note)} style={{ background: "none", border: "none", color: THEME.MUTED, cursor: "pointer", padding: 4 }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(note.id)} style={{ background: "none", border: "none", color: THEME.DANGER, cursor: "pointer", padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: THEME.TEXT, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
