"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

/**
 * Notification bell for the management panel (instructor / registrar / admin).
 * Fetches the signed-in user's own notifications from the role-agnostic
 * `/student/notifications` endpoint, shows an unread count, and lists them in a
 * dropdown with mark-as-read. This is how staff see alerts such as a student's
 * assignment/forum extension request.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["mgmt-notifications"],
    queryFn: () => api.get("/student/notifications").then((r) => r.data.data),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  const notifications: NotificationItem[] = data?.notifications ?? [];
  const unread: number = data?.unreadCount ?? 0;

  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/student/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mgmt-notifications"] }),
  });
  const markAll = useMutation({
    mutationFn: () => api.put(`/student/notifications/read-all`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mgmt-notifications"] }),
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onItemClick = (n: NotificationItem) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.link && /^https?:\/\//.test(n.link)) window.open(n.link, "_blank");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{
          position: "relative",
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: "#F7F8F5",
          border: "1px solid #E4E8E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#9AAE9B",
          transition: "all 0.15s",
        }}
      >
        <Bell size={15} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "16px",
              height: "16px",
              padding: "0 4px",
              borderRadius: "999px",
              background: "#B03A2E",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #FFFFFF",
              lineHeight: 1,
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "440px",
            display: "flex",
            flexDirection: "column",
            background: "#FFFFFF",
            border: "1px solid #E4E8E0",
            borderRadius: "14px",
            boxShadow: "0 16px 40px rgba(26, 38, 29, 0.16)",
            zIndex: 60,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid #EEF1EC",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1A261D" }}>
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#B88645",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  color: "#8F9E93",
                  fontSize: "13px",
                }}
              >
                You&apos;re all caught up.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onItemClick(n)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    gap: "10px",
                    padding: "12px 16px",
                    background: n.isRead ? "#FFFFFF" : "#FCF7EF",
                    border: "none",
                    borderBottom: "1px solid #F2F4F0",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      marginTop: "6px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: n.isRead ? "transparent" : "#B88645",
                    }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#1A261D",
                        }}
                      >
                        {n.title}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#9AAE9B",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5C7360",
                        marginTop: "2px",
                        lineHeight: 1.4,
                      }}
                    >
                      {n.body}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
