"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { Bell, Menu, X, LogOut, BookOpen, GraduationCap, Award, ClipboardCheck } from "lucide-react";

export default function StudentTopnav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/student/dashboard", icon: GraduationCap },
    { name: "My Courses", href: "/student/my-courses", icon: BookOpen },
    { name: "Assignments", href: "/student/assignments", icon: ClipboardCheck },
    { name: "Certificates", href: "/student/certificates", icon: Award },
  ];

  const handleSignOut = () => {
    clearAuth();
    toast.success("Successfully logged out");
    router.push("/login");
  };

  return (
    <nav className="bg-cway-dark-green text-cway-cream border-b border-cway-gold/15 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/student/dashboard" className="flex-shrink-0">
              <img
                src="https://cwayacademy.netlify.app/logo.png?v=3"
                alt="CWAY Academy"
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-sans font-semibold tracking-wide uppercase transition-all duration-150 border-b-2 hover:text-cway-gold ${
                    isActive ? "border-cway-gold text-cway-gold" : "border-transparent text-cway-text-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notification Bell */}
            <button className="text-cway-text-muted hover:text-cway-gold transition-colors relative cursor-pointer">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cway-gold rounded-full"></span>
            </button>

            {/* User Profile Context */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="text-right">
                <div className="text-xs font-semibold text-white">{user?.name || "Student"}</div>
                <div className="text-[10px] text-cway-text-muted uppercase tracking-widest font-semibold">{user?.role}</div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="text-cway-text-muted hover:text-cway-danger transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-cway-text-muted hover:text-cway-gold transition-colors p-2 cursor-pointer"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-cway-dark-green border-t border-white/5 py-3 px-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans font-semibold uppercase tracking-wider transition-all ${
                  isActive ? "bg-cway-gold/10 text-cway-gold border-l-3 border-cway-gold" : "text-cway-text-muted hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
            <div className="text-xs text-cway-text-muted px-4 font-semibold">
              Signed in as: <span className="text-white">{user?.name}</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-sans font-semibold text-cway-danger hover:bg-white/5 cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
