"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useAuthStore } from "@/store/auth.store";
import { getInvitations } from "@/lib/api/instructor";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  MessageCircle,

  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
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

// Sidebar width constants
const EXPANDED_W = 280;
const COLLAPSED_W = 80;

export default function InstructorSidebar({ mobileOpen = false, onClose = () => {}, collapsed = false, onToggleCollapse = () => {} }: { mobileOpen?: boolean, onClose?: () => void, collapsed?: boolean, onToggleCollapse?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const lenis = useLenis();
  const t = useTranslations("instructor.sidebar");

  const NAV: NavSection[] = [
    {
      title: t("overview"),
      items: [{ name: t("dashboard"), href: "/instructor/dashboard", icon: LayoutDashboard }],
    },
    {
      title: t("myCourses"),
      items: [
        { name: t("allCourses"), href: "/instructor/courses", icon: BookOpen },
        { name: t("invitations"), href: "/instructor/invitations", icon: Mail },
      ],
    },
    {
      title: t("studentsAndGrading"),
      items: [
        { name: t("assignments"), href: "/instructor/assignments", icon: ClipboardCheck },
        { name: t("messages"), href: "/instructor/messages", icon: MessageSquare },
        { name: t("forums"), href: "/instructor/forums", icon: MessageCircle },
      ],
    },
    {
      title: t("account"),
      items: [{ name: t("profileAndSettings"), href: "/instructor/settings", icon: Settings }],
    },
  ];

  useEffect(() => {
    return () => {
      // Ensure scroll is restored if sidebar unmounts while hovered
      lenis?.start();
    };
  }, [lenis]);

  const { data: invitations } = useQuery({
    queryKey: ["invitations", "PENDING"],
    queryFn: () => getInvitations("PENDING"),
    enabled: !!user && user.role === "INSTRUCTOR",
  });
  const pendingCount = invitations?.length || 0;

  // State to track which sections are expanded.
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize expanded sections based on the current active pathname
  useEffect(() => {
    const initialState: Record<string, boolean> = {
      [t("overview")]: true, // Always keep Overview open by default
    };

    NAV.forEach((section) => {
      const hasActiveItem = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      if (hasActiveItem) {
        initialState[section.title] = true;
      }
    });

    setExpandedSections((prev) => {
      let hasChanges = false;
      const next = { ...prev };
      for (const key in initialState) {
        if (!next[key]) {
          next[key] = true;
          hasChanges = true;
        }
      }
      return hasChanges ? next : prev;
    });
  }, [pathname]);

  const toggleSection = (title: string) => {
    if (collapsed) return; // Don't toggle when collapsed
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const W = collapsed ? COLLAPSED_W : EXPANDED_W;

  const handleSignOut = async () => {
    await logout();
    toast.success(t("signedOut"));
    router.push("/login");
  };

  return (
    <>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

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

      <div
        data-lenis-prevent="true"
        className={`print:hidden md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
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
                {user?.role === "ADMIN" ? t("adminView") : user?.role === "REGISTRAR" ? t("registrarView") : t("instructorPanel")}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable Content Area ─────────────────────────────────────── */}
        <nav
          className="instructor-sidebar-scroll"
          data-lenis-prevent="true"
          style={{
            position: "absolute",
            top: "70px",
            bottom: "160px", // Space for bottom profile section + toggle
            left: 0,
            right: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "24px 16px",
            zIndex: 2,
          }}
        >
          {(user?.role === "ADMIN" || user?.role === "REGISTRAR") && (
            <div style={{ padding: "0 16px 16px 16px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <Link 
                href={user.role === "ADMIN" ? "/admin/courses" : "/registrar/courses"}
                style={{
                  display: "block",
                  padding: "10px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                ← {user?.role === "ADMIN" ? t("returnToAdmin") : t("returnToRegistrar")}
              </Link>
            </div>
          )}
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
                        <button
                          key={item.name}
                          onClick={() => router.push(item.href)}
                          style={{
                            width: "100%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: collapsed ? 0 : "14px",
                            padding: collapsed ? "10px 12px" : "10px 12px",
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
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                              (e.currentTarget as HTMLElement).style.color = "#FDFBF7";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
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
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flex: 1,
                              }}
                            >
                              <span>{item.name}</span>
                              {item.name === t("invitations") && pendingCount > 0 && (
                                <span
                                  style={{
                                    background: "#B03A2E",
                                    color: "#FFFFFF",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "2px 6px",
                                    borderRadius: "10px",
                                  }}
                                >
                                  {pendingCount}
                                </span>
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
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
            height: "160px",
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
                    overflow: "hidden"
                  }}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user?.name?.slice(0, 2) || "IN"
                  )}
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "14px", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name || (user?.role === "ADMIN" ? "Admin" : "Instructor")}
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
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                fontSize: "14px",
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <LogOut size={20} style={{ marginRight: collapsed ? "0px" : "12px", strokeWidth: 1.5, opacity: 0.7 }} />
              {!collapsed && <span>{t("signOut")}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Edge Toggle (Visible in both states) */}
      <button
        className="hidden md:flex"
        onClick={() => onToggleCollapse()}
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
        title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Spacer to push main content right */}
      <div className="hidden md:block" style={{ width: `${W}px`, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />
    </>
  );
}
