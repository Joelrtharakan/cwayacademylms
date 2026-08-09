"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Search } from "lucide-react";
import { getConversations, getMessageThread, sendMessage } from "@/lib/api/instructor";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const GOLD = "var(--gold-primary, #C9A84C)";
const SURFACE = "#FFFFFF";
const DARK = "#1A261D";
const MUTED = "#8F9E93";

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </React.Suspense>
  );
}

function MessagesContent() {
  const { user } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const queryUserName = searchParams.get("name");

  const { data: convos = [] } = useQuery({ queryKey: ["conversations"], queryFn: getConversations, refetchInterval: 15000 });

  const { data: thread = [] } = useQuery({
    queryKey: ["thread", selectedUser?.id],
    queryFn: () => getMessageThread(selectedUser!.id),
    enabled: !!selectedUser,
    refetchInterval: 15000,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

  useEffect(() => {
    if (queryUserId && !selectedUser) {
      const existingConvo = convos.find((c: any) => c.otherUser.id === queryUserId);
      if (existingConvo) {
        setSelectedUser(existingConvo.otherUser);
      } else if (queryUserName) {
        setSelectedUser({ id: queryUserId, name: queryUserName, role: "STUDENT" });
      }
    }
  }, [queryUserId, queryUserName, convos, selectedUser]);

  const sendMut = useMutation({
    mutationFn: () => sendMessage(selectedUser!.id, content),
    onSuccess: () => { setContent(""); qc.invalidateQueries({ queryKey: ["thread", selectedUser?.id] }); qc.invalidateQueries({ queryKey: ["conversations"] }); },
    onError: () => toast.error("Failed to send"),
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (content.trim()) sendMut.mutate(); }
  };

  const filteredConvos = convos.filter((c: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.otherUser?.name?.toLowerCase()?.includes(q) || c.otherUser?.email?.toLowerCase()?.includes(q);
  });

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 120px)",
      minHeight: 500,
      background: SURFACE,
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid #E4E8E0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      width: "100%",
      boxSizing: "border-box"
    }}>
      {/* Left: Conversation List (Visible if desktop OR if no thread selected on mobile) */}
      <div style={{
        width: "100%",
        borderRight: "1px solid #E4E8E0",
        display: selectedUser ? "none" : "flex",
        flexDirection: "column",
        background: "#F7F8F5",
        boxSizing: "border-box"
      }} className="md:!flex md:!w-80 md:flex-shrink-0">
        <div style={{ padding: "20px 20px 16px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 14, letterSpacing: "-0.01em" }}>Messages</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", borderRadius: 10, padding: "10px 14px", border: "1px solid #E4E8E0" }}>
            <Search size={16} color={MUTED} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: "transparent", border: "none", outline: "none", color: DARK, fontSize: 14, width: "100%" }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredConvos.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: MUTED, fontSize: 14 }}>No conversations yet</div>
          ) : (
            filteredConvos.map((c: any) => (
              <button key={c.otherUser.id} onClick={() => setSelectedUser(c.otherUser)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: selectedUser?.id === c.otherUser.id ? "#FFFFFF" : "transparent", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #E4E8E0", transition: "background 0.15s" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `rgba(184,134,69,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 800, color: "#B88645" }}>
                  {c.otherUser.name?.slice(0, 2).toUpperCase() || "ST"}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: DARK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.otherUser.name}</span>
                    {c.unreadCount > 0 && <span style={{ background: "#B88645", color: "#FFFFFF", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{c.unreadCount}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage?.content}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Active Thread View */}
      {selectedUser ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#FFFFFF" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E8E0", display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", flexShrink: 0 }}>
            {/* Back Button on Mobile */}
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8, background: "#F7F8F5",
                border: "1px solid #E4E8E0", color: DARK, cursor: "pointer", flexShrink: 0
              }}
              className="md:hidden"
            >
              ←
            </button>

            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `rgba(184,134,69,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#B88645", flexShrink: 0 }}>
              {selectedUser.name?.slice(0, 2).toUpperCase() || "ST"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: DARK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedUser.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{selectedUser.role?.toLowerCase()}</div>
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12, background: "#FFFFFF" }}>
            {thread.map((msg: any) => {
              const isMe = msg.sender.id === user?.id;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", width: "100%" }}>
                  <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{
                      background: isMe ? "#B88645" : "#F7F8F5",
                      color: isMe ? "#FFFFFF" : DARK,
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "10px 16px", fontSize: 14, lineHeight: 1.5,
                      border: isMe ? "none" : "1px solid #E4E8E0",
                      wordBreak: "break-word", overflowWrap: "break-word"
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginTop: 4 }}>
                      {formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Compose Bar */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid #E4E8E0", display: "flex", gap: 10, alignItems: "center", background: "#FFFFFF", flexShrink: 0 }}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Cmd+Enter to send)"
              rows={1}
              style={{
                flex: 1, background: "#F7F8F5", border: "1px solid #E4E8E0",
                borderRadius: 12, padding: "10px 14px", color: DARK,
                fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.4
              }}
            />
            <button
              onClick={() => content.trim() && sendMut.mutate()}
              disabled={!content.trim()}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: content.trim() ? "#B88645" : "#E4E8E0",
                border: "none", cursor: content.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                transition: "all 0.15s"
              }}
            >
              <Send size={16} color={content.trim() ? "#FFFFFF" : MUTED} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 32 }} className="hidden md:flex">
          <Send size={36} color={MUTED} />
          <p style={{ color: MUTED, fontSize: 14, fontWeight: 700 }}>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
