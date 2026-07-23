"use client";

import React, { useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { api, useAuthStore } from "@/store/auth.store";
import { getLetterGrade } from "@/lib/gradeScale";
import { Printer, ArrowLeft } from "lucide-react";
import { THEME } from "@/lib/cway-theme";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function GradeSheetPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;
  const { user } = useAuthStore();
  const t = useTranslations("student.gradeSheet");

  const { data, isLoading, error } = useQuery({
    queryKey: ["programGrades", programId],
    queryFn: () => api.get(`/student/programs/${programId}/grades`).then(res => res.data.data),
    enabled: !!programId,
  });

  if (isLoading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f4f4f5" }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${THEME.MUTED}`, borderTopColor: THEME.GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        {t("error")}
      </div>
    );
  }

  const { program, coursesWithGrades } = data;

  const totalPercentage = coursesWithGrades.reduce((sum: number, c: any) => sum + c.finalGrade, 0);
  const averagePercentage = coursesWithGrades.length > 0 ? totalPercentage / coursesWithGrades.length : 0;
  const finalProgramGrade = getLetterGrade(averagePercentage);

  return (
    <div className="print-wrapper w-full min-h-screen bg-[#f4f4f5] flex flex-col items-center font-sans box-border" style={{ padding: "24px 20px" }}>
      
      {/* Action Bar (Hidden when printing) */}
      <div className="print-hidden w-full max-w-[800px]" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "32px" }}>
        <button 
          className="gs-action-btn"
          onClick={() => router.back()}
          style={{ backgroundColor: "white", color: "#1A261D", border: "1px solid #d4d4d8", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <ArrowLeft size={16} /> {t("back")}
        </button>
        <button 
          className="gs-action-btn"
          onClick={() => window.print()}
          style={{ backgroundColor: "#B88645", color: "white", border: "1px solid #B88645", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <Printer size={16} /> {t("printBtn")}
        </button>
      </div>

      {/* Grade Sheet Document */}
      <div 
        id="grade-sheet-container"
        className="w-full max-w-[800px] bg-white rounded-2xl shadow-md relative overflow-hidden box-border"
        style={{ padding: "clamp(24px, 5vw, 56px)", background: "white" }}
      >
        {/* Decorative Top Border */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: `linear-gradient(90deg, ${THEME.HERO}, ${THEME.GOLD})` }} />

        {/* Header */}
        <div className="gs-header flex flex-col lg:flex-row justify-between items-start gap-4 mb-2">
          <div>
            <Image src="/logo.png" alt="CWAY Academy" width={160} height={40} style={{ objectFit: "contain", marginBottom: "16px" }} />
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "32px", color: THEME.HERO, margin: 0, fontWeight: 700 }}>{t("title")}</h1>
            <p style={{ color: THEME.MUTED, margin: "4px 0 0 0", fontSize: "14px" }}>{t("subtitle")}</p>
          </div>
          <div className="text-left lg:text-right mt-1 lg:mt-4">
            <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>{t("dateIssued")}</p>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: THEME.HERO }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Divider Line */}
        <div style={{ height: "1px", background: "#e4e4e7", marginTop: "24px", marginBottom: "32px", width: "100%" }} />

        {/* Student Information */}
        <div 
          className="gs-student grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-8 lg:mb-12 bg-zinc-50 rounded-xl border border-zinc-200/80"
          style={{ padding: "clamp(18px, 3vw, 26px)" }}
        >
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>{t("studentName")}</p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: THEME.HERO, wordBreak: "break-word" }}>{user.name}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: THEME.MUTED, wordBreak: "break-all" }}>{user.email}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>{t("programEnrolled")}</p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: THEME.HERO, wordBreak: "break-word" }}>{program.title}</p>
          </div>
        </div>

        {/* Grades Table */}
        <div className="gs-table" style={{ marginTop: "40px", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", color: THEME.HERO, marginBottom: "20px" }}>{t("academicRecord")}</h2>
          
          {/* Mobile & Tablet Card List View (< 1024px - Always fits 100% width with generous 20px padding) */}
          <div className="flex flex-col gap-3.5 lg:hidden mb-6">
            {coursesWithGrades.map((course: any) => (
              <div 
                key={course.id} 
                className="bg-zinc-50 border border-zinc-200/80 rounded-2xl flex flex-col gap-2"
                style={{ padding: "16px 20px" }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs font-bold text-[#8A9E8C] uppercase tracking-wider">{course.courseCode || t("table.na")}</span>
                  <span className="text-xs font-bold text-[#B88645] bg-[#FBF6EC] px-3 py-1 rounded-md border border-[#F4E8D3] whitespace-nowrap">
                    {getLetterGrade(course.finalGrade)} ({course.finalGrade.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-sm sm:text-base font-semibold text-[#1A261D] leading-snug">{course.title}</div>
              </div>
            ))}
            
            <div 
              className="bg-[#1A261D] text-white rounded-2xl flex items-center justify-between gap-3 flex-wrap mt-2"
              style={{ padding: "16px 20px" }}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">{t("finalAverage")}</span>
              <span className="text-sm sm:text-base font-extrabold text-[#D4A35B] whitespace-nowrap">{averagePercentage.toFixed(1)}% ({finalProgramGrade})</span>
            </div>
          </div>

          {/* Desktop Table View (>= 1024px - Fits 100% width with zero horizontal scrolling) */}
          <div className="hidden lg:block w-full">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #000" }}>
                  <th style={{ textAlign: "left", padding: "12px 10px", color: THEME.HERO, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" }}>{t("table.courseCode")}</th>
                  <th style={{ textAlign: "left", padding: "12px 10px", color: THEME.HERO, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{t("table.courseTitle")}</th>
                  <th style={{ textAlign: "center", padding: "12px 10px", color: THEME.HERO, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" }}>{t("table.score")}</th>
                  <th style={{ textAlign: "center", padding: "12px 10px", color: THEME.HERO, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" }}>{t("table.letterGrade")}</th>
                </tr>
              </thead>
              <tbody>
                {coursesWithGrades.map((course: any, idx: number) => (
                  <tr key={course.id} style={{ borderBottom: "1px solid #e4e4e7" }}>
                    <td style={{ padding: "14px 10px", color: "#27272a", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap" }}>{course.courseCode || t("table.na")}</td>
                    <td style={{ padding: "14px 10px", fontWeight: 600, color: "#27272a", fontSize: "14px" }}>{course.title}</td>
                    <td style={{ textAlign: "center", padding: "14px 10px", color: "#52525b", fontWeight: 500, fontSize: "14px", whiteSpace: "nowrap" }}>{course.finalGrade.toFixed(1)}%</td>
                    <td style={{ textAlign: "center", padding: "14px 10px", fontWeight: 700, color: THEME.GOLD, fontSize: "15px", whiteSpace: "nowrap" }}>{getLetterGrade(course.finalGrade)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #000" }}>
                  <td style={{ padding: "18px 10px 0 10px", fontWeight: 700, color: THEME.HERO, fontSize: "14px", whiteSpace: "nowrap" }}>{t("finalAverage")}</td>
                  <td style={{ padding: "18px 10px 0 10px" }}></td>
                  <td style={{ textAlign: "center", padding: "18px 10px 0 10px", fontWeight: 700, color: THEME.HERO, fontSize: "14px", whiteSpace: "nowrap" }}>{averagePercentage.toFixed(1)}%</td>
                  <td style={{ textAlign: "center", padding: "18px 10px 0 10px", fontWeight: 800, color: THEME.GOLD, fontSize: "17px", whiteSpace: "nowrap" }}>{finalProgramGrade}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Grading Scale Legend */}
        <div className="gs-legend" style={{ marginTop: "64px", paddingTop: "24px", borderTop: "1px solid #e4e4e7" }}>
          <h3 style={{ fontSize: "12px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", textAlign: "center" }}>{t("legendTitle")}</h3>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px", fontSize: "11px", color: "#71717a" }}>
            <span><strong style={{ color: THEME.HERO }}>A+</strong> 98-100%</span>
            <span><strong style={{ color: THEME.HERO }}>A</strong> 92-97.9%</span>
            <span><strong style={{ color: THEME.HERO }}>A-</strong> 90-91.9%</span>
            <span><strong style={{ color: THEME.HERO }}>B+</strong> 88-89.9%</span>
            <span><strong style={{ color: THEME.HERO }}>B</strong> 82-87.9%</span>
            <span><strong style={{ color: THEME.HERO }}>B-</strong> 80-81.9%</span>
            <span><strong style={{ color: THEME.HERO }}>C+</strong> 78-79.9%</span>
            <span><strong style={{ color: THEME.HERO }}>C</strong> 72-77.9%</span>
            <span><strong style={{ color: THEME.HERO }}>D+</strong> 68-69.9%</span>
            <span><strong style={{ color: THEME.HERO }}>D</strong> 62-67.9%</span>
            <span><strong style={{ color: THEME.HERO }}>D-</strong> 60-61.9%</span>
            <span><strong style={{ color: THEME.HERO }}>F</strong> 0-59.9%</span>
          </div>
        </div>

        {/* Document Footer */}
        <div style={{ marginTop: "48px", paddingTop: "16px", borderTop: "1px solid #e4e4e7", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: THEME.MUTED }}>
          <span style={{ fontWeight: 600, color: THEME.HERO }}>cwayacademy.com</span>
          <span>{t("title")}</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 10mm; size: portrait; }
          body, html { 
            margin: 0; 
            padding: 0; 
            background: white !important; 
            height: auto; 
            min-height: auto; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          
          /* Hide external layout elements */
          header, aside, nav { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; background: white !important; }
          
          /* Force all wrapper divs to have a white background so we don't get the grey site background */
          body > div, body > div > div { background: white !important; }

          .print-wrapper { 
            padding: 0 !important; 
            margin: 0 !important; 
            background: white !important; 
            display: block !important; 
            min-height: auto !important;
            height: auto !important;
          }
          .print-hidden, .print-hidden * { display: none !important; }
          
          #grade-sheet-container {
            position: relative !important;
            padding: 20px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            border: none !important;
            height: auto !important;
            min-height: auto !important;
          }
          
          .gs-header { margin-bottom: 16px !important; padding-bottom: 8px !important; }
          .gs-header img { margin-bottom: 8px !important; height: 32px !important; width: auto !important; }
          .gs-student { margin-bottom: 16px !important; padding: 12px !important; page-break-inside: avoid; }
          .gs-student h3 { font-size: 14px !important; margin-bottom: 2px !important; }
          .gs-student p { font-size: 11px !important; }
          .gs-table { margin-bottom: 16px !important; }
          .gs-legend { margin-top: 16px !important; padding-top: 12px !important; page-break-inside: avoid; }
          .gs-legend div { font-size: 9px !important; margin-bottom: 4px !important; }
          .gs-signature { margin-top: 24px !important; page-break-inside: avoid; }
          .gs-signature div { font-size: 10px !important; }
          
          td, th { padding-top: 6px !important; padding-bottom: 6px !important; font-size: 11px !important; }
          tfoot td { padding-top: 8px !important; font-size: 12px !important; }
        }
      `}} />
    </div>
  );
}
