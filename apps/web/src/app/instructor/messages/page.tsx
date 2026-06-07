"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Search } from "lucide-react";
import { getConversations, getMessageThread, sendMessage } from "@/lib/api/instructor";
import { useAuthStore } from "@/store/auth.store";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: convos = [] } = useQuery({ queryKey: ["conversations"], queryFn: getConversations, refetchInterval: 15000 });

  const { data: thread = [] } = useQuery({
    queryKey: ["thread", selectedUser?.id],
    queryFn: () => getMessageThread(selectedUser!.id),
    enabled: !!selectedUser,
    refetchInterval: 15000,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

  const sendMut = useMutation({
    mutationFn: () => sendMessage(selectedUser!.id, content),
    onSuccess: () => { setContent(""); qc.invalidateQueries({ queryKey: ["thread", selectedUser?.id] }); qc.invalidateQueries({ queryKey: ["conversations"] }); },
    onError: () => toast.error("Failed to send"),
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (content.trim()) sendMut.mutate(); }
  };

  const filteredConvos = convos.filter((c: any) =>
    c.otherUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUser?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px - 48px)", gap: 0, background: SURFACE, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,151,58,0.2)" }}>
      {/* Left: Conversation List */}
      <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 16px 12px" }}>
          <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8", marginBottom: 12 }}>Messages</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Search size={14} color={MUTED} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: "transparent", border: "none", outline: "none", color: "#F5F0E8", fontSize: 13, flex: 1 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredConvos.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: MUTED, fontSize: 13 }}>No conversations yet</div>
          ) : (
            filteredConvos.map((c: any) => (
              <button key={c.otherUser.id} onClick={() => setSelectedUser(c.otherUser)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: selectedUser?.id === c.otherUser.id ? "rgba(201,151,58,0.1)" : "transparent", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${GOLD}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: GOLD }}>
                  {c.otherUser.name?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#F5F0E8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.otherUser.name}</span>
                    {c.unreadCount > 0 && <span style={{ background: GOLD, color: DARK, borderRadius: 100, padding: "1px 7px", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{c.unreadCount}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{c.lastMessage?.content}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Thread */}
      {selectedUser ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${GOLD}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: GOLD }}>
              {selectedUser.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F5F0E8" }}>{selectedUser.name}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{selectedUser.role?.toLowerCase()}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
            {thread.map((msg: any) => {
              const isMe = msg.sender.id === user?.id;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "70%" }}>
                    <div style={{
                      background: isMe ? GOLD : "rgba(255,255,255,0.06)",
                      color: isMe ? DARK : "#F5F0E8",
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "10px 14px", fontSize: 13, lineHeight: 1.5,
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, textAlign: isMe ? "right" : "left", marginTop: 3 }}>
                      {formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea value={content} onChange={e => setContent(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message... (Cmd+Enter to send)" rows={1}
              style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 10, padding: "10px 14px", color: "#F5F0E8", fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
            <button onClick={() => content.trim() && sendMut.mutate()} disabled={!content.trim()}
              style={{ width: 40, height: 40, borderRadius: "50%", background: content.trim() ? GOLD : "rgba(255,255,255,0.08)", border: "none", cursor: content.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              <Send size={16} color={content.trim() ? DARK : MUTED} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <Send size={36} color={MUTED} />
          <p style={{ color: MUTED, fontSize: 14 }}>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
