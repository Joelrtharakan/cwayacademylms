"use client";

import React from "react";
import Link from "next/link";
import { THEME } from "@/lib/cway-theme";
import { ChevronLeft, Menu, FileText } from "lucide-react";
import { usePlayerStore } from "@/store/player.store";

interface PlayerNavbarProps {
  courseTitle: string;
  progress: number;
}

export default function PlayerNavbar({ courseTitle, progress }: PlayerNavbarProps) {
  const { toggleNotesPanel } = usePlayerStore();

  return (
    <div style={{ 
      height: 60, 
      background: THEME.HERO, 
      borderBottom: `1px solid rgba(201,151,58,0.2)`,
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: "0 24px",
      color: THEME.LIGHT,
      position: "sticky",
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/student/dashboard" style={{ color: THEME.MUTED, display: "flex", alignItems: "center", textDecoration: "none" }}>
          <ChevronLeft size={20} />
          <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4 }} className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
        <h1 style={{ fontSize: 16, fontWeight: 600, color: THEME.LIGHT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>
          {courseTitle}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Progress Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hidden md:flex">
          <div style={{ fontSize: 12, fontWeight: 600, color: THEME.MUTED }}>{Math.round(progress)}% COMPLETE</div>
          <div style={{ width: 120, height: 6, background: "rgba(201,151,58,0.2)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `\${progress}%`, height: "100%", background: THEME.GOLD, borderRadius: 3, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Notes Toggle */}
        <button 
          onClick={toggleNotesPanel}
          style={{ 
            background: "transparent", border: "1px solid rgba(201,151,58,0.3)", borderRadius: 6,
            padding: "6px 12px", color: THEME.GOLD, display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,151,58,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <FileText size={16} /> <span className="hidden sm:inline">Notes</span>
        </button>

        <button className="sm:hidden" style={{ background: "none", border: "none", color: THEME.LIGHT }}>
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}
