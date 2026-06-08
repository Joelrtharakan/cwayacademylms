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
  FolderKanban,
  Award,
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
    items: [{ name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Learning",
    items: [
      { name: "My Courses", href: "/student/my-courses", icon: BookOpen },
    ],
  },
  {
    title: "Activities",
    items: [
      { name: "Assignments", href: "/student/assignments", icon: FolderKanban },
    ],
  },
  {
    title: "Achievements",
    items: [
      { name: "Certificates", href: "/student/certificates", icon: Award },
    ],
  },
];

// Sidebar width constants
const EXPANDED_W = 280;
const COLLAPSED_W = 80;

export default function StudentSidebar() {
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
        .student-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .student-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .student-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }
        .student-sidebar-scroll::-webkit-scrollbar-thumb:hover {
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
                priority
              />
            </div>
            
            {!collapsed && (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ 
                  fontFamily: "var(--font-cinzel), 'Cinzel', Georgia, serif", 
                  fontSize: "18px", 
                  fontWeight: 700, 
                  color: "#FFFFFF", 
                  letterSpacing: "0.15em",
                  lineHeight: 1
                }}>
                  CWAY <span style={{ color: "#D4A35B", fontWeight: 400, letterSpacing: "0.2em" }}>ACADEMY</span>
                </div>
                <div style={{ 
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                  fontSize: "9px", 
                  fontWeight: 800, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.2em", 
                  color: "rgba(255,255,255,0.6)", 
                  marginTop: "4px" 
                }}>
                  Student Portal
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable Navigation Area (Absolutely positioned middle) ── */}
        <nav
          className="student-sidebar-scroll"
          style={{
            position: "absolute",
            top: "70px", // Match new header height
            bottom: "140px", // Exact space for footer
            left: 0,
            right: 0,
            overflowY: "auto",
            padding: collapsed ? "16px 8px" : "20px 16px",
            zIndex: 2,
            transform: "translateZ(0)", // Fixes Mac WebKit wheel scroll dropping
            WebkitOverflowScrolling: "touch", // Restores proper momentum scroll
            overscrollBehavior: "contain", // Prevents scroll chaining to the body
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NAV.map((section, si) => {
              const isSectionExpanded = collapsed || expandedSections[section.title];

              return (
                <div key={si} style={{ marginBottom: "12px" }}>
                  {/* Section header as a clickable accordion toggle */}
                  {!collapsed && (
                    <button
                      onClick={() => toggleSection(section.title)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "transparent",
                        border: "none",
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderRadius: "8px",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-dm-serif), serif",
                          fontSize: "15px",
                          fontWeight: 400,
                          letterSpacing: "0.05em",
                          color: isSectionExpanded ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                          transition: "color 0.15s",
                        }}
                      >
                        {section.title}
                      </span>
                      <ChevronDown
                        size={16}
                        style={{
                          color: isSectionExpanded ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                          transition: "transform 0.2s ease, color 0.2s ease",
                          transform: isSectionExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                  )}
                  {collapsed && si > 0 && (
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "12px 4px" }} />
                  )}

                  {/* Expandable Items Container */}
                  <div
                    style={{
                      overflow: "hidden",
                      transition: "max-height 0.3s ease-in-out, opacity 0.2s ease-in-out",
                      maxHeight: isSectionExpanded ? "800px" : "0px",
                      opacity: isSectionExpanded ? 1 : 0,
                    }}
                  >
                    <div style={{ padding: collapsed ? "0" : "4px 0" }}>
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            title={collapsed ? item.name : undefined}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: collapsed ? 0 : "14px",
                              justifyContent: collapsed ? "center" : "flex-start",
                              padding: collapsed ? "14px 0" : "12px 14px",
                              borderRadius: "10px",
                              marginBottom: "4px",
                              textDecoration: "none",
                              position: "relative",
                              transition: "background 0.15s",
                              background: isActive ? "rgba(184,134,69,0.18)" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
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
                                  left: "0",
                                  right: "0",
                                  top: "0",
                                  bottom: "0",
                                  borderRadius: "10px",
                                  background: "linear-gradient(90deg, rgba(184,134,69,0.15), rgba(212,163,91,0.05))",
                                  border: "1px solid rgba(184,134,69,0.3)",
                                  pointerEvents: "none",
                                }}
                              />
                            )}

                            <Icon
                              size={20}
                              style={{ color: isActive ? "#D4A35B" : "rgba(255,255,255,0.7)", flexShrink: 0, position: "relative", zIndex: 1 }}
                            />

                            {!collapsed && (
                              <span
                                style={{
                                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                                  fontSize: "14.5px",
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? "#D4A35B" : "rgba(255,255,255,0.85)",
                                  whiteSpace: "nowrap",
                                  letterSpacing: "0.02em",
                                  position: "relative",
                                  zIndex: 1
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
                </div>
              );
            })}
          </div>
        </nav>

        {/* ── User Footer & Toggle (Absolutely positioned bottom) ─────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "140px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", // Use the underlying gradient
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
                  {user?.name?.slice(0, 2) || "ST"}
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "14px", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name || "Student"}
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

          {/* Collapse toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-end",
              padding: collapsed ? "0 0 16px" : "0 20px 16px",
            }}
          >
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(184,134,69,0.2)";
                e.currentTarget.style.color = "#B88645";
                e.currentTarget.style.borderColor = "rgba(184,134,69,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to push content right — same width as sidebar */}
      <div style={{ width: `${W}px`, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />
    </>
  );
}
