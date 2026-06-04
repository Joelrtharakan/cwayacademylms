"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export default function InstructorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections: SidebarSection[] = [
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

  const handleSignOut = () => {
    clearAuth();
    toast.success("Successfully logged out");
    router.push("/login");
  };

  return (
    <div
      className={`bg-cway-dark-green text-cway-cream min-h-screen border-r border-cway-gold/15 transition-all duration-300 flex flex-col justify-between relative ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-cway-gold text-cway-dark-green rounded-full p-1 border border-cway-gold hover:bg-cway-gold-light transition-colors z-50 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Top Section */}
      <div>
        <div className={`p-6 flex flex-col items-center ${isCollapsed ? "px-2" : "px-6"}`}>
          <img
            src="https://cwayacademy.netlify.app/logo.png?v=3"
            alt="CWAY Academy"
            className={`transition-all duration-300 object-contain ${
              isCollapsed ? "h-6 w-6" : "h-10 w-auto"
            }`}
          />
          {!isCollapsed && (
            <span className="text-[10px] uppercase tracking-widest font-sans font-semibold text-cway-gold mt-2.5">
              Instructor Panel
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-2 space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="font-serif text-[11px] uppercase tracking-wider text-cway-gold/85 px-3 py-1 mt-2">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`nav-item ${isActive ? "nav-item-active" : ""} ${
                      isCollapsed ? "justify-center px-0" : ""
                    }`}
                  >
                    <Icon size={isCollapsed ? 20 : 16} className={isActive ? "text-cway-gold" : "text-cway-text-muted"} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className={`p-4 border-t border-white/10 ${isCollapsed ? "px-2" : "p-4"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-cway-gold text-cway-dark-green font-sans font-bold flex items-center justify-center uppercase text-sm">
              {user?.name?.slice(0, 2) || "IN"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate text-white">{user?.name || "Instructor"}</div>
              <div className="text-[10px] text-cway-text-muted truncate">{user?.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans text-cway-text-muted hover:text-cway-danger hover:bg-white/5 transition-all duration-150 cursor-pointer ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}
