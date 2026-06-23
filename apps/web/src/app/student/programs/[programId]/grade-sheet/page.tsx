"use client";

import React, { useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, useAuthStore } from "@/store/auth.store";
import { getLetterGrade } from "@/lib/gradeScale";
import { Printer, ArrowLeft } from "lucide-react";
import { THEME } from "@/lib/cway-theme";
import Image from "next/image";

export default function GradeSheetPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;
  const { user } = useAuthStore();

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
        Failed to load grade sheet.
      </div>
    );
  }

  const { program, coursesWithGrades } = data;

  const totalPercentage = coursesWithGrades.reduce((sum: number, c: any) => sum + c.finalGrade, 0);
  const averagePercentage = coursesWithGrades.length > 0 ? totalPercentage / coursesWithGrades.length : 0;
  const finalProgramGrade = getLetterGrade(averagePercentage);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Inter, sans-serif" }}>
      
      {/* Action Bar (Hidden when printing) */}
      <div className="print-hidden" style={{ width: "100%", maxWidth: "800px", display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <button 
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", color: THEME.HERO, padding: "8px 16px", borderRadius: "8px", border: "1px solid #e4e4e7", cursor: "pointer", fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => window.print()}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: THEME.GOLD, color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600 }}
        >
          <Printer size={16} /> Print Official Grade Sheet
        </button>
      </div>

      {/* Grade Sheet Document */}
      <div 
        id="grade-sheet-container"
        style={{ 
          background: "white", 
          width: "100%", 
          maxWidth: "800px", 
          padding: "60px", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)", 
          borderRadius: "4px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative Top Border */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: `linear-gradient(90deg, ${THEME.HERO}, ${THEME.GOLD})` }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "48px", borderBottom: "2px solid #e4e4e7", paddingBottom: "24px" }}>
          <div>
            <Image src="/logo.png" alt="CWAY Academy" width={160} height={40} style={{ objectFit: "contain", marginBottom: "16px" }} />
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "32px", color: THEME.HERO, margin: 0, fontWeight: 700 }}>Official Grade Sheet</h1>
            <p style={{ color: THEME.MUTED, margin: "4px 0 0 0", fontSize: "14px" }}>CWAY Academy Theological Studies</p>
          </div>
          <div style={{ textAlign: "right", marginTop: "16px" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>Date Issued</p>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: THEME.HERO }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Student Information */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "48px", background: "#fafafa", padding: "24px", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>Student Name</p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: THEME.HERO }}>{user.name}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: THEME.MUTED }}>{user.email}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>Program Enrolled</p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: THEME.HERO }}>{program.title}</p>
          </div>
        </div>

        {/* Grades Table */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", color: THEME.HERO, marginBottom: "16px" }}>Academic Record</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000" }}>
                <th style={{ textAlign: "left", padding: "12px 0", color: THEME.HERO, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>Course Title</th>
                <th style={{ textAlign: "center", padding: "12px 0", color: THEME.HERO, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", width: "120px" }}>Score (%)</th>
                <th style={{ textAlign: "right", padding: "12px 0", color: THEME.HERO, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", width: "120px" }}>Letter Grade</th>
              </tr>
            </thead>
            <tbody>
              {coursesWithGrades.map((course: any, idx: number) => (
                <tr key={course.id} style={{ borderBottom: "1px solid #e4e4e7" }}>
                  <td style={{ padding: "16px 0", fontWeight: 600, color: "#27272a" }}>{course.title}</td>
                  <td style={{ textAlign: "center", padding: "16px 0", color: "#52525b", fontWeight: 500 }}>{course.finalGrade.toFixed(1)}%</td>
                  <td style={{ textAlign: "right", padding: "16px 0", fontWeight: 700, color: THEME.GOLD }}>{getLetterGrade(course.finalGrade)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #000" }}>
                <td style={{ padding: "24px 0 0 0", fontWeight: 700, color: THEME.HERO, fontSize: "16px" }}>Program Final Average</td>
                <td style={{ textAlign: "center", padding: "24px 0 0 0", fontWeight: 700, color: THEME.HERO, fontSize: "16px" }}>{averagePercentage.toFixed(1)}%</td>
                <td style={{ textAlign: "right", padding: "24px 0 0 0", fontWeight: 800, color: THEME.GOLD, fontSize: "20px" }}>{finalProgramGrade}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Grading Scale Legend */}
        <div style={{ marginTop: "64px", paddingTop: "24px", borderTop: "1px solid #e4e4e7" }}>
          <h3 style={{ fontSize: "12px", color: THEME.MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", textAlign: "center" }}>Grading Scale Reference</h3>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px", fontSize: "11px", color: "#71717a" }}>
            <span><strong style={{ color: THEME.HERO }}>A+</strong> 98-100%</span>
            <span><strong style={{ color: THEME.HERO }}>A</strong> 92-97.9%</span>
            <span><strong style={{ color: THEME.HERO }}>A-</strong> 90-91.9%</span>
            <span><strong style={{ color: THEME.HERO }}>B+</strong> 88-89.9%</span>
            <span><strong style={{ color: THEME.HERO }}>B</strong> 82-87.9%</span>
            <span><strong style={{ color: THEME.HERO }}>B-</strong> 80-81.9%</span>
            <span><strong style={{ color: THEME.HERO }}>C+</strong> 78-79.9%</span>
            <span><strong style={{ color: THEME.HERO }}>C</strong> 72-77.9%</span>
            <span><strong style={{ color: THEME.HERO }}>C-</strong> 70-71.9%</span>
            <span><strong style={{ color: THEME.HERO }}>D+</strong> 68-69.9%</span>
            <span><strong style={{ color: THEME.HERO }}>D</strong> 62-67.9%</span>
            <span><strong style={{ color: THEME.HERO }}>D-</strong> 60-61.9%</span>
            <span><strong style={{ color: THEME.HERO }}>F</strong> 0-59.9%</span>
          </div>
        </div>

        {/* Signature Area */}
        <div style={{ marginTop: "80px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "center", width: "240px" }}>
            <div style={{ borderBottom: "1px solid #000", height: "40px", marginBottom: "8px" }}></div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: THEME.HERO }}>CWAY Academy Registrar</p>
            <p style={{ margin: 0, fontSize: "12px", color: THEME.MUTED }}>Official Signature</p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #grade-sheet-container, #grade-sheet-container * {
            visibility: visible;
          }
          #grade-sheet-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            margin: 0;
            padding: 20px !important;
            box-shadow: none !important;
          }
          .print-hidden, .print-hidden * {
            display: none !important;
          }
          @page { margin: 0.5cm; }
        }
      `}} />
    </div>
  );
}
