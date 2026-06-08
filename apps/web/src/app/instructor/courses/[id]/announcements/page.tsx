"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Megaphone, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getInstructorAnnouncements, createAnnouncement, deleteAnnouncement } from "@/lib/api/instructor";
import { api } from "@/store/auth.store";

export default function CourseAnnouncementsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const qc = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  // Fetch course info for header
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
    onError: (err: any) => toast.error("Failed to delete announcement"),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 70px)", margin: "-32px -36px", background: "#F7F8F5", color: "#1A261D", display: "flex", flexDirection: "column" }}>
      
      {/* Sticky Top Header */}
      <header style={{ position: "sticky", top: "70px", zIndex: 50, background: "#FFFFFF", padding: "16px 40px", borderBottom: "4px solid #B88645", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href={`/instructor/courses/${id}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8F9E93", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F5F0E8"} onMouseLeave={(e) => e.currentTarget.style.color = "#8A9E8C"}>
            <ArrowLeft size={18} /> Back to Course
          </Link>
          <div style={{ height: "24px", width: "1px", background: "rgba(184,134,69,0.3)" }}></div>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, margin: 0, color: "#B88645" }}>Course Announcements</h1>
            <div style={{ fontSize: "12px", color: "#8F9E93", marginTop: "4px" }}>{course?.title || "Untitled Course"}</div>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main style={{ maxWidth: "800px", margin: "40px auto", width: "100%", padding: "0 40px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Announcements</h3>
            <p style={{ fontSize: "14px", color: "#8F9E93", margin: 0 }}>Broadcast important updates to all students enrolled in this course.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#B88645", border: "none", borderRadius: "8px", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(184,134,69,0.2)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <Plus size={18} /> New Announcement
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "32px", boxShadow: "0 10px 30px rgba(26,38,29,0.04)" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "#1A261D" }}>Compose Announcement</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Subject / Title</label>
                <input 
                  type="text" 
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Welcome to Week 2!"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", color: "#1A261D" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Message</label>
                <textarea 
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your announcement message here..."
                  rows={6}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", color: "#1A261D", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button 
                  onClick={() => createMut.mutate(form)}
                  disabled={!form.title.trim() || !form.content.trim() || createMut.isPending}
                  style={{ padding: "10px 20px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: (!form.title.trim() || !form.content.trim()) ? "not-allowed" : "pointer", opacity: (!form.title.trim() || !form.content.trim()) ? 0.5 : 1 }}
                >
                  {createMut.isPending ? "Posting..." : "Post Announcement"}
                </button>
                <button 
                  onClick={() => { setIsCreating(false); setForm({ title: "", content: "" }); }}
                  style={{ padding: "10px 20px", background: "transparent", color: "#8F9E93", border: "1px solid #E4E8E0", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {announcements?.length === 0 && !isCreating && (
            <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
              <div style={{ width: "64px", height: "64px", background: "rgba(184,134,69,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", color: "#B88645" }}>
                <Megaphone size={28} />
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>No Announcements</h3>
              <p style={{ margin: "0", color: "#8F9E93", fontSize: "14px" }}>You haven't posted any announcements for this course yet.</p>
            </div>
          )}

          {announcements?.map((ann: any) => (
            <div key={ann.id} style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E4E8E0", padding: "24px", boxShadow: "0 2px 8px rgba(26,38,29,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: "0 0 6px 0" }}>{ann.title}</h4>
                  <div style={{ fontSize: "12px", color: "#8F9E93", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Posted {new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { if(confirm("Are you sure you want to delete this announcement?")) deleteMut.mutate(ann.id); }}
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "#E53E3E", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s" }} 
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(229,62,62,0.1)"} 
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ fontSize: "14px", color: "#1A261D", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {ann.content}
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
