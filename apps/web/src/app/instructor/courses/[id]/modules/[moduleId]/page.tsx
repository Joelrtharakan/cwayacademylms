"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { getModules } from "@/lib/api/modules";
import { useCourseBuilderStore } from "@/store/course-builder.store";
import { ArrowLeft, Play, BookOpen, FileText, Award, Info, ExternalLink, Loader2, Plus, MessageSquare } from "lucide-react";
import Link from "next/link";

// Panels (To be created)
import ModuleOverviewPanel from "./_components/OverviewPanel";
import VideosPanel from "./_components/VideosPanel";
import ReadingsPanel from "./_components/ReadingsPanel";
import AssignmentsPanel from "./_components/AssignmentsPanel";
import QuizzesPanel from "./_components/QuizzesPanel";
import ForumsPanel from "./_components/ForumsPanel";

export default function ModuleManagementPage() {
  const { id, moduleId } = useParams() as { id: string; moduleId: string };
  const router = useRouter();
  
  const { activeTab, setActiveTab } = useCourseBuilderStore();

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
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F7F8F5" }}>
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
      <header style={{ position: "sticky", top: "70px", zIndex: 20, background: "#FFFFFF", padding: "16px 40px", borderBottom: "4px solid #B88645", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#1A261D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-[260px] bg-white border-b md:border-b-0 md:border-r border-[#E4E8E0] py-4 md:py-6 shrink-0 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto">
          <h2 className="text-[11px] font-bold text-[#8F9E93] uppercase tracking-widest px-4 md:px-6 mb-4">Manage Content</h2>
          <nav className="flex md:flex-col min-w-max md:min-w-0 pb-2 md:pb-0 px-2 md:px-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 cursor-pointer border-none text-left transition-all ${
                      isActive 
                        ? "bg-[rgba(184,134,69,0.1)] border-b-4 md:border-b-0 md:border-r-4 border-[#B88645]" 
                        : "bg-transparent border-b-4 md:border-b-0 md:border-r-4 border-transparent hover:bg-[#F7F8F5]"
                    }`}
                  >
                  <Icon size={18} color={isActive ? "#B88645" : "#8A9E8C"} />
                  <span style={{ fontSize: "14px", fontWeight: isActive ? 700 : 500, color: isActive ? "#1C2B1E" : "#4A5568" }}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div id="module-content-area" className="flex-1 p-4 md:p-10 overflow-y-auto">
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
