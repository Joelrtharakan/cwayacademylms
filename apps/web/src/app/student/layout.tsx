"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, api } from "@/store/auth.store";
import StudentSidebar from "./StudentSidebar";
import { Bell, Search, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "INSTRUCTOR") {
        router.push("/instructor/dashboard");
      }
    }
  }, [user, isLoading, router]);

  const isPlayer = pathname ? pathname.includes('/learn') : false;

  if (isLoading || !user || user.role !== "STUDENT") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F7F8F5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid #B88645",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: "#8F9E93" }}>
          Loading LMS Classroom...
        </p>
      </div>
    );
  }

  // If we are in the course player, do not render sidebar or top bar (full width)
  if (isPlayer) {
    return (
      <div className="min-h-screen bg-cway-cream flex flex-col">
        <main className="flex-1 w-full mx-auto flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAF7", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
      {/* Sidebar (renders its own fixed div + spacer) */}
      <StudentSidebar />

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>

        {/* ── Top bar ──────────────────────────────── */}
        <header
          style={{
            height: "70px",
            background: "rgba(250, 250, 247, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(220, 224, 213, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", width: "240px" }}>
            <Search
              size={14}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9AAE9B" }}
            />
            <input
              type="text"
              placeholder="Quick search..."
              style={{
                width: "100%",
                paddingLeft: "36px",
                paddingRight: "14px",
                paddingTop: "8px",
                paddingBottom: "8px",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "inherit",
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                borderRadius: "9px",
                outline: "none",
                color: "#1A261D",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#B88645";
                e.target.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E4E8E0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <NotificationDropdown />

            <div style={{ width: "1px", height: "24px", background: "#E4E8E0" }} />

            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "default" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(184,134,69,0.1)",
                  border: "1.5px solid rgba(184,134,69,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#B88645",
                  textTransform: "uppercase" as const,
                }}
              >
                {user?.name?.slice(0, 2) || "ST"}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A261D", lineHeight: 1.2 }}>
                  {user?.name || "Student"}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#9AAE9B", marginTop: "2px" }}>
                  Learner
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────── */}
        <main
          style={{
            flex: 1,
            padding: "32px 36px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const router = useRouter();

  const { data: responseData } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => api.get("/student/notifications").then(r => r.data.data),
    refetchInterval: 15000
  });

  const data = responseData?.notifications || [];

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.put(`/student/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-notifications"] })
  });

  const markAllReadMut = useMutation({
    mutationFn: () => api.put(`/student/notifications/read-all`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-notifications"] })
  });

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = data.filter((n: any) => !n.isRead).length;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: isOpen ? "#E4E8E0" : "#F7F8F5",
          border: "1px solid #E4E8E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: isOpen ? "#1A261D" : "#9AAE9B",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if(!isOpen) { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.color = "#B88645"; }
        }}
        onMouseLeave={(e) => {
          if(!isOpen) { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.color = "#9AAE9B"; }
        }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "18px",
              height: "18px",
              padding: "0 4px",
              borderRadius: "9px",
              background: "#B03A2E",
              color: "#FFF",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #FAFAF7",
              boxSizing: "border-box"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", top: "48px", right: 0, width: "360px", background: "#FFFFFF",
          borderRadius: "16px", border: "1px solid #E4E8E0", boxShadow: "0 10px 40px rgba(26,38,29,0.1)",
          zIndex: 100, overflow: "hidden", display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E8E0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F7F8F5" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1A261D" }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllReadMut.mutate()} style={{ background: "none", border: "none", color: "#B88645", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: "min(400px, calc(100vh - 140px))", overflowY: "auto", overscrollBehavior: "contain" }}>
            {data.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#8F9E93", fontSize: "13px" }}>You're all caught up!</div>
            ) : (
              data.map((n: any) => (
                <div key={n.id} style={{
                  padding: "16px 20px", borderBottom: "1px solid #E4E8E0",
                  background: n.isRead ? "#FFFFFF" : "rgba(184,134,69,0.03)",
                  transition: "background 0.2s", cursor: n.link ? "pointer" : "default"
                }}
                onClick={() => {
                  if (!n.isRead) markReadMut.mutate(n.id);
                  if (n.link) { setIsOpen(false); router.push(n.link); }
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: n.isRead ? 600 : 700, color: "#1A261D", marginBottom: "4px" }}>{n.title}</div>
                      <div style={{ fontSize: "13px", color: "#677E6A", lineHeight: 1.4 }}>{n.body}</div>
                      <div style={{ fontSize: "11px", color: "#8F9E93", marginTop: "8px", fontWeight: 500 }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                    </div>
                    {!n.isRead && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#B88645", flexShrink: 0, marginTop: "4px" }} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

