"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, useAuthStore } from "@/store/auth.store";
import { ArrowLeft, PanelLeft, StickyNote, Bell, CheckCircle, Lock, PlayCircle, FileText, HelpCircle, ClipboardCheck, ChevronDown, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { THEME } from "@/lib/constants";

export default function CoursePlayerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

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
        const progRes = await api.get(`/student/enrollments/progress-by-course/${courseId}`);
        // The backend might not have this exact route, wait, in student.controller it was:
        // router.get("/enrollments/:enrollmentId/progress", getProgress)
        // router.get("/courses/:courseId/learn", getCourseEnrollment)
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
      <div className="min-h-screen bg-[#1C2B1E] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#C9973A] border-t-transparent rounded-full" />
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
    <div className="flex flex-col min-h-screen bg-[#1C2B1E] text-[#F5F0E8] font-sans selection:bg-[#C9973A] selection:text-[#1C2B1E]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 h-16 bg-[#243825] border-b border-[rgba(201,151,58,0.2)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/student/my-courses')}
            className="p-2 hover:bg-[#1C2B1E] rounded-md transition-colors text-[#8A9E8C] hover:text-[#F5F0E8]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-[rgba(201,151,58,0.2)]" />
          <h1 className="font-serif text-lg font-semibold truncate max-w-[200px] md:max-w-md">
            {enrollment.course.title}
          </h1>
        </div>

        <div className="hidden md:flex flex-col items-center flex-1 max-w-xs mx-4">
          <div className="w-full h-1.5 bg-[rgba(201,151,58,0.15)] rounded-full overflow-hidden mb-1">
            <div 
              className="h-full bg-[#C9973A] transition-all duration-500 ease-out"
              style={{ width: `${progress.overallProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-[#8A9E8C] uppercase tracking-wider">
            {Math.round(progress.overallProgress)}% Complete
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsNotesOpen(true)}
            className="p-2 hover:bg-[#1C2B1E] rounded-md transition-colors text-[#8A9E8C] hover:text-[#F5F0E8]"
            title="My Notes"
          >
            <StickyNote className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[#1C2B1E] rounded-md transition-colors text-[#8A9E8C] hover:text-[#F5F0E8] relative">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 hover:bg-[#1C2B1E] rounded-md transition-colors text-[#8A9E8C] hover:text-[#F5F0E8]"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-30
          w-80 bg-[#1C2B1E] border-r border-[rgba(201,151,58,0.15)]
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0 pt-16 md:pt-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-5 border-b border-[rgba(201,151,58,0.15)] shrink-0">
            <h2 className="font-serif text-lg font-semibold text-[#F5F0E8] mb-1">Course Content</h2>
            <div className="text-xs text-[#8A9E8C] mb-3">
              {progress.completedLessons} / {progress.totalLessons} lessons
            </div>
            <div className="w-full h-1 bg-[#243825] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#C9973A] transition-all"
                style={{ width: `${progress.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {progress.moduleProgress.map((mod: any, index: number) => {
              const isExpanded = expandedModules[mod.moduleId];
              const isAllComplete = mod.completedLessons === mod.totalLessons && mod.totalLessons > 0;
              const isSomeComplete = mod.completedLessons > 0 && mod.completedLessons < mod.totalLessons;
              const sectionData = enrollment.course.sections.find((s: any) => s.id === mod.moduleId);
              const tab = activeTab[mod.moduleId] || "lessons";

              return (
                <div key={mod.moduleId} className="border-b border-[rgba(201,151,58,0.1)]">
                  <button 
                    onClick={() => toggleModule(mod.moduleId)}
                    className="w-full text-left p-4 hover:bg-[rgba(201,151,58,0.05)] transition-colors flex items-center gap-3"
                  >
                    <ChevronRight className={`w-4 h-4 text-[#C9973A] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isAllComplete ? 'bg-[#4A8C5C] text-white' : isSomeComplete ? 'bg-[#C9973A] text-[#1C2B1E]' : 'bg-[#243825] text-[#8A9E8C]'}`}>
                      M{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#F5F0E8] truncate">{mod.moduleTitle}</div>
                      <div className="text-[11px] text-[#8A9E8C]">{mod.completedLessons}/{mod.totalLessons} lessons</div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-[#1a251b] pb-2">
                      <div className="flex px-4 py-2 gap-4 text-[11px] uppercase tracking-wider border-b border-[rgba(201,151,58,0.05)] overflow-x-auto no-scrollbar">
                        <button onClick={() => setTab(mod.moduleId, "lessons")} className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${tab === 'lessons' ? 'border-[#C9973A] text-[#C9973A]' : 'border-transparent text-[#8A9E8C] hover:text-[#F5F0E8]'}`}>
                          Lessons
                        </button>
                        <button onClick={() => setTab(mod.moduleId, "readings")} className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${tab === 'readings' ? 'border-[#C9973A] text-[#C9973A]' : 'border-transparent text-[#8A9E8C] hover:text-[#F5F0E8]'}`}>
                          Readings
                        </button>
                        <button onClick={() => setTab(mod.moduleId, "assignments")} className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${tab === 'assignments' ? 'border-[#C9973A] text-[#C9973A]' : 'border-transparent text-[#8A9E8C] hover:text-[#F5F0E8]'}`}>
                          Assignments
                        </button>
                        <button onClick={() => setTab(mod.moduleId, "quizzes")} className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${tab === 'quizzes' ? 'border-[#C9973A] text-[#C9973A]' : 'border-transparent text-[#8A9E8C] hover:text-[#F5F0E8]'}`}>
                          Quizzes
                        </button>
                      </div>

                      <div className="py-2">
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
                              className={`block px-4 py-3 text-sm flex items-start gap-3 transition-colors ${isActive ? 'bg-[rgba(201,151,58,0.08)] border-l-2 border-[#C9973A]' : 'hover:bg-[#243825] border-l-2 border-transparent'}`}
                            >
                              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${lesson.type === 'VIDEO' ? 'text-[#C9973A]' : lesson.type === 'ASSIGNMENT' ? 'text-[#4A8C5C]' : lesson.type === 'QUIZ' ? 'text-amber-500' : 'text-blue-400'}`} />
                              <div className="flex-1 min-w-0">
                                <div className={`truncate ${isActive ? 'text-[#C9973A] font-semibold' : lesson.isCompleted ? 'text-[#8A9E8C] line-through decoration-[rgba(138,158,140,0.5)]' : 'text-[#F5F0E8]'}`}>
                                  {lesson.lessonTitle}
                                </div>
                              </div>
                              <div className="shrink-0 ml-2">
                                {lesson.isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-[#4A8C5C]" />
                                ) : isActive ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-[#C9973A] animate-pulse" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-[#8A9E8C]" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                        {/* Stubs for other tabs */}
                        {tab !== "lessons" && (
                          <div className="px-4 py-3 text-xs text-[#8A9E8C]">
                            Content for {tab} will appear here.
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
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-[#1C2B1E] overflow-y-auto relative">
          {children}
        </main>

        {/* NOTES PANEL OVERLAY */}
        <div className={`
          absolute top-0 bottom-0 right-0 z-50 w-80 bg-[#243825] border-l border-[rgba(201,151,58,0.2)]
          transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
          ${isNotesOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-4 border-b border-[rgba(201,151,58,0.15)] flex justify-between items-center bg-[#1C2B1E]">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#F5F0E8]">My Notes</h2>
            </div>
            <button 
              onClick={() => setIsNotesOpen(false)}
              className="text-[#8A9E8C] hover:text-[#F5F0E8] text-xl px-2"
            >
              &times;
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="text-sm text-[#8A9E8C] text-center mt-10">No notes yet for this lesson</div>
          </div>
          <div className="p-4 border-t border-[rgba(201,151,58,0.15)] bg-[#1C2B1E]">
            <textarea 
              className="w-full bg-[#243825] border border-[rgba(201,151,58,0.2)] rounded-lg p-3 text-sm text-[#F5F0E8] placeholder-[#8A9E8C] focus:outline-none focus:border-[#C9973A] resize-none"
              rows={3}
              placeholder="Type your note here..."
            />
            <button className="w-full mt-2 bg-[#C9973A] text-[#1C2B1E] py-2 rounded-lg font-semibold text-sm hover:bg-[#A8792A] transition-colors">
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
