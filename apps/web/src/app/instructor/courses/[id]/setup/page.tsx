"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { BookOpen, Image as ImageIcon, FileText, LayoutList, Award, ClipboardCheck, Users, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Placeholder components for the 8 sections
import BasicInfoSection from "@/components/instructor/setup/BasicInfoSection";
import ThumbnailPromoSection from "@/components/instructor/setup/ThumbnailPromoSection";
import CurriculumPlannerSection from "@/components/instructor/setup/CurriculumPlannerSection";
import ModulesSection from "@/components/instructor/setup/ModulesSection";
import AssessmentsSection from "@/components/instructor/setup/AssessmentsSection";
import RubricsSection from "@/components/instructor/setup/RubricsSection";
import AttendanceSection from "@/components/instructor/setup/AttendanceSection";
import PublicationSection from "@/components/instructor/setup/PublicationSection";

const SECTIONS = [
  { id: "basic", label: "Basic Info", icon: BookOpen },
  { id: "media", label: "Thumbnail & Promo", icon: ImageIcon },
  { id: "curriculum", label: "Curriculum Planner", icon: FileText },
  { id: "publication", label: "Publication", icon: CheckCircle2 },
];

export default function CourseSetupPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("basic");

  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ["courseSetup", id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F7F8F5" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: "#F7F8F5", minHeight: "100vh" }}>
        <h2 style={{ fontFamily: "Georgia, serif", color: "#1A261D" }}>Course not found</h2>
        <Link href="/instructor/courses" style={{ color: "#B88645", textDecoration: "underline" }}>Back to Courses</Link>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "basic": return <BasicInfoSection course={course} onSave={refetch} />;
      case "media": return <ThumbnailPromoSection course={course} onSave={refetch} />;
      case "curriculum": return <CurriculumPlannerSection course={course} onSave={refetch} />;
      case "publication": return <PublicationSection course={course} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 70px)", margin: "-32px -36px", background: "#F7F8F5", color: "#1A261D", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <header style={{ position: "sticky", top: "70px", zIndex: 50, background: "#FFFFFF", padding: "20px 40px", borderBottom: "4px solid #B88645", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#1A261D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/instructor/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8F9E93", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F5F0E8"} onMouseLeave={(e) => e.currentTarget.style.color = "#8A9E8C"}>
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <div style={{ height: "24px", width: "1px", background: "rgba(184,134,69,0.3)" }}></div>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, margin: 0, color: "#B88645" }}>{course.title || "Untitled Course"}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
              <span style={{ fontSize: "12px", background: course.status === "PUBLISHED" ? "rgba(46,204,113,0.2)" : "#E4E8E0", color: course.status === "PUBLISHED" ? "#2ECC71" : "#8A9E8C", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                {course.status}
              </span>
              <span style={{ fontSize: "13px", color: "#8F9E93" }}>ID: {course.id}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Sidebar Navigation */}
        <div style={{ width: "280px", background: "#FFFFFF", borderRight: "1px solid #E4E8E0", padding: "24px 0", overflowY: "auto" }}>
          <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 24px", marginBottom: "16px" }}>Setup Checklist</h2>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", cursor: "pointer", background: isActive ? "rgba(184,134,69,0.1)" : "transparent", border: "none", borderRight: isActive ? "4px solid #B88645" : "4px solid transparent", textAlign: "left", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = "#F7F8F5")}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = "transparent")}
                >
                  <Icon size={18} color={isActive ? "#B88645" : "#8A9E8C"} />
                  <span style={{ fontSize: "14px", fontWeight: isActive ? 700 : 500, color: isActive ? "#1C2B1E" : "#4A5568" }}>{sec.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "24px", marginTop: "16px", borderTop: "1px solid #E4E8E0" }}>
            <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Curriculum</h2>
            <Link 
              href={`/instructor/courses/${course.id}`}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "#1A261D", color: "#FFFFFF", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "background 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#2C3E30"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#1A261D"}
            >
              <LayoutList size={18} />
              Open Module Builder
            </Link>
            <p style={{ fontSize: "12px", color: "#8A9E8C", marginTop: "8px", lineHeight: 1.5 }}>
              Manage modules, lessons, quizzes, and assignments.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {renderActiveSection()}
          </div>
        </div>

      </div>

    </div>
  );
}
