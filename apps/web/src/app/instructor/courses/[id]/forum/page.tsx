"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Pin, Trash2, CornerDownRight, Send } from "lucide-react";
import { getForumPosts, createForumPost, createForumReply, pinForumPost, deleteForumPost, deleteForumReply } from "@/lib/api/instructor";
import { useAuthStore, api } from "@/store/auth.store";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

export default function CourseForumPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: course } = useQuery({ queryKey: ["course", id], queryFn: () => api.get(`/courses/${id}`).then(r => r.data.data) });
  const { data: posts = [] } = useQuery({ queryKey: ["forum-posts", id], queryFn: () => getForumPosts(id) });

  const selectedPost = posts.find((p: any) => p.id === selectedPostId);

  // Muts
  const pinMut = useMutation({ mutationFn: pinForumPost, onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-posts", id] }) });
  const deletePostMut = useMutation({ mutationFn: deleteForumPost, onSuccess: () => { setSelectedPostId(null); qc.invalidateQueries({ queryKey: ["forum-posts", id] }); } });
  const deleteReplyMut = useMutation({ mutationFn: deleteForumReply, onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-posts", id] }) });
  const replyMut = useMutation({ mutationFn: (content: string) => createForumReply(selectedPostId!, content), onSuccess: () => { setReplyContent(""); qc.invalidateQueries({ queryKey: ["forum-posts", id] }); } });

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px - 48px)", gap: 0, background: SURFACE, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,151,58,0.2)" }}>
      {/* Left: Posts List */}
      <div style={{ width: 340, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", cursor: "pointer" }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8", margin: 0 }}>Course Forum</h2>
            <div style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: 220 }}>{course?.title}</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {posts.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: MUTED, fontSize: 13 }}>No discussions yet</div>
          ) : (
            posts.map((p: any) => (
              <button key={p.id} onClick={() => setSelectedPostId(p.id)}
                style={{ width: "100%", textAlign: "left", padding: "16px 20px", background: selectedPostId === p.id ? "rgba(201,151,58,0.1)" : "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  {p.isPinned && <Pin size={14} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />}
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedPostId === p.id ? GOLD : "#F5F0E8", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.title}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: MUTED }}>
                  <span>{p.author?.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MessageSquare size={12} /> {p._count?.replies || 0}</span>
                    <span>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Thread View */}
      {selectedPost ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
            {/* Original Post */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: "#F5F0E8", marginBottom: 8 }}>{selectedPost.title}</h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: MUTED }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${GOLD}20`, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10 }}>{selectedPost.author?.name?.slice(0, 2).toUpperCase()}</div>
                      {selectedPost.author?.name}
                      {selectedPost.author?.role === "INSTRUCTOR" && <span style={{ background: GOLD, color: DARK, borderRadius: 100, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>INSTRUCTOR</span>}
                    </div>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(selectedPost.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => pinMut.mutate(selectedPost.id)} style={{ background: selectedPost.isPinned ? "rgba(201,151,58,0.2)" : "rgba(255,255,255,0.05)", color: selectedPost.isPinned ? GOLD : MUTED, border: "none", borderRadius: 8, padding: 8, cursor: "pointer", transition: "all 0.15s" }}>
                    <Pin size={16} />
                  </button>
                  <button onClick={() => { if (confirm("Delete this post?")) deletePostMut.mutate(selectedPost.id); }} style={{ background: "rgba(248,113,113,0.1)", color: "#F87171", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#F5F0E8", lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                {selectedPost.content}
              </div>
            </div>

            {/* Replies */}
            <div style={{ paddingLeft: 24, borderLeft: "2px solid rgba(255,255,255,0.05)" }}>
              {selectedPost.replies?.map((r: any) => (
                <div key={r.id} style={{ marginBottom: 20, position: "relative" }}>
                  <div style={{ position: "absolute", left: -34, top: 12, color: "rgba(255,255,255,0.1)" }}><CornerDownRight size={16} /></div>
                  <div style={{ background: r.author.role === "INSTRUCTOR" ? "rgba(201,151,58,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${r.author.role === "INSTRUCTOR" ? "rgba(201,151,58,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: 12, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED }}>
                        <span style={{ color: r.author.role === "INSTRUCTOR" ? GOLD : "#F5F0E8", fontWeight: 700 }}>{r.author.name}</span>
                        {r.author.role === "INSTRUCTOR" && <span style={{ background: GOLD, color: DARK, borderRadius: 100, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>INSTRUCTOR</span>}
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                      </div>
                      <button onClick={() => { if (confirm("Delete reply?")) deleteReplyMut.mutate(r.id); }} style={{ background: "transparent", border: "none", color: "#F87171", cursor: "pointer", opacity: 0.5 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: 13, color: "#F5F0E8", lineHeight: 1.5 }}>{r.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Box */}
          <div style={{ padding: "16px 32px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Type your reply..." rows={2}
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 10, padding: "12px 16px", color: "#F5F0E8", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              <button onClick={() => replyContent.trim() && replyMut.mutate(replyContent)} disabled={!replyContent.trim() || replyMut.isPending}
                style={{ background: GOLD, color: DARK, border: "none", borderRadius: 10, padding: "0 24px", fontWeight: 700, fontSize: 13, cursor: replyContent.trim() ? "pointer" : "not-allowed", opacity: replyContent.trim() ? 1 : 0.6, display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={16} /> Reply
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <MessageSquare size={36} color={MUTED} />
          <p style={{ color: MUTED, fontSize: 14 }}>Select a discussion thread to view</p>
        </div>
      )}
    </div>
  );
}
