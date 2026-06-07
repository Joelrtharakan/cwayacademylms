"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Search } from "lucide-react";
import { getConversations, getMessageThread, sendMessage } from "@/lib/api/instructor";
import { useAuthStore } from "@/store/auth.store";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const GOLD = "var(--gold-primary, #C9A84C)";
const SURFACE = "#FFFFFF";
const DARK = "#1A261D";
const MUTED = "#8F9E93";

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
    <div style={{ display: "flex", height: "calc(100vh - 60px - 48px)", gap: 0, background: SURFACE, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-light, #E2E8F0)", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
      {/* Left: Conversation List */}
      <div style={{ width: 320, flexShrink: 0, borderRight: "1px solid var(--border-light, #E2E8F0)", display: "flex", flexDirection: "column", background: "var(--cream-light, #F9FAF8)" }}>
        <div style={{ padding: "20px 20px 16px" }}>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: 20, fontWeight: 700, color: DARK, marginBottom: 16, letterSpacing: "0.5px" }}>Messages</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", borderRadius: 8, padding: "10px 14px", border: "1px solid var(--border-light, #E2E8F0)" }}>
            <Search size={16} color={MUTED} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: "transparent", border: "none", outline: "none", color: DARK, fontSize: 14, flex: 1 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredConvos.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: MUTED, fontSize: 14 }}>No conversations yet</div>
          ) : (
            filteredConvos.map((c: any) => (
              <button key={c.otherUser.id} onClick={() => setSelectedUser(c.otherUser)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: selectedUser?.id === c.otherUser.id ? "#FFFFFF" : "transparent", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid var(--border-light, #E2E8F0)", transition: "background 0.15s" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `rgba(201,168,76,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, color: "var(--gold-dark, #A68A3D)" }}>
                  {c.otherUser.name?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: DARK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.otherUser.name}</span>
                    {c.unreadCount > 0 && <span style={{ background: GOLD, color: "#FFFFFF", borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.unreadCount}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage?.content}</div>
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
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-light, #E2E8F0)", display: "flex", alignItems: "center", gap: 14, background: "#FFFFFF" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `rgba(201,168,76,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--gold-dark, #A68A3D)" }}>
              {selectedUser.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>{selectedUser.name}</div>
              <div style={{ fontSize: 13, color: MUTED }}>{selectedUser.role?.toLowerCase()}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {thread.map((msg: any) => {
              const isMe = msg.sender.id === user?.id;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "70%" }}>
                    <div style={{
                      background: isMe ? GOLD : "var(--cream-mid, #F4F5F1)",
                      color: isMe ? "#FFFFFF" : DARK,
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "12px 16px", fontSize: 14, lineHeight: 1.5,
                      boxShadow: isMe ? "0 2px 4px rgba(201,168,76,0.2)" : "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, textAlign: isMe ? "right" : "left", marginTop: 4 }}>
                      {formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-light, #E2E8F0)", display: "flex", gap: 12, alignItems: "flex-end", background: "#FFFFFF" }}>
            <textarea value={content} onChange={e => setContent(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message... (Cmd+Enter to send)" rows={1}
              style={{ flex: 1, background: "var(--cream-light, #F9FAF8)", border: "1px solid var(--border-light, #E2E8F0)", borderRadius: 12, padding: "12px 16px", color: DARK, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
            <button onClick={() => content.trim() && sendMut.mutate()} disabled={!content.trim()}
              style={{ width: 44, height: 44, borderRadius: "50%", background: content.trim() ? GOLD : "var(--border-light, #E2E8F0)", border: "none", cursor: content.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              <Send size={18} color={content.trim() ? "#FFFFFF" : MUTED} />
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
