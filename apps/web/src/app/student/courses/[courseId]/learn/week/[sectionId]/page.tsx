"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, fetchWithCache } from "@/store/auth.store";
import { FileText, ArrowLeft, ArrowRight, PlayCircle, BookOpen, CheckCircle, HelpCircle, Edit3, Video, FileText as FileTextIcon, HelpCircle as HelpIcon } from "lucide-react";

export default function WeekDescriptionPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;

  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const enrRes = await fetchWithCache(`/student/courses/${courseId}/learn`);
        const enr = enrRes.data.data;
        
        // Find the section
        const foundSection = enr.course.sections.find((s: any) => s.id === sectionId);
        setSection(foundSection);
      } catch (err) {
        console.error("Failed to load section", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSection();
  }, [courseId, sectionId]);

  if (loading) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF7", color: "#1C2B1E" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid rgba(28,43,30,0.1)", borderTopColor: "#C9973A", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!section) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF7", color: "#8A9E8C", fontSize: "15px" }}>
        <div>Section not found</div>
      </div>
    );
  }

  const firstLesson = section?.lessons?.[0];

  return (
    <div className="w-full flex flex-col h-[calc(100vh-70px)] relative overflow-hidden bg-[#FAFAF7]" style={{ color: "#1C2B1E", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
      
      <div data-lenis-prevent="true" className="flex-1 w-full relative overflow-y-auto flex flex-col">
        {/* Hero Banner Header */}
        <div style={{ 
          padding: "60px 48px", 
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAFAF7 100%)", 
          borderBottom: "1px solid rgba(201,151,58,0.2)",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0
        }}>
        {/* Subtle Decorative Background Elements */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, background: "radial-gradient(circle, rgba(201,151,58,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -50, left: 100, width: 200, height: 200, background: "radial-gradient(circle, rgba(28,43,30,0.03) 0%, transparent 70%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div style={{ 
            width: "64px", height: "64px", 
            borderRadius: "16px", 
            background: "#FFFFFF", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            color: "#C9973A", 
            border: "1px solid rgba(201,151,58,0.3)", 
            boxShadow: "0 8px 24px rgba(201,151,58,0.12)",
            flexShrink: 0
          }}>
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ 
              fontSize: "12px", 
              fontWeight: 700, 
              color: "#A8792A", 
              marginBottom: "8px", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em" 
            }}>
              Week Overview
            </div>
            <h1 style={{ 
              fontSize: "36px", 
              fontWeight: 400, 
              margin: 0, 
              color: "#1C2B1E", 
              fontFamily: "var(--font-dm-serif), Georgia, serif",
              lineHeight: "1.2"
            }}>
              {section.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: "48px 48px", maxWidth: "900px", margin: "0 auto", width: "100%", flex: 1, paddingBottom: "80px" }}>
        <div style={{ 
          background: "#FFFFFF", 
          borderRadius: "24px", 
          padding: "56px", 
          border: "1px solid #E4E8E0",
          boxShadow: "0 12px 40px rgba(28,43,30,0.04)",
          position: "relative"
        }}>
          {/* Accent Line */}
          <div style={{ position: "absolute", top: 0, left: "40px", right: "40px", height: "3px", background: "linear-gradient(90deg, transparent, #C9973A, transparent)", opacity: 0.8 }} />

          <h2 style={{ 
            fontSize: "18px", 
            fontWeight: 700, 
            marginBottom: "24px", 
            color: "#C9973A", 
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ width: "24px", height: "1px", background: "#C9973A" }}></span>
            About this Week
          </h2>
          
          <div style={{ 
            fontSize: "17px", 
            color: "#243825", 
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
            fontWeight: 400,
            textAlign: "justify"
          }}>
            {section.description ? (
              <span style={{ display: "block", position: "relative" }}>
                <span style={{ fontSize: "20px", color: "#1C2B1E", lineHeight: "1.6", display: "block", marginBottom: "16px", textAlign: "justify" }}>
                  {section.description.split('\n')[0]}
                </span>
                <span style={{ color: "#4A5D4E", textAlign: "justify" }}>
                  {section.description.substring(section.description.split('\n')[0].length).trim()}
                </span>
              </span>
            ) : (
              <span style={{ color: "#8A9E8C", fontStyle: "italic" }}>No description provided for this week.</span>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        {section.lessons && section.lessons.length > 0 && (
          <div style={{ marginTop: "48px" }}>
            <h3 style={{ 
              fontSize: "16px", 
              fontWeight: 700, 
              marginBottom: "24px", 
              color: "#1C2B1E", 
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ width: "24px", height: "1px", background: "#E4E8E0" }}></span>
              Items to Complete
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {section.lessons.map((l: any, index: number) => {
                const isCompleted = l.isCompleted;
                return (
                  <div 
                    key={l.id} 
                    onClick={() => router.push(`/student/courses/${courseId}/learn/${l.id}`)}
                    style={{ 
                      background: "#FFFFFF", 
                      border: "1px solid #E4E8E0", 
                      borderRadius: "16px", 
                      padding: "20px 24px", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "20px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(28,43,30,0.02)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#C9973A";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,151,58,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E4E8E0";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(28,43,30,0.02)";
                    }}
                  >
                    <div style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "12px", 
                      background: isCompleted ? "rgba(201,151,58,0.1)" : "#FAFAF7", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      flexShrink: 0,
                      border: isCompleted ? "1px solid rgba(201,151,58,0.2)" : "1px solid #E4E8E0"
                    }}>
                      {isCompleted ? <CheckCircle size={24} color="#C9973A" /> : (
                        l.type === "VIDEO" ? <PlayCircle size={24} color="#8A9E8C" /> :
                        l.type === "READING_MATERIAL" ? <BookOpen size={24} color="#8A9E8C" /> :
                        l.type === "QUIZ" ? <HelpCircle size={24} color="#8A9E8C" /> :
                        l.type === "ASSIGNMENT" ? <Edit3 size={24} color="#8A9E8C" /> :
                        <FileText size={24} color="#8A9E8C" />
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        {l.type.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "#1C2B1E" }}>
                        {l.title}
                      </div>
                    </div>
                    
                    <div style={{ color: "#D4A35B", opacity: 0.5, transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"} onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}>
                      <ArrowRight size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* PREV/NEXT NAV BOTTOM BAR */}
      <div className="h-20 shrink-0 bg-[#FFFFFF] border-t border-[#E4E8E0] flex items-center justify-between z-30 w-full" style={{ paddingLeft: "48px", paddingRight: "48px" }}>
        <div style={{ flex: 1 }}>
          {/* Future expansion for 'previous module' button */}
        </div>
        
        <div className="flex flex-col items-center justify-center gap-1 text-center px-4" style={{ flex: 1 }}>
          <div className="text-[11px] text-[#8A9E8C] font-bold tracking-[0.2em] uppercase">
            Overview
          </div>
        </div>
        
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={() => firstLesson && router.push(`/student/courses/${courseId}/learn/${firstLesson.id}`)}
            disabled={!firstLesson}
            className="bg-[#1A261D] text-white hover:bg-[#2A3B2D] border border-[#2A3B2D] flex items-center gap-2 font-semibold transition-all shadow-sm shadow-[#1A261D]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: "12px 28px", borderRadius: "999px", fontSize: "14px" }}
          >
            {firstLesson ? "Start First Lesson" : "No Lessons"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
