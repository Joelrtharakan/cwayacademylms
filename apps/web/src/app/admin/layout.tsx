"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import AdminSidebar from "./AdminSidebar";
import { Bell, Search, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    // Attempt to initialize auth state from token refresh cookie on load
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN") {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-cway-dark-green flex flex-col justify-center items-center text-cway-cream">
        <div className="w-10 h-10 border-4 border-cway-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="font-sans text-xs uppercase tracking-widest text-cway-text-muted mt-4">
          Loading Admin Panel...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cway-forest">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-[60px] bg-cway-dark-green border-b border-cway-gold/15 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-lg font-semibold text-white tracking-wide uppercase">
              CWAY Administration
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Trigger */}
            <button className="text-cway-text-muted hover:text-cway-gold transition-colors cursor-pointer">
              <Search size={18} />
            </button>

            {/* Notification Bell */}
            <button className="text-cway-text-muted hover:text-cway-gold transition-colors relative cursor-pointer">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cway-gold rounded-full"></span>
            </button>

            {/* Profile Context */}
            <div className="w-8 h-8 rounded-full border border-cway-gold/20 flex items-center justify-center text-cway-gold bg-white/5">
              <User size={16} />
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 bg-cway-forest text-cway-cream">
          {children}
        </main>
      </div>
    </div>
  );
}
