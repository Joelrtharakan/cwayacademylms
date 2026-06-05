"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FolderKanban,
  FileText,
  CreditCard,
  HeartHandshake,
  Percent,
  BarChart3,
  Award,
  Mail,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "People",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Instructors", href: "/admin/instructors", icon: GraduationCap },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Courses", href: "/admin/courses", icon: BookOpen },
      { name: "Categories", href: "/admin/categories", icon: FolderKanban },
      { name: "Blog Posts", href: "/admin/blog", icon: FileText },
    ],
  },
  {
    title: "Business",
    items: [
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
      { name: "Sponsorships", href: "/admin/sponsorships", icon: HeartHandshake },
      { name: "Coupons", href: "/admin/coupons", icon: Percent },
    ],
  },
  {
    title: "Analytics",
    items: [{ name: "Reports", href: "/admin/analytics", icon: BarChart3 }],
  },
  {
    title: "System",
    items: [
      { name: "Certificates", href: "/admin/certificates", icon: Award },
      { name: "Email Templates", href: "/admin/emails", icon: Mail },
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

// Sidebar width constants
const EXPANDED_W = 260;
const COLLAPSED_W = 68;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const W = collapsed ? COLLAPSED_W : EXPANDED_W;

  const handleSignOut = () => {
    clearAuth();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  return (
    <>
      <style>{`
        .admin-sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Fixed sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          height: "100vh",
          width: `${W}px`,
          background: "#1A261D",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {/* Decorative radial glow top-right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "180px",
            height: "180px",
            background: "radial-gradient(circle at top right, rgba(184,134,69,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Logo ───────────────────────────────── */}
        <div
          style={{
            padding: collapsed ? "24px 0" : "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          {/* Icon mark */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(184,134,69,0.15)",
              border: "1px solid rgba(184,134,69,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "18px", color: "#B88645" }}>C</span>
          </div>

          {/* Brand text — only when expanded */}
          {!collapsed && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "17px", color: "#FFFFFF", letterSpacing: "0.02em", lineHeight: 1 }}>
                CWAY <span style={{ color: "#B88645" }}>Academy</span>
              </div>
              <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                Administration
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav
          className="admin-sidebar-nav"
          style={{
            flex: 1,
            minHeight: 0, // CRITICAL FOR SCROLLING IN FLEX LAYOUT
            overflowY: "auto",
            overflowX: "hidden",
            padding: collapsed ? "12px 8px" : "12px 10px",
          }}
        >
          {NAV.map((section, si) => (
            <div key={si} style={{ marginBottom: "4px" }}>
              {/* Section header */}
              {!collapsed && (
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "rgba(255,255,255,0.2)",
                    padding: "12px 12px 6px",
                    userSelect: "none",
                  }}
                >
                  {section.title}
                </div>
              )}
              {collapsed && si > 0 && (
                <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "8px 4px" }} />
              )}

              {/* Items */}
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: collapsed ? 0 : "12px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      padding: collapsed ? "10px 0" : "10px 12px",
                      borderRadius: "10px",
                      marginBottom: "2px",
                      textDecoration: "none",
                      position: "relative",
                      transition: "background 0.15s",
                      background: isActive ? "rgba(184,134,69,0.14)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && !collapsed && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "6px",
                          bottom: "6px",
                          width: "3px",
                          borderRadius: "0 3px 3px 0",
                          background: "#B88645",
                        }}
                      />
                    )}

                    <Icon
                      size={18}
                      style={{ color: isActive ? "#B88645" : "rgba(255,255,255,0.45)", flexShrink: 0 }}
                    />

                    {!collapsed && (
                      <span
                        style={{
                          fontSize: "13.5px",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "#B88645" : "rgba(255,255,255,0.6)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── User Footer ─────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: collapsed ? "14px 8px" : "14px 12px",
            flexShrink: 0,
          }}
        >
          {/* User card */}
          {!collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(184,134,69,0.18)",
                  border: "1px solid rgba(184,134,69,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#B88645",
                  textTransform: "uppercase" as const,
                  flexShrink: 0,
                }}
              >
                {user?.name?.slice(0, 2) || "AD"}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name || "Admin"}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email}
                </div>
              </div>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : "10px",
              padding: collapsed ? "10px 0" : "10px 12px",
              borderRadius: "10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.35)",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(176,58,46,0.14)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* ── Collapse toggle (bottom of sidebar) ── */}
        <div
          style={{
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-end",
            padding: collapsed ? "0 0 14px" : "0 14px 14px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.4)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(184,134,69,0.15)";
              e.currentTarget.style.color = "#B88645";
              e.currentTarget.style.borderColor = "rgba(184,134,69,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* Spacer to push content right — same width as sidebar */}
      <div style={{ width: `${W}px`, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />
    </>
  );
}
