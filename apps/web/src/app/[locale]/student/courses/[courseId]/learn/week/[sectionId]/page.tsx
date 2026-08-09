"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
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
    <div className="w-full flex flex-col h-[calc(100vh-70px)] relative overflow-hidden bg-[#FAFAF7]" style={{ color: "#1C2B1E", fontFamily: "var(--font-plus-jakarta), 'Inter', system-ui, sans-serif" }}>
      
      <div data-lenis-prevent="true" className="flex-1 w-full relative overflow-y-auto flex flex-col">
        {/* Hero Banner Header */}
        <div style={{ 
          padding: "clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px)", 
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAFAF7 100%)", 
          borderBottom: "1px solid rgba(184,134,69,0.2)",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0
        }}>
          {/* Subtle Decorative Background Elements */}
          <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, background: "radial-gradient(circle, rgba(184,134,69,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -50, left: 100, width: 200, height: 200, background: "radial-gradient(circle, rgba(28,43,30,0.03) 0%, transparent 70%)", borderRadius: "50%" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "nowrap" }}>
            <div style={{ 
              width: "48px", height: "48px", 
              borderRadius: "14px", 
              background: "#FFFFFF", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              color: "#B88645", 
              border: "1px solid rgba(184,134,69,0.3)", 
              boxShadow: "0 4px 16px rgba(184,134,69,0.12)",
              flexShrink: 0
            }} className="sm:!w-16 sm:!h-16 sm:!rounded-2xl">
              <FileText size={26} strokeWidth={1.5} className="sm:!w-8 sm:!h-8" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: 800, 
                color: "#B88645", 
                marginBottom: "6px", 
                textTransform: "uppercase", 
                letterSpacing: "0.15em",
                fontFamily: "var(--font-plus-jakarta), -apple-system, sans-serif"
              }}>
                Week Overview
              </div>
              <h1 style={{ 
                fontSize: "clamp(22px, 4vw, 34px)", 
                fontWeight: 800, 
                margin: 0, 
                color: "#1C2B1E", 
                fontFamily: "Georgia, 'Times New Roman', serif",
                lineHeight: "1.25",
                letterSpacing: "-0.01em",
                overflowWrap: "break-word"
              }}>
                {section.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: "clamp(16px, 3vw, 36px) clamp(16px, 3vw, 36px)", maxWidth: "900px", margin: "0 auto", width: "100%", flex: 1, paddingBottom: "40px", boxSizing: "border-box" }}>
          <div style={{ 
            background: "#FFFFFF", 
            borderRadius: "20px", 
            padding: "clamp(20px, 4vw, 44px)", 
            border: "1px solid #E4E8E0",
            boxShadow: "0 8px 30px rgba(28,43,30,0.03)",
            position: "relative",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {/* Accent Line */}
            <div style={{ position: "absolute", top: 0, left: "20px", right: "20px", height: "3px", background: "linear-gradient(90deg, transparent, #B88645, transparent)", opacity: 0.8 }} />

            <h2 style={{ 
              fontSize: "14px", 
              fontWeight: 800, 
              marginBottom: "20px", 
              color: "#B88645", 
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "Georgia, serif"
            }}>
              <span style={{ width: "20px", height: "1px", background: "#B88645" }}></span>
              About this Week
            </h2>
            
            <div style={{ 
              fontSize: "16px", 
              color: "#243825", 
              lineHeight: "1.75",
              whiteSpace: "pre-wrap",
              fontWeight: 400,
              textAlign: "left",
              overflowWrap: "break-word"
            }}>
              {section.description ? (
                <span style={{ display: "block", color: "#243825", fontSize: "16px", fontWeight: 400, lineHeight: "1.75" }}>
                  {section.description}
                </span>
              ) : (
                <span style={{ color: "#8A9E8C", fontStyle: "italic" }}>No description provided for this week.</span>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          {section.lessons && section.lessons.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <h3 style={{ 
                fontSize: "13px", 
                fontWeight: 800, 
                marginBottom: "20px", 
                color: "#1C2B1E", 
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "Georgia, serif"
              }}>
                <span style={{ width: "20px", height: "1px", background: "#E4E8E0" }}></span>
                Items to Complete
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {section.lessons.map((l: any) => {
                  const isCompleted = l.isCompleted;
                  return (
                    <div 
                      key={l.id} 
                      onClick={() => router.push(`/student/courses/${courseId}/learn/${l.id}`)}
                      style={{ 
                        background: "#FFFFFF", 
                        border: "1px solid #E4E8E0", 
                        borderRadius: "14px", 
                        padding: "16px 20px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "14px",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(28,43,30,0.02)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ 
                        width: "42px", 
                        height: "42px", 
                        borderRadius: "10px", 
                        background: isCompleted ? "rgba(184,134,69,0.12)" : "#FAFAF7", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        flexShrink: 0,
                        border: isCompleted ? "1px solid rgba(184,134,69,0.25)" : "1px solid #E4E8E0"
                      }}>
                        {isCompleted ? <CheckCircle size={20} color="#B88645" /> : (
                          l.type === "VIDEO" ? <PlayCircle size={20} color="#8A9E8C" /> :
                          l.type === "READING_MATERIAL" ? <BookOpen size={20} color="#8A9E8C" /> :
                          l.type === "QUIZ" ? <HelpCircle size={20} color="#8A9E8C" /> :
                          l.type === "ASSIGNMENT" ? <Edit3 size={20} color="#8A9E8C" /> :
                          <FileText size={20} color="#8A9E8C" />
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
                          {l.type.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#1C2B1E", overflowWrap: "break-word", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
                          {l.title}
                        </div>
                      </div>
                      
                      <div style={{ color: "#B88645", flexShrink: 0 }}>
                        <ArrowRight size={18} />
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
      <div className="h-16 sm:h-20 shrink-0 bg-[#FFFFFF] border-t border-[#E4E8E0] flex items-center justify-between z-30 w-full" style={{ paddingLeft: "clamp(24px, 5vw, 64px)", paddingRight: "clamp(20px, 4vw, 40px)", boxSizing: "border-box" }}>
        {/* Left Section: Overview Label */}
        <div className="flex items-center">
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
            Overview
          </span>
        </div>
        
        {/* Center Spacer */}
        <div className="flex-1" />
        
        {/* Right Section: Start Lesson Action Button */}
        <div className="flex-shrink-0 flex justify-end">
          <button 
            onClick={() => firstLesson && router.push(`/student/courses/${courseId}/learn/${firstLesson.id}`)}
            disabled={!firstLesson}
            className="bg-[#B88645] hover:bg-[#A3763A] text-white border-transparent flex items-center gap-2 font-extrabold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: "9px 20px", borderRadius: "10px", fontSize: "13px", whiteSpace: "nowrap" }}
          >
            {firstLesson ? "Start Lesson" : "No Lessons"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
