"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Coins,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
    items: [{ name: "Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "My Courses",
    items: [{ name: "All Courses", href: "/instructor/courses", icon: BookOpen }],
  },
  {
    title: "Students & Grading",
    items: [
      { name: "Assignments", href: "/instructor/assignments", icon: ClipboardCheck },
      { name: "Messages", href: "/instructor/messages", icon: MessageSquare },
    ],
  },
  {
    title: "Earnings",
    items: [{ name: "Revenue & Payouts", href: "/instructor/revenue", icon: Coins }],
  },
  {
    title: "Account",
    items: [{ name: "Profile & Settings", href: "/instructor/settings", icon: Settings }],
  },
];

// Sidebar width constants
const EXPANDED_W = 280;
const COLLAPSED_W = 80;

export default function InstructorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  // State to track which sections are expanded.
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize expanded sections based on the current active pathname
  useEffect(() => {
    const initialState: Record<string, boolean> = {
      Overview: true, // Always keep Overview open by default
    };

    NAV.forEach((section) => {
      const hasActiveItem = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      if (hasActiveItem) {
        initialState[section.title] = true;
      }
    });

    setExpandedSections((prev) => ({ ...prev, ...initialState }));
  }, [pathname]);

  const toggleSection = (title: string) => {
    if (collapsed) return; // Don't toggle when collapsed
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const W = collapsed ? COLLAPSED_W : EXPANDED_W;

  const handleSignOut = () => {
    clearAuth();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  return (
    <>
      <style>{`
        .instructor-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .instructor-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .instructor-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }
        .instructor-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      `}</style>

      {/* Fixed sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: `${W}px`,
          background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
          zIndex: 40,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
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
            zIndex: 1,
          }}
        />

        {/* ── Logo (Absolutely positioned top) ───────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "70px", // Match layout.tsx header height exactly
            padding: "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            zIndex: 2,
            background: "transparent", 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
            <div style={{ width: "36px", height: "36px", overflow: "hidden", position: "relative", borderRadius: "50%", flexShrink: 0 }}>
               <Image 
                src="/logo.png" 
                alt="CWAY Academy Badge" 
                width={190}
                height={42}
                style={{ objectFit: "cover", objectPosition: "left center", position: "absolute", left: 0, top: "-3px" }} 
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                opacity: collapsed ? 0 : 1,
                visibility: collapsed ? "hidden" : "visible",
                transition: "opacity 0.2s, visibility 0.2s",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "16px", fontWeight: 700, letterSpacing: "0.05em", color: "#FDFBF7", textTransform: "uppercase" as const }}>CWAY</span>
                <span style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "13px", fontWeight: 400, letterSpacing: "0.1em", color: "#B88645", textTransform: "uppercase" as const }}>Academy</span>
              </div>
              <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, marginTop: "2px" }}>
                Instructor Panel
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable Content Area ─────────────────────────────────────── */}
        <div
          className="instructor-sidebar-scroll"
          style={{
            position: "absolute",
            top: "70px",
            bottom: "140px", // Space for bottom profile section + toggle
            left: 0,
            right: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "24px 16px",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {NAV.map((section, idx) => {
              const isSectionExpanded = !!expandedSections[section.title];

              return (
                <div key={section.title} style={{ marginBottom: "8px" }}>
                  {/* Section Header */}
                  <div
                    onClick={() => toggleSection(section.title)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      cursor: collapsed ? "default" : "pointer",
                      opacity: collapsed ? 0 : 1,
                      visibility: collapsed ? "hidden" : "visible",
                      transition: "opacity 0.2s, visibility 0.2s",
                      height: collapsed ? 0 : "auto",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {section.title}
                    </span>
                    {!collapsed && (
                      <ChevronDown
                        size={14}
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          transform: isSectionExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    )}
                  </div>

                  {/* Section Items */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      overflow: "hidden",
                      maxHeight: collapsed || isSectionExpanded ? "500px" : "0px",
                      transition: "max-height 0.3s ease-in-out",
                    }}
                  >
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: collapsed ? 0 : "14px",
                            padding: collapsed ? "10px 0" : "10px 12px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            position: "relative",
                            background: isActive ? "rgba(184,134,69,0.15)" : "transparent",
                            border: "1px solid",
                            borderColor: isActive ? "rgba(184,134,69,0.3)" : "transparent",
                            transition: "all 0.2s",
                            color: isActive ? "#B88645" : "rgba(255,255,255,0.6)",
                            justifyContent: collapsed ? "center" : "flex-start",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                              e.currentTarget.style.color = "#FDFBF7";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                            }
                          }}
                          title={collapsed ? item.name : undefined}
                        >
                          {isActive && !collapsed && (
                            <div
                              style={{
                                position: "absolute",
                                left: "-16px",
                                top: "20%",
                                bottom: "20%",
                                width: "3px",
                                background: "#B88645",
                                borderRadius: "0 4px 4px 0",
                              }}
                            />
                          )}

                          <item.icon size={18} style={{ flexShrink: 0 }} />

                          {!collapsed && (
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: isActive ? 600 : 500,
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
                </div>
              );
            })}
          </div>
        </div>

        {/* ── User Footer & Toggle (Absolutely positioned bottom) ─────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "140px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* User Section */}
          <div style={{ padding: collapsed ? "16px 8px" : "16px 20px", flex: 1 }}>
            {/* User card */}
            {!collapsed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(184,134,69,0.2)",
                    border: "1px solid rgba(184,134,69,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#B88645",
                    textTransform: "uppercase" as const,
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.slice(0, 2) || "IN"}
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "14px", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name || "Instructor"}
                  </div>
                  <div style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                gap: collapsed ? 0 : "12px",
                padding: collapsed ? "12px 0" : "12px 14px",
                borderRadius: "10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                fontSize: "14px",
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(176,58,46,0.15)";
                e.currentTarget.style.color = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              <LogOut size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Edge Toggle (Visible in both states) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "fixed",
          top: "32px",
          left: collapsed ? "68px" : "268px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "rgba(255,255,255,0.7)",
          zIndex: 50,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#334155";
          e.currentTarget.style.color = "#FDFBF7";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#1e293b";
          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
        }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Spacer to push main content right */}
      <div style={{ width: `${W}px`, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />
    </>
  );
}
