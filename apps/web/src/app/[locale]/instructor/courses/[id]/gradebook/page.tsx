"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { ArrowLeft, BookOpen, Download, Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { toast } from "react-hot-toast";
import { getLetterGrade } from "@/lib/gradeScale";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  dark: "#1A261D",
  muted: "#7F8E82",
  border: "#EBEEE8",
};

export default function InstructorGradebookPage() {
  const { id } = useParams() as { id: string };
  const [search, setSearch] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const { data: gradebook, isLoading } = useQuery({
    queryKey: ["gradebook", id],
    queryFn: () => api.get(`/instructor/courses/${id}/gradebook`).then((r) => r.data.data),
  });

  const handleExportCSV = () => {
    if (!gradebook) return;

    const headers = ["Student Name", "Student Email", "Course Grade (%)"];
    gradebook.items.forEach((item: any) => headers.push(`${item.title} (${item.maxScore})`));

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
      ...rows.map((row: string[]) => row.map((cell) => `"${cell}"`).join(","))
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
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: C.gold }} />
      </div>
    );
  }

  const items = gradebook?.items || [];
  const students = gradebook?.students || [];

  const filteredStudents = students.filter(
    (s: any) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      width: "100%", maxWidth: 1150, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 64, boxSizing: "border-box",
    }}>
      {/* ── TOP HEADER CARD ── */}
      <div style={{
        background: "#FFFFFF",
        borderTop: `1px solid ${C.border}`,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.gold}`,
        borderRadius: 20,
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Link
            href={`/instructor/courses/${id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 10,
              background: "#F7F8F5", color: "#2D3A2F",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Course</span>
          </Link>

          <button
            onClick={handleExportCSV}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              background: C.dark, color: "#FFFFFF",
              border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(26,38,29,0.15)",
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.dark, fontFamily: "Georgia, serif" }}>
              Master Gradebook
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
              View all scores across every assignment and quiz for enrolled students.
            </p>
          </div>

          {/* Search Box */}
          {students.length > 0 && (
            <div style={{ position: "relative", minWidth: 240 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: C.muted }} />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px 10px 36px",
                  borderRadius: 10, border: `1px solid ${C.border}`,
                  background: "#F7F8F5", fontSize: 13, boxSizing: "border-box",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── GRADEBOOK CONTENT AREA ── */}
      {students.length === 0 ? (
        <div style={{ background: "#FFFFFF", padding: "60px 24px", textAlign: "center", borderRadius: 20, border: `1px solid ${C.border}` }}>
          <div style={{ width: 56, height: 56, background: C.goldLight, color: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <BookOpen size={26} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>No Students Enrolled</h3>
          <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>There are no students enrolled in this course yet.</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: "#FFFFFF", padding: "60px 24px", textAlign: "center", borderRadius: 20, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>No Graded Items</h3>
          <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>This course does not have any assignments or quizzes to grade.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
          <div className="hidden md:block" style={{
            background: "#FFFFFF", borderRadius: 20,
            border: `1px solid ${C.border}`, overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            <div className="custom-scrollbar" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F7F8F5", borderBottom: `2px solid ${C.border}` }}>
                    <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: C.dark, borderRight: `1px solid ${C.border}`, position: "sticky", left: 0, background: "#F7F8F5", zIndex: 10, minWidth: 220 }}>
                      Student
                    </th>
                    <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: C.dark, borderRight: `1px solid ${C.border}`, textAlign: "center", minWidth: 130 }}>
                      Course Grade
                    </th>
                    {items.map((item: any) => (
                      <th key={item.id} style={{ padding: "14px 18px", borderRight: `1px solid ${C.border}`, minWidth: 170 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }} title={item.title}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800,
                            background: item.type === "ASSIGNMENT" ? "#E3F2FD" : item.type === "FORUM" ? "#E8F5E9" : "#FFF3E0",
                            color: item.type === "ASSIGNMENT" ? "#1976D2" : item.type === "FORUM" ? "#2E7D32" : "#F57C00",
                          }}>
                            {item.type}
                          </span>
                          <span>Max: {item.maxScore}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student: any, idx: number) => (
                    <tr key={student.id} style={{ borderBottom: idx === filteredStudents.length - 1 ? "none" : `1px solid ${C.border}` }}>
                      <td style={{ padding: "14px 20px", borderRight: `1px solid ${C.border}`, position: "sticky", left: 0, background: "#FFFFFF", zIndex: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.goldLight, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{student.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", borderRight: `1px solid ${C.border}`, textAlign: "center", background: "#FAFBF8" }}>
                        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: student.courseGrade >= 90 ? "#2E7D32" : student.courseGrade >= 70 ? C.gold : "#E53E3E" }}>
                            {getLetterGrade(student.courseGrade)}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
                            {student.courseGrade.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      {items.map((item: any) => {
                        const grade = student.grades[item.id];
                        return (
                          <td key={item.id} style={{ padding: "14px 18px", borderRight: `1px solid ${C.border}`, textAlign: "center" }}>
                            {grade !== null ? (
                              <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
                                <span style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{grade}</span>
                                <span style={{ fontSize: 11, color: C.muted }}>/ {item.maxScore}</span>
                              </div>
                            ) : (
                              <span style={{ color: "#CBD5E0", fontWeight: 600, fontSize: 13 }}>—</span>
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

          {/* MOBILE/TABLET RESPONSIVE CARD LIST (Visible on < 768px) */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredStudents.map((student: any) => {
              const isExpanded = expandedStudent === student.id;
              return (
                <div key={student.id} style={{ background: "#FFFFFF", borderRadius: 16, border: `1px solid ${C.border}`, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.goldLight, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.dark }}>{student.name}</h4>
                        <span style={{ fontSize: 11, color: C.muted }}>{student.email}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: student.courseGrade >= 90 ? "#2E7D32" : student.courseGrade >= 70 ? C.gold : "#E53E3E", display: "block" }}>
                          {getLetterGrade(student.courseGrade)}
                        </span>
                        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{student.courseGrade.toFixed(1)}%</span>
                      </div>
                      <button
                        onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                        style={{ padding: 6, background: "#F7F8F5", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.muted }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Item Grades Grid */}
                  {isExpanded && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {items.map((item: any) => {
                        const grade = student.grades[item.id];
                        return (
                          <div key={item.id} style={{ background: "#F7F8F5", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.title}>
                              {item.title}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                              <span style={{
                                padding: "1px 5px", borderRadius: 4, fontSize: 9, fontWeight: 800,
                                background: item.type === "ASSIGNMENT" ? "#E3F2FD" : item.type === "FORUM" ? "#E8F5E9" : "#FFF3E0",
                                color: item.type === "ASSIGNMENT" ? "#1976D2" : item.type === "FORUM" ? "#2E7D32" : "#F57C00",
                              }}>
                                {item.type}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 800, color: grade !== null ? C.dark : "#A0AEC0" }}>
                                {grade !== null ? `${grade} / ${item.maxScore}` : "—"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
