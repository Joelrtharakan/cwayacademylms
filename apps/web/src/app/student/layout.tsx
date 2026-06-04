"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import StudentTopnav from "./StudentTopnav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-cway-cream flex flex-col justify-center items-center text-cway-dark-green">
        <div className="w-10 h-10 border-4 border-cway-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="font-sans text-xs uppercase tracking-widest text-cway-gold-muted mt-4">
          Loading LMS Classroom...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cway-cream flex flex-col">
      {/* Top Navbar */}
      <StudentTopnav />

      {/* Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
