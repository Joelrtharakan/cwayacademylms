"use client";

import React, { useState } from "react";
import { THEME } from "@/lib/cway-theme";
import { usePlayerStore } from "@/store/player.store";
import { PlayCircle, FileText, CheckCircle, ChevronDown, ChevronRight, MessageCircle, Info, HelpCircle, ClipboardList, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PlayerSidebarProps {
  courseId: string;
  modules: any[];
}

export default function PlayerSidebar({ courseId, modules }: PlayerSidebarProps) {
  const { activeTab, setActiveTab } = usePlayerStore();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    // Expand first module by default
    const state: any = {};
    if (modules && modules.length > 0) {
      state[modules[0].id] = true;
    }
    return state;
  });
  const pathname = usePathname();

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { id: 'lessons', icon: PlayCircle, label: "Lessons" },
    { id: 'readings', icon: BookOpen, label: "Readings" },
    { id: 'assignments', icon: ClipboardList, label: "Assignments" },
    { id: 'quizzes', icon: HelpCircle, label: "Quizzes" },
    { id: 'discussions', icon: MessageCircle, label: "Discussions" },
    { id: 'announcements', icon: Info, label: "Announcements" },
  ];

  return (
    <div style={{ width: 320, background: "white", borderRight: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "100%" }}>
      
      {/* Tabs */}
      <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "12px 16px 0", gap: 16 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: "none", border: "none",
              padding: "8px 4px", cursor: "pointer",
              color: activeTab === tab.id ? THEME.GOLD : THEME.MUTED,
              borderBottom: activeTab === tab.id ? `2px solid \${THEME.GOLD}` : "2px solid transparent",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500,
              whiteSpace: "nowrap", transition: "all 0.2s"
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        
        {activeTab === 'lessons' && (
          <div style={{ padding: "16px 0" }}>
            {modules.map((mod: any, index: number) => (
              <div key={mod.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <button 
                  onClick={() => toggleModule(mod.id)}
                  style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      Module {index + 1}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: THEME.HERO }}>{mod.title}</div>
                  </div>
                  {expandedModules[mod.id] ? <ChevronDown size={18} color={THEME.MUTED} /> : <ChevronRight size={18} color={THEME.MUTED} />}
                </button>

                {expandedModules[mod.id] && (
                  <div style={{ padding: "0 0 16px", background: "rgba(0,0,0,0.01)" }}>
                    {mod.lessons?.map((lesson: any) => {
                      const isActive = pathname?.includes(`/learn/\${lesson.id}`);
                      return (
                        <Link 
                          key={lesson.id} 
                          href={`/student/courses/\${courseId}/learn/\${lesson.id}`}
                          style={{ 
                            display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px",
                            textDecoration: "none", transition: "background 0.2s",
                            background: isActive ? "rgba(201,151,58,0.05)" : "transparent",
                            borderLeft: isActive ? `3px solid \${THEME.GOLD}` : "3px solid transparent"
                          }}
                        >
                          <div style={{ marginTop: 2 }}>
                            {lesson.isCompleted ? (
                              <CheckCircle size={16} color="#8A9E8C" />
                            ) : (
                              lesson.type === "VIDEO" ? <PlayCircle size={16} color={THEME.MUTED} /> :
                              lesson.type === "TEXT" ? <FileText size={16} color={THEME.MUTED} /> :
                              lesson.type === "QUIZ" ? <HelpCircle size={16} color={THEME.MUTED} /> :
                              <ClipboardList size={16} color={THEME.MUTED} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? THEME.HERO : THEME.TEXT, marginBottom: 4, lineHeight: 1.4 }}>
                              {lesson.title}
                            </div>
                            <div style={{ fontSize: 12, color: THEME.MUTED }}>
                              {lesson.type === "VIDEO" && lesson.duration ? `\${Math.round(lesson.duration / 60)} min` : lesson.type}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab !== 'lessons' && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ background: "rgba(201,151,58,0.1)", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: THEME.GOLD, margin: "0 auto 16px" }}>
               <Info size={24} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: THEME.HERO, marginBottom: 8 }}>Coming soon</h3>
            <p style={{ fontSize: 14, color: THEME.MUTED }}>This section is currently under development.</p>
          </div>
        )}

      </div>
    </div>
  );
}
