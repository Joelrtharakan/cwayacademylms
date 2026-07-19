"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import AdminSidebar from "./AdminSidebar";
import { Bell, Search, Menu, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useManagementRole, useManagementPath } from "@/hooks/useManagementPath";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, initAuth, logout } = useAuthStore();
  const expectedRole = useManagementRole();
  const basePath = useManagementPath();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const t = useTranslations("admin.layout");

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== expectedRole) {
        if (user.role === "REGISTRAR") router.push("/registrar/dashboard");
        else if (user.role === "INSTRUCTOR") router.push("/instructor/dashboard");
        else if (user.role === "STUDENT") router.push("/student/dashboard");
        else if (user.role === "ADMIN") router.push(`${basePath}/dashboard`);
      }
    }
  }, [user, isLoading, router, expectedRole]);

  if (isLoading || !user || user.role !== expectedRole) {
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
          {t("header.loading")}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAF7", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
      {/* Sidebar (renders its own fixed div + spacer) */}
      <AdminSidebar 
        mobileOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        collapsed={isDesktopCollapsed}
        onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
      />

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>

        {/* ── Top bar ──────────────────────────────── */}
        <header
          className="print:hidden"
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
            className="mr-4"
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
              placeholder={t("header.searchPlaceholder")}
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
            <LanguageSwitcher />

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
            <div style={{ position: "relative" }}>
              <div 
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
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
                  {user?.name?.slice(0, 2) || "AD"}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A261D", lineHeight: 1.2 }}>
                    {user?.name || (expectedRole === "REGISTRAR" ? "Registrar" : "Admin")}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#9AAE9B", marginTop: "2px" }}>
                    {expectedRole === "REGISTRAR" ? "Registrar" : "Administrator"}
                  </div>
                </div>
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div 
                    style={{ position: "fixed", inset: 0, zIndex: 40 }} 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  <div 
                    style={{ 
                      position: "absolute", 
                      top: "calc(100% + 16px)", 
                      right: 0, 
                      width: "180px",
                      background: "#fff", 
                      borderRadius: "12px", 
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)", 
                      border: "1px solid #E4E8E0",
                      padding: "8px",
                      zIndex: 50
                    }}
                  >
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "transparent",
                        border: "none",
                        color: "#B03A2E",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(176,58,46,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────── */}
        <main
          className="print:p-0 print:m-0 print:bg-white print:w-full"
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
