"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { getInvitations } from "@/lib/api/instructor";
import InstructorSidebar from "./InstructorSidebar";
import { Bell, Search, Menu } from "lucide-react";
import { toast } from "sonner";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, initAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("read_invitations");
    if (stored) {
      try { setReadIds(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const markAsRead = (id: string) => {
    const newIds = [...new Set([...readIds, id])];
    setReadIds(newIds);
    localStorage.setItem("read_invitations", JSON.stringify(newIds));
  };

  const { data: invitations } = useQuery({
    queryKey: ["invitations", "PENDING"],
    queryFn: () => getInvitations("PENDING"),
    enabled: !!user && user.role === "INSTRUCTOR",
  });
  const pendingInvitations = invitations || [];
  const unreadNotifs = pendingInvitations.filter((inv: any) => !readIds.includes(inv.id));
  const readNotifs = pendingInvitations.filter((inv: any) => readIds.includes(inv.id));
  const hasUnread = unreadNotifs.length > 0;

  // Show a welcome popup for unread notifications once per session
  useEffect(() => {
    if (hasUnread && !sessionStorage.getItem("notified_unread_invitations")) {
      sessionStorage.setItem("notified_unread_invitations", "true");
      toast.message("New Invitations", {
        description: `You have ${unreadNotifs.length} pending course invitation(s) waiting for you.`,
        icon: <Bell size={16} style={{ color: "#B88645" }} />,
        action: {
          label: "View",
          onClick: () => router.push("/instructor/invitations"),
        },
        duration: 8000,
      });
    }
  }, [hasUnread, invitations, router]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "STUDENT") {
        router.push("/student/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN" && user.role !== "REGISTRAR")) {
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
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAF7", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
      {/* Sidebar (renders its own fixed div + spacer) */}
      <InstructorSidebar 
        mobileOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        collapsed={isDesktopCollapsed}
        onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
      />

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
            padding: "0 clamp(16px, 4vw, 28px)",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          
          {/* Mobile Hamburger Menu */}
          <button 
            className="mr-4 md:hidden"
            onClick={() => {
              if (window.innerWidth < 768) setIsMobileMenuOpen(true);
              else setIsDesktopCollapsed(!isDesktopCollapsed);
            }}
            style={{ color: "#1A261D", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Menu size={24} />
          </button>
          
          {/* Search */}
          <div className="hidden sm:block" style={{ position: "relative", width: "240px" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
            {/* Notification bell */}
            <button
              onClick={() => setShowNotifs(!showNotifs)}
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
              {hasUnread && (
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "#B03A2E",
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: 800,
                    minWidth: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    borderRadius: "10px",
                    border: "2px solid #F7F8F5",
                  }}
                >
                  {unreadNotifs.length}
                </div>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <>
                <div 
                  style={{ position: "fixed", inset: 0, zIndex: 90 }} 
                  onClick={() => setShowNotifs(false)} 
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    width: "320px",
                    background: "#FFFFFF",
                    border: "1px solid #E4E8E0",
                    borderRadius: "16px",
                    boxShadow: "0 12px 32px rgba(26,38,29,0.12)",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E8E0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1A261D" }}>Notifications</h3>
                    {hasUnread && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#B88645", background: "rgba(184,134,69,0.1)", padding: "2px 8px", borderRadius: "10px" }}>
                        {unreadNotifs.length} New
                      </span>
                    )}
                  </div>
                  
                  <div data-lenis-prevent="true" style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {/* Unread Section */}
                    {unreadNotifs.length > 0 && (
                      <div style={{ padding: "8px 20px", background: "#FAF7F2", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#C9973A", letterSpacing: "0.08em" }}>
                        Unread
                      </div>
                    )}
                    {unreadNotifs.map((inv: any) => (
                      <div 
                        key={inv.id} 
                        style={{ padding: "16px 20px", borderBottom: "1px solid #F0F2ED", display: "flex", gap: "12px", cursor: "pointer", transition: "background 0.2s", background: "rgba(201,151,58,0.03)" }} 
                        onClick={() => { markAsRead(inv.id); setShowNotifs(false); router.push("/instructor/invitations"); }} 
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(201,151,58,0.08)"} 
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(201,151,58,0.03)"}
                      >
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(184,134,69,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645", flexShrink: 0 }}>
                          <Bell size={14} />
                        </div>
                        <div>
                          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "#1A261D" }}>
                            Course Invitation
                          </p>
                          <p style={{ margin: 0, fontSize: "12px", color: "#8F9E93", lineHeight: 1.4 }}>
                            You have been assigned to teach "{inv.course?.title}".
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Read Section */}
                    {readNotifs.length > 0 && (
                      <div style={{ padding: "8px 20px", background: "#F7F8F5", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#8F9E93", letterSpacing: "0.08em", borderTop: unreadNotifs.length > 0 ? "1px solid #E4E8E0" : "none" }}>
                        Previous
                      </div>
                    )}
                    {readNotifs.map((inv: any) => (
                      <div 
                        key={inv.id} 
                        style={{ padding: "16px 20px", borderBottom: "1px solid #F0F2ED", display: "flex", gap: "12px", cursor: "pointer", transition: "background 0.2s", opacity: 0.7 }} 
                        onClick={() => { setShowNotifs(false); router.push("/instructor/invitations"); }} 
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#F7F8F5"; e.currentTarget.style.opacity = "1"; }} 
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.opacity = "0.7"; }}
                      >
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F0F2ED", display: "flex", alignItems: "center", justifyContent: "center", color: "#8F9E93", flexShrink: 0 }}>
                          <Bell size={14} />
                        </div>
                        <div>
                          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "#1A261D" }}>
                            Course Invitation
                          </p>
                          <p style={{ margin: 0, fontSize: "12px", color: "#8F9E93", lineHeight: 1.4 }}>
                            You have been assigned to teach "{inv.course?.title}".
                          </p>
                        </div>
                      </div>
                    ))}

                    {pendingInvitations.length === 0 && (
                      <div style={{ padding: "32px 20px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#8F9E93" }}>No notifications</p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: "12px", background: "#F7F8F5", borderTop: "1px solid #E4E8E0", textAlign: "center" }}>
                    <button onClick={() => { setShowNotifs(false); router.push("/instructor/invitations"); }} style={{ background: "transparent", border: "none", fontSize: "12px", fontWeight: 700, color: "#B88645", cursor: "pointer" }}>
                      View all invitations
                    </button>
                  </div>
                </div>
              </>
            )}

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
                  overflow: "hidden"
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user?.name?.slice(0, 2) || "IN"
                )}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A261D", lineHeight: 1.2 }}>
                  {user?.name || (user?.role === "ADMIN" ? "Admin" : "Instructor")}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#9AAE9B", marginTop: "2px" }}>
                  {user?.role === "ADMIN" ? "Administrator" : "Instructor"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────── */}
        <main
          style={{
            flex: 1,
            padding: "clamp(16px, 4vw, 32px) clamp(16px, 5vw, 36px)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
