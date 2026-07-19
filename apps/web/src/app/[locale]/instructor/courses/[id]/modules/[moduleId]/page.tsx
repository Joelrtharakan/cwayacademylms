"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { getModules } from "@/lib/api/modules";
import { useCourseBuilderStore } from "@/store/course-builder.store";
import { ArrowLeft, Play, BookOpen, FileText, Award, Info, ExternalLink, Loader2, Plus, MessageSquare, Menu, Sidebar } from "lucide-react";
import Link from "next/link";

import dynamic from "next/dynamic";

const LoadingState = () => (
  <div className="w-full h-[400px] flex items-center justify-center">
    <Loader2 size={32} className="animate-spin text-[#B88645]" />
  </div>
);

const ModuleOverviewPanel = dynamic(() => import("./_components/OverviewPanel"), { loading: LoadingState });
const VideosPanel = dynamic(() => import("./_components/VideosPanel"), { loading: LoadingState });
const ReadingsPanel = dynamic(() => import("./_components/ReadingsPanel"), { loading: LoadingState });
const AssignmentsPanel = dynamic(() => import("./_components/AssignmentsPanel"), { loading: LoadingState });
const QuizzesPanel = dynamic(() => import("./_components/QuizzesPanel"), { loading: LoadingState });
const ForumsPanel = dynamic(() => import("./_components/ForumsPanel"), { loading: LoadingState });

export default function ModuleManagementPage() {
  const { id, moduleId } = useParams() as { id: string; moduleId: string };
  const router = useRouter();
  
  const { activeTab, setActiveTab } = useCourseBuilderStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data),
  });

  // We fetch all modules to find this specific one and allow quick switching if needed later
  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules", id],
    queryFn: () => getModules(id),
  });

  const currentModule = modules?.find((m: any) => m.id === moduleId);

  if (courseLoading || modulesLoading) {
    return (
      <div style={{ display: "flex", minHeight: "calc(100vh - 70px)", width: "100%", alignItems: "center", justifyContent: "center", background: "#F7F8F5" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} />
      </div>
    );
  }

  if (!course || !currentModule) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: "#F7F8F5", minHeight: "100vh" }}>
        <h2 style={{ fontFamily: "Georgia, serif", color: "#1A261D" }}>Module not found</h2>
        <Link href={`/instructor/courses/${id}`} style={{ color: "#B88645", textDecoration: "underline" }}>Back to Course</Link>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "videos", label: "Videos", icon: Play },
    { id: "readings", label: "Reading Materials", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "quizzes", label: "Quizzes", icon: Award },
    { id: "forums", label: "Learning Forums", icon: MessageSquare },
  ] as const;

  return (
    <div style={{ minHeight: "calc(100vh - 70px)", margin: "-32px -36px", background: "#F7F8F5", color: "#1A261D", display: "flex", flexDirection: "column" }}>
      
      {/* Sticky Top Header */}
      <header style={{ position: "sticky", top: "70px", zIndex: 20, background: "#FFFFFF", padding: "28px 40px 24px", borderBottom: "4px solid #B88645", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#1A261D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button 
            className="flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-[#F3F4F0]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Sidebar size={20} />
          </button>
          <div style={{ height: "24px", width: "1px", background: "#E4E8E0" }}></div>
          <Link href={`/instructor/courses/${id}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8F9E93", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F5F0E8"} onMouseLeave={(e) => e.currentTarget.style.color = "#8A9E8C"}>
            <ArrowLeft size={18} /> {course.title}
          </Link>
          <div style={{ height: "24px", width: "1px", background: "rgba(184,134,69,0.3)" }}></div>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, margin: 0, color: "#B88645" }}>{currentModule.title}</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Premium Sidebar Tabs */}
        <div 
          className="bg-[#FAFBF9] border-b md:border-b-0 md:border-r border-[#E4E8E0]/80 shrink-0 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto transition-all duration-300 ease-in-out" 
          style={{ 
            paddingTop: isSidebarOpen ? "20px" : "0", 
            paddingBottom: isSidebarOpen ? "40px" : "0", 
            width: isSidebarOpen ? "280px" : "0px",
            opacity: isSidebarOpen ? 1 : 0,
            visibility: isSidebarOpen ? "visible" : "hidden"
          }}
        >
          <div style={{ paddingLeft: "32px", paddingRight: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: 800, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px", lineHeight: "1.5", whiteSpace: "nowrap" }}>
              Manage Content
            </h2>
            <div style={{ height: "2px", width: "32px", background: "#D4AF37", borderRadius: "999px", opacity: 0.6 }}></div>
          </div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px", paddingRight: "24px" }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group cursor-pointer border-none text-left transition-all duration-300 ease-out relative overflow-hidden ${
                      isActive 
                        ? "bg-gradient-to-r from-[#B88645] to-[#D4AF37] shadow-[0_6px_16px_rgba(184,134,69,0.25)]" 
                        : "bg-transparent hover:bg-[#F0F2EB]/80"
                    }`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "14px 20px",
                      borderRadius: "16px",
                      width: "100%",
                      transform: isActive ? "translateY(-1px)" : "none"
                    }}
                  >
                  {/* Subtle active indicator border */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 bg-white/40" style={{ width: "6px", borderTopLeftRadius: "16px", borderBottomLeftRadius: "16px" }}></div>
                  )}
                  
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-300 group-hover:scale-110 shrink-0 ${isActive ? "text-white" : "text-[#8A9E8C]"}`} 
                  />
                  
                  <span 
                    className={`transition-all duration-300 ${isActive ? "text-white tracking-wide" : "text-[#4A5568]"}`}
                    style={{ fontSize: "15px", fontWeight: isActive ? 700 : 500 }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div id="module-content-area" className="flex-1 overflow-y-auto" style={{ padding: "40px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {activeTab === "overview" && <ModuleOverviewPanel module={currentModule} />}
            {activeTab === "videos" && <VideosPanel module={currentModule} />}
            {activeTab === "readings" && <ReadingsPanel module={currentModule} />}
            {activeTab === "assignments" && <AssignmentsPanel module={currentModule} />}
            {activeTab === "quizzes" && <QuizzesPanel module={currentModule} />}
            {activeTab === "forums" && <ForumsPanel module={currentModule} />}
          </div>
        </div>

      </div>

    </div>
  );
}
