"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAuthStore, api } from "@/store/auth.store";
import StudentSidebar from "./StudentSidebar";
import { Bell, Search, Check, X, Menu, Megaphone, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { LocaleGuard } from "@/components/shared/LocaleGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);
  const t = useTranslations("student.layout");

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
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
          {t("loading")}
        </p>
      </div>
    );
  }

  if (isPlayer) {
    return (
      <div className="h-screen overflow-hidden bg-cway-cream flex flex-col">
        <main className="flex-1 w-full mx-auto flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAF7", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
      {/* Sidebar (renders its own fixed div + spacer) */}
      <StudentSidebar 
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
          <div className="hidden md:block w-36 lg:w-60 transition-all duration-200" style={{ position: "relative" }}>
            <Search
              size={14}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9AAE9B" }}
            />
            <input
              type="text"
              placeholder={t("search")}
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
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

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
                  flexShrink: 0
                }}
              >
                {user?.name?.slice(0, 2) || t("defaultName").slice(0, 2)}
              </div>
              <div className="hidden lg:block">
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A261D", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                  {user?.name || t("defaultName")}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#9AAE9B", marginTop: "2px" }}>
                  {t("role")}
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
          <LocaleGuard>{children}</LocaleGuard>
        </main>
      </div>

      <AnnouncementPopupBanner />
    </div>
  );
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const router = useRouter();
  const t = useTranslations("student.layout");

  const { user } = useAuthStore();
  const { data: responseData } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => api.get("/student/notifications").then(r => r.data.data),
    enabled: !!user && user.role === "STUDENT",
    refetchInterval: 60000
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
        <div 
          className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:top-12 sm:right-0 sm:w-[360px] sm:max-w-[calc(100vw-32px)]"
          style={{
            maxHeight: "min(460px, calc(100vh - 80px))",
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E4E8E0",
            boxShadow: "0 16px 40px rgba(26,38,29,0.18)",
            zIndex: 9999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box"
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E8E0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F7F8F5" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1A261D" }}>{t("notifications")}</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllReadMut.mutate()} style={{ background: "none", border: "none", color: "#B88645", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <Check size={12} /> {t("markAllRead")}
              </button>
            )}
          </div>
          <div data-lenis-prevent="true" style={{ maxHeight: "min(400px, calc(100vh - 140px))", overflowY: "auto" }}>
            {data.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#8F9E93", fontSize: "13px" }}>{t("caughtUp")}</div>
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

function AnnouncementPopupBanner() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);

  const { data: responseData } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => api.get("/student/notifications").then((r) => r.data.data),
    enabled: !!user && user.role === "STUDENT",
    refetchInterval: 15000,
  });

  const notifications = responseData?.notifications || [];

  const latestAnnouncement = notifications.find(
    (n: any) =>
      !n.isRead &&
      (n.type === "ANNOUNCEMENT" || n.type === "BROADCAST") &&
      !dismissedIds.includes(n.id)
  );

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.put(`/student/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-notifications"] }),
  });

  if (!latestAnnouncement) return null;

  const handleDismiss = () => {
    setDismissedIds((prev) => [...prev, latestAnnouncement.id]);
  };

  const handleView = () => {
    markReadMut.mutate(latestAnnouncement.id);
    handleDismiss();
    if (latestAnnouncement.link) {
      router.push(latestAnnouncement.link);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        width: "calc(100% - 48px)",
        maxWidth: "420px",
        background: "#FFFFFF",
        color: "#1A261D",
        borderRadius: "20px",
        padding: "20px 22px",
        borderTop: "4px solid #B88645",
        borderRight: "1px solid #EBEEE8",
        borderBottom: "1px solid #EBEEE8",
        borderLeft: "1px solid #EBEEE8",
        boxShadow: "0 16px 40px rgba(26,38,29,0.12), 0 2px 6px rgba(0,0,0,0.04)",
        animation: "slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              background: "rgba(184,134,69,0.12)",
              color: "#B88645",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Megaphone size={18} />
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#B88645", textTransform: "uppercase", letterSpacing: "0.12em", display: "block" }}>
              New Course Announcement
            </span>
            <span style={{ fontSize: "11px", color: "#8F9E93", fontWeight: 500 }}>
              Just now
            </span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            background: "#F7F8F5",
            border: "1px solid #E4E8E0",
            color: "#8F9E93",
            borderRadius: "8px",
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1A261D")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8F9E93")}
        >
          <X size={14} />
        </button>
      </div>

      <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 800, color: "#1A261D", lineHeight: 1.3 }}>
        {latestAnnouncement.title}
      </h4>

      <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#526658", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {latestAnnouncement.body}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={handleView}
          style={{
            flex: 1,
            padding: "9px 16px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #B88645 0%, #A3763A 100%)",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(184,134,69,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <span>View Course</span>
          <ArrowRight size={14} />
        </button>

        <button
          onClick={handleDismiss}
          style={{
            padding: "9px 14px",
            borderRadius: "10px",
            border: "1px solid #E4E8E0",
            background: "#F7F8F5",
            color: "#526658",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

