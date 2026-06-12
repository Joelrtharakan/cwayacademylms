"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { ArrowLeft, BookOpen, Download, Loader2, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

const DARK = "#1A261D";
const GOLD = "#C9973A";
const LIGHT = "#F5F0E8";
const MUTED = "#8A9E8C";

export default function InstructorGradebookPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: gradebook, isLoading } = useQuery({
    queryKey: ["gradebook", id],
    queryFn: () => api.get(`/instructor/courses/${id}/gradebook`).then((r) => r.data.data),
  });

  const handleExportCSV = () => {
    if (!gradebook) return;

    // Build headers
    const headers = ["Student Name", "Student Email", "Course Grade (%)"];
    gradebook.items.forEach((item: any) => headers.push(`${item.title} (${item.maxScore})`));

    // Build rows
    const rows = gradebook.students.map((student: any) => {
      const row = [student.name, student.email, student.courseGrade.toString()];
      gradebook.items.forEach((item: any) => {
        const grade = student.grades[item.id];
        row.push(grade !== null ? grade.toString() : "");
      });
      return row;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Gradebook_Course_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Gradebook exported to CSV");
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} />
      </div>
    );
  }

  const items = gradebook?.items || [];
  const students = gradebook?.students || [];

  return (
    <div style={{ minHeight: "calc(100vh - 70px)", margin: "-32px -36px", background: "#F7F8F5", color: "#1A261D", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <header style={{ position: "sticky", top: "70px", zIndex: 50, background: "#FFFFFF", padding: "16px 40px", borderBottom: `4px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href={`/instructor/courses/${id}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: MUTED, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = DARK} onMouseLeave={(e) => e.currentTarget.style.color = MUTED}>
            <ArrowLeft size={18} /> Back to Course
          </Link>
          <div style={{ height: "24px", width: "1px", background: "rgba(184,134,69,0.3)" }}></div>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, margin: 0, color: GOLD }}>Master Gradebook</h1>
          </div>
        </div>
        <div>
          <button 
            onClick={handleExportCSV}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: DARK, color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2C3E30"} 
            onMouseLeave={e => e.currentTarget.style.background = DARK}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "40px", flex: 1, overflowX: "auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, color: DARK, margin: "0 0 8px 0" }}>Student Grades</h2>
          <p style={{ color: MUTED, fontSize: "15px", margin: 0 }}>View all scores across every assignment and quiz for enrolled students.</p>
        </div>

        {students.length === 0 ? (
          <div style={{ background: "white", padding: "60px", textAlign: "center", borderRadius: "16px", border: "1px solid #E4E8E0" }}>
            <div style={{ width: "64px", height: "64px", background: "rgba(184,134,69,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", color: GOLD }}>
              <BookOpen size={28} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: DARK, margin: "0 0 8px 0" }}>No Students Enrolled</h3>
            <p style={{ color: MUTED, margin: 0 }}>There are no students enrolled in this course yet.</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: "white", padding: "60px", textAlign: "center", borderRadius: "16px", border: "1px solid #E4E8E0" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: DARK, margin: "0 0 8px 0" }}>No Graded Items</h3>
            <p style={{ color: MUTED, margin: 0 }}>This course does not have any assignments or quizzes to grade.</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #E4E8E0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ w: "100%", minWidth: "1000px", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#FAFAF7", borderBottom: "2px solid #E4E8E0" }}>
                    <th style={{ padding: "20px 24px", fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: 700, color: DARK, borderRight: "1px solid #E4E8E0", position: "sticky", left: 0, background: "#FAFAF7", zIndex: 10 }}>Student</th>
                    <th style={{ padding: "20px 24px", fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: 700, color: DARK, borderRight: "1px solid #E4E8E0", background: "#FAFAF7" }}>Course Grade</th>
                    {items.map((item: any) => (
                      <th key={item.id} style={{ padding: "16px 24px", borderRight: "1px solid #E4E8E0", minWidth: "180px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: DARK, marginBottom: "4px" }}>{item.title}</div>
                        <div style={{ fontSize: "12px", color: MUTED, display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ padding: "2px 6px", background: item.type === "ASSIGNMENT" ? "#E3F2FD" : item.type === "FORUM" ? "#E8F5E9" : "#FFF3E0", color: item.type === "ASSIGNMENT" ? "#1976D2" : item.type === "FORUM" ? "#2E7D32" : "#F57C00", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>
                            {item.type}
                          </span>
                          Max: {item.maxScore}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ divideY: "1px solid #E4E8E0" }}>
                  {students.map((student: any, idx: number) => (
                    <tr key={student.id} style={{ borderBottom: idx === students.length - 1 ? "none" : "1px solid #E4E8E0", transition: "background 0.2s" }} className="hover:bg-[#F7F8F5]">
                      <td style={{ padding: "16px 24px", borderRight: "1px solid #E4E8E0", position: "sticky", left: 0, background: "white", zIndex: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#F5F0E8", color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px" }}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: DARK }}>{student.name}</div>
                            <div style={{ fontSize: "12px", color: MUTED }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", borderRight: "1px solid #E4E8E0", textAlign: "center", background: "#FAFAF7" }}>
                        <div style={{ display: "inline-flex", alignItems: "baseline", gap: "4px" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700, color: student.courseGrade >= 90 ? "#2E7D32" : student.courseGrade >= 70 ? GOLD : "#E53E3E" }}>{student.courseGrade}%</span>
                        </div>
                      </td>
                      {items.map((item: any) => {
                        const grade = student.grades[item.id];
                        return (
                          <td key={item.id} style={{ padding: "16px 24px", borderRight: "1px solid #E4E8E0", textAlign: "center" }}>
                            {grade !== null ? (
                              <div style={{ display: "inline-flex", alignItems: "baseline", gap: "4px" }}>
                                <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: DARK }}>{grade}</span>
                                <span style={{ fontSize: "12px", color: MUTED, fontWeight: 600 }}>/ {item.maxScore}</span>
                              </div>
                            ) : (
                              <span style={{ color: "#D1D5DB", fontWeight: 600, fontSize: "14px" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
