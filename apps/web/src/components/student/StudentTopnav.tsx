"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Bell, Menu, X, LogOut, Settings, User as UserIcon } from "lucide-react";
import { THEME } from "@/lib/cway-theme";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";

export default function StudentTopnav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: notificationsData } = useQuery({
    queryKey: ["studentNotifications"],
    queryFn: () => api.get("/student/notifications").then(res => res.data.data),
    refetchInterval: 30000, // Poll every 30s
  });

  const unreadCount = notificationsData?.unreadCount || 0;

  const links = [
    { href: "/student/dashboard", label: "Dashboard" },
    { href: "/student/my-courses", label: "My Courses" },
    { href: "/student/assignments", label: "Assignments" },
    { href: "/student/certificates", label: "Certificates" },
  ];

  return (
    <nav style={{ background: THEME.HERO, height: 64, borderBottom: `1px solid rgba(201,151,58,0.15)`, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/student/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/logo.png" alt="CWAY Academy" style={{ height: 32, objectFit: "contain" }} />
          </Link>

          {/* Center: Desktop Links */}
          <div className="desktop-only" style={{ display: "none", alignItems: "center", gap: 24 }}>
            {links.map(link => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: active ? THEME.GOLD : THEME.MUTED,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    textDecoration: "none",
                    position: "relative",
                    padding: "22px 0"
                  }}
                >
                  {link.label}
                  {active && (
                    <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: THEME.GOLD }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          
          <Link href="/student/dashboard" style={{ position: "relative", color: THEME.MUTED, padding: 8, textDecoration: "none" }}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: 6, right: 6, background: THEME.GOLD, color: THEME.HERO, fontSize: 10, fontWeight: 700, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <div className="desktop-only" style={{ display: "none", position: "relative" }}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}
            >
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: THEME.LIGHT, fontWeight: 500 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>{user?.role}</div>
              </div>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,151,58,0.1)", color: THEME.GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                  {user?.name?.charAt(0)}
                </div>
              )}
            </button>

            {dropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 220, background: THEME.HERO, border: `1px solid rgba(201,151,58,0.2)`, borderRadius: 8, overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
                <div style={{ padding: 16, borderBottom: `1px solid rgba(201,151,58,0.1)` }}>
                  <div style={{ color: THEME.LIGHT, fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ color: THEME.MUTED, fontSize: 12, marginTop: 2 }}>{user?.email}</div>
                </div>
                <div style={{ padding: 8 }}>
                  <Link href="/student/settings" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", color: THEME.LIGHT, textDecoration: "none", fontSize: 14, borderRadius: 6 }}>
                    <Settings size={16} color={THEME.MUTED} /> Profile & Settings
                  </Link>
                  <button onClick={() => { setDropdownOpen(false); logout(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", color: THEME.DANGER, background: "none", border: "none", cursor: "pointer", fontSize: 14, borderRadius: 6, textAlign: "left" }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: "block", background: "none", border: "none", color: THEME.LIGHT, padding: 8 }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ position: "absolute", top: 64, left: 0, right: 0, background: THEME.HERO, borderBottom: `1px solid rgba(201,151,58,0.2)`, padding: "16px 24px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
          {links.map(link => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: active ? THEME.GOLD : THEME.LIGHT,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 16,
                  fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: `1px solid rgba(201,151,58,0.1)`
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/student/settings" onClick={() => setMobileMenuOpen(false)} style={{ color: THEME.LIGHT, fontFamily: "Inter, sans-serif", fontSize: 16, textDecoration: "none", padding: "12px 0", borderBottom: `1px solid rgba(201,151,58,0.1)`, display: "flex", alignItems: "center", gap: 12 }}>
            <Settings size={18} color={THEME.MUTED} /> Profile & Settings
          </Link>
          <button onClick={() => { setMobileMenuOpen(false); logout(); }} style={{ color: THEME.DANGER, fontFamily: "Inter, sans-serif", fontSize: 16, textAlign: "left", padding: "12px 0", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-only { display: flex !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
