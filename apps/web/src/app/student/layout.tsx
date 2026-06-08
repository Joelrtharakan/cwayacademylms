"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import StudentSidebar from "./StudentSidebar";
import { Bell, Search } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push("/login");
    }
  }, [user, isLoading, router]);

  const isPlayer = pathname ? pathname.includes('/learn') : false;

  if (isLoading || !user) {
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
            {/* Notification bell */}
            <button
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
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#B88645";
                e.currentTarget.style.color = "#B88645";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E4E8E0";
                e.currentTarget.style.color = "#9AAE9B";
              }}
            >
              <Bell size={15} />
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#B03A2E",
                  border: "2px solid #FFFFFF",
                }}
              />
            </button>

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
