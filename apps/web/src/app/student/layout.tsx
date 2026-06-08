"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import StudentTopnav from "@/components/student/StudentTopnav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const isPlayer = pathname ? pathname.includes('/learn') : false;

  return (
    <div className="min-h-screen bg-cway-cream flex flex-col">
      {/* Top Navbar */}
      {!isPlayer && <StudentTopnav />}

      {/* Content Workspace */}
      <main className="flex-1 w-full mx-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}
