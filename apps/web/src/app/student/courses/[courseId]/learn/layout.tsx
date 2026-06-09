"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, useAuthStore } from "@/store/auth.store";
import { ArrowLeft, PanelLeft, StickyNote, Bell, CheckCircle, Lock, PlayCircle, FileText, HelpCircle, ClipboardCheck, ChevronDown, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CoursePlayerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const { user } = useAuthStore();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<string, string>>({}); // moduleId -> tabName

  useEffect(() => {
    // Fetch enrollment and progress
    const fetchData = async () => {
      try {
        const enrRes = await api.get(`/student/courses/${courseId}/learn`);
        const enr = enrRes.data.data;
        setEnrollment(enr);

        const progResp = await api.get(`/student/enrollments/${enr.id}/progress`);
        setProgress(progResp.data.data);
        
        // Auto-expand module containing current lesson
        if (lessonId && enr.course.sections) {
          const section = enr.course.sections.find((s: any) => 
            s.lessons.some((l: any) => l.id === lessonId)
          );
          if (section) {
            setExpandedModules(prev => ({ ...prev, [section.id]: true }));
          }
        } else if (enr.course.sections && enr.course.sections.length > 0) {
          // Expand first if no lesson
          setExpandedModules({ [enr.course.sections[0].id]: true });
        }
      } catch (err) {
        console.error("Failed to load course player data", err);
      }
    };
    fetchData();
  }, [courseId, lessonId]);

  if (!enrollment || !progress) {
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
          Loading Course Player...
        </p>
      </div>
    );
  }

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setTab = (moduleId: string, tab: string) => {
    setActiveTab(prev => ({ ...prev, [moduleId]: tab }));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAF7", fontFamily: "var(--font-plus-jakarta), sans-serif", overflow: "hidden" }}>
      <style>{`
        .course-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .course-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .course-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }
        .course-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      `}</style>

      {/* SIDEBAR */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: "320px",
          background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0
        }}
      >
        {/* Decorative radial glow top-right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "180px",
            height: "180px",
            background: "radial-gradient(circle at top right, rgba(184,134,69,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Logo Area */}
        <div
          style={{
            height: "70px",
            padding: "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            zIndex: 2,
            position: "relative"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
            <div style={{ width: "36px", height: "36px", overflow: "hidden", position: "relative", borderRadius: "50%", flexShrink: 0 }}>
               <Image 
                src="/logo.png" 
                alt="CWAY Academy Badge" 
                width={190}
                height={42}
                style={{ objectFit: "cover", objectPosition: "left center", position: "absolute", left: 0, top: "-3px" }} 
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ 
                fontFamily: "var(--font-cinzel), 'Cinzel', Georgia, serif", 
                fontSize: "18px", 
                fontWeight: 700, 
                color: "#FFFFFF", 
                letterSpacing: "0.15em",
                lineHeight: 1
              }}>
                CWAY <span style={{ color: "#D4A35B", fontWeight: 400, letterSpacing: "0.2em" }}>ACADEMY</span>
              </div>
              <div style={{ 
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontSize: "9px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "0.2em", 
                color: "rgba(255,255,255,0.6)", 
                marginTop: "4px" 
              }}>
                Course Player
              </div>
            </div>
          </div>
        </div>

        {/* Course Info & Progress */}
        <div style={{ padding: "20px 20px 16px", zIndex: 2, position: "relative", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button 
            onClick={() => router.push('/student/my-courses')}
            style={{ 
              display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", 
              fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
              marginBottom: "12px", background: "none", border: "none", cursor: "pointer", padding: 0
            }}
          >
            <ArrowLeft size={14} /> Back to Courses
          </button>
          
          <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "20px", color: "#FDFBF7", lineHeight: 1.2, marginBottom: "16px" }}>
            {enrollment.course.title}
          </h2>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Progress
            </span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#D4A35B" }}>
              {Math.round(progress.overallProgress)}%
            </span>
          </div>
          
          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
            <div 
              style={{ height: "100%", background: "#D4A35B", width: `${progress.overallProgress}%`, transition: "width 0.5s ease" }}
            />
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            {progress.completedLessons} of {progress.totalLessons} lessons completed
          </div>
        </div>

        {/* Modules List */}
        <div className="course-sidebar-scroll" style={{ flex: 1, overflowY: "auto", zIndex: 2, position: "relative" }}>
          {progress.moduleProgress.map((mod: any, index: number) => {
            const isExpanded = expandedModules[mod.moduleId];
            const isAllComplete = mod.completedLessons === mod.totalLessons && mod.totalLessons > 0;
            const isSomeComplete = mod.completedLessons > 0 && mod.completedLessons < mod.totalLessons;
            const tab = activeTab[mod.moduleId] || "lessons";

            return (
              <div key={mod.moduleId} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <button 
                  onClick={() => toggleModule(mod.moduleId)}
                  style={{
                    width: "100%", textAlign: "left", padding: "16px 20px", background: isExpanded ? "rgba(255,255,255,0.03)" : "transparent",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isExpanded ? "rgba(255,255,255,0.03)" : "transparent"; }}
                >
                  <ChevronRight 
                    size={16} 
                    style={{ 
                      color: isExpanded ? "#D4A35B" : "rgba(255,255,255,0.3)", 
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", 
                      transition: "all 0.2s" 
                    }} 
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: isExpanded ? "#FDFBF7" : "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" }}>
                      Module {index + 1}: {mod.moduleTitle}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      {mod.completedLessons}/{mod.totalLessons} lessons
                    </div>
                  </div>
                  {isAllComplete && <CheckCircle size={16} style={{ color: "#4A8C5C" }} />}
                  {isSomeComplete && !isAllComplete && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D4A35B" }} />}
                </button>

                {isExpanded && (
                  <div style={{ background: "rgba(0,0,0,0.2)", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: "16px", overflowX: "auto" }}>
                      {["lessons", "readings", "assignments", "quizzes"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTab(mod.moduleId, t)}
                          style={{
                            background: "none", border: "none", borderBottom: `2px solid ${tab === t ? "#D4A35B" : "transparent"}`,
                            padding: "10px 0 8px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                            color: tab === t ? "#D4A35B" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding: "8px 12px" }}>
                      {tab === "lessons" && mod.lessons.map((lesson: any) => {
                        const isActive = lesson.lessonId === lessonId;
                        let Icon = FileText;
                        if (lesson.type === "VIDEO") Icon = PlayCircle;
                        if (lesson.type === "QUIZ") Icon = HelpCircle;
                        if (lesson.type === "ASSIGNMENT") Icon = ClipboardCheck;

                        return (
                          <Link 
                            key={lesson.lessonId}
                            href={`/student/courses/${courseId}/learn/${lesson.lessonId}`}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 12px", borderRadius: "8px",
                              textDecoration: "none", position: "relative",
                              background: isActive ? "rgba(184,134,69,0.18)" : "transparent",
                              marginBottom: "4px"
                            }}
                          >
                            {isActive && (
                              <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: "3px", background: "#D4A35B", borderRadius: "0 4px 4px 0" }} />
                            )}
                            <Icon size={16} style={{ marginTop: "2px", color: isActive ? "#D4A35B" : "rgba(255,255,255,0.5)", flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontSize: "13px", fontWeight: isActive ? 600 : 500, 
                                color: isActive ? "#D4A35B" : lesson.isCompleted ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)", 
                                textDecoration: lesson.isCompleted && !isActive ? "line-through" : "none"
                              }}>
                                {lesson.lessonTitle}
                              </div>
                            </div>
                            <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                              {lesson.isCompleted ? (
                                <CheckCircle size={16} style={{ color: "#4A8C5C" }} />
                              ) : isActive ? (
                                <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #D4A35B", position: "relative" }}>
                                  <div style={{ position: "absolute", inset: 2, background: "#D4A35B", borderRadius: "50%", opacity: 0.5 }} />
                                </div>
                              ) : (
                                <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)" }} />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                      {tab !== "lessons" && (
                        <div style={{ padding: "16px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                          No {tab} in this module.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 30 }}
          className="md:hidden"
        />
      )}

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", position: "relative" }}>

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
            padding: "0 28px",
            flexShrink: 0,
            zIndex: 20,
          }}
        >
          {/* Left side (Mobile Toggle) */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
              style={{ background: "none", border: "none", padding: "8px", cursor: "pointer", color: "#1A261D" }}
            >
              <PanelLeft size={20} />
            </button>
            <div className="hidden md:block" style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D" }}>
              {enrollment.course.title}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setIsNotesOpen(true)}
              style={{
                width: "38px", height: "38px", borderRadius: "10px", background: "#F7F8F5", border: "1px solid #E4E8E0",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9AAE9B", transition: "all 0.15s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.color = "#B88645"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.color = "#9AAE9B"; }}
              title="My Notes"
            >
              <StickyNote size={15} />
            </button>

            <button
              style={{
                position: "relative", width: "38px", height: "38px", borderRadius: "10px", background: "#F7F8F5", border: "1px solid #E4E8E0",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9AAE9B", transition: "all 0.15s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.color = "#B88645"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.color = "#9AAE9B"; }}
            >
              <Bell size={15} />
            </button>

            <div style={{ width: "1px", height: "24px", background: "#E4E8E0", margin: "0 4px" }} />

            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "default" }}>
              <div
                style={{
                  width: "36px", height: "36px", borderRadius: "50%", background: "rgba(184,134,69,0.1)", border: "1.5px solid rgba(184,134,69,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#B88645", textTransform: "uppercase"
                }}
              >
                {user?.name?.slice(0, 2) || "ST"}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {children}
        </main>

        {/* NOTES PANEL OVERLAY */}
        <div 
          style={{
            position: "absolute", top: 0, bottom: 0, right: 0, width: "340px",
            background: "#FFFFFF", borderLeft: "1px solid #E4E8E0", boxShadow: "-4px 0 24px rgba(0,0,0,0.05)",
            transform: isNotesOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 30, display: "flex", flexDirection: "column"
          }}
        >
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #E4E8E0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFAF7" }}>
            <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "20px", color: "#1A261D", margin: 0 }}>My Notes</h2>
            <button 
              onClick={() => setIsNotesOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9AAE9B", fontSize: "24px", padding: "0 4px" }}
            >
              &times;
            </button>
          </div>
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", background: "#FAFAF7" }}>
            <div style={{ fontSize: "13px", color: "#8F9E93", textAlign: "center", marginTop: "40px" }}>No notes yet for this lesson.</div>
          </div>
          <div style={{ padding: "20px 24px", borderTop: "1px solid #E4E8E0", background: "#FFFFFF" }}>
            <textarea 
              style={{
                width: "100%", background: "#F7F8F5", border: "1px solid #E4E8E0", borderRadius: "10px", padding: "14px",
                fontSize: "13px", color: "#1A261D", outline: "none", resize: "none", fontFamily: "inherit"
              }}
              rows={4}
              placeholder="Type your note here..."
              onFocus={(e) => { e.target.style.borderColor = "#B88645"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E4E8E0"; }}
            />
            <button 
              style={{
                width: "100%", marginTop: "12px", background: "#1A261D", color: "#FFFFFF", padding: "14px", borderRadius: "10px",
                fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#2D3E31"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#1A261D"}
            >
              Save Note
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
