"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import {
  ArrowLeft, BookOpen, Download, Loader2, Search,
  User, CheckCircle2, Award, FileText, MessageSquare,
  BarChart3, Users, ChevronRight, Layers, ArrowUpRight
} from "lucide-react";
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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"students" | "items" | "overview">("students");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

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

  const selectedStudent =
    students.find((s: any) => s.id === selectedStudentId) || filteredStudents[0] || null;

  const selectedItem =
    items.find((i: any) => i.id === selectedItemId) || items[0] || null;

  // Class Overview Stats
  const avgGrade =
    students.length > 0
      ? students.reduce((acc: number, s: any) => acc + s.courseGrade, 0) / students.length
      : 0;

  const passingStudentsCount = students.filter((s: any) => s.courseGrade >= 70).length;

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
              Zero-scroll inspection hub across every assignment, quiz, and student grade.
            </p>
          </div>

          {/* View Mode Switcher Pills */}
          <div style={{
            display: "inline-flex", gap: 4, background: "#F7F8F5",
            padding: 4, borderRadius: 12, border: `1px solid ${C.border}`
          }}>
            <button
              onClick={() => setActiveTab("students")}
              style={{
                padding: "8px 16px", borderRadius: 9, border: "none",
                fontSize: 12, fontWeight: 800, cursor: "pointer",
                background: activeTab === "students" ? C.gold : "transparent",
                color: activeTab === "students" ? "#FFFFFF" : C.muted,
                transition: "all 0.2s",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              <Users size={14} /> By Student
            </button>
            <button
              onClick={() => setActiveTab("items")}
              style={{
                padding: "8px 16px", borderRadius: 9, border: "none",
                fontSize: 12, fontWeight: 800, cursor: "pointer",
                background: activeTab === "items" ? C.gold : "transparent",
                color: activeTab === "items" ? "#FFFFFF" : C.muted,
                transition: "all 0.2s",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              <Layers size={14} /> By Assignment
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                padding: "8px 16px", borderRadius: 9, border: "none",
                fontSize: 12, fontWeight: 800, cursor: "pointer",
                background: activeTab === "overview" ? C.gold : "transparent",
                color: activeTab === "overview" ? "#FFFFFF" : C.muted,
                transition: "all 0.2s",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              <BarChart3 size={14} /> Analytics
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN ZERO-SCROLL WORKSPACE ── */}
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
      ) : activeTab === "students" ? (

        /* ── VIEW MODE 1: BY STUDENT (MASTER-DETAIL ZERO SCROLL) ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Student Directory List (4 cols) */}
          <div className="lg:col-span-4" style={{
            background: "#FFFFFF", borderRadius: 20,
            border: `1px solid ${C.border}`, padding: 18,
            display: "flex", flexDirection: "column", gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: C.muted }} />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  borderRadius: 10, border: `1px solid ${C.border}`,
                  background: "#F7F8F5", fontSize: 13, boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredStudents.map((s: any) => {
                const isSelected = selectedStudent?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 14, border: `1px solid ${isSelected ? C.gold : C.border}`,
                      background: isSelected ? C.goldLight : "#FFFFFF",
                      cursor: "pointer", transition: "all 0.2s", textAlign: "left", width: "100%",
                      boxShadow: isSelected ? "0 2px 8px rgba(184,134,69,0.12)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: isSelected ? C.gold : "#F5F0E8",
                        color: isSelected ? "#FFFFFF" : C.gold,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 14, flexShrink: 0,
                      }}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.dark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {s.name}
                        </h4>
                        <span style={{ fontSize: 11, color: C.muted, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {s.email}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 800,
                        color: s.courseGrade >= 90 ? "#2E7D32" : s.courseGrade >= 70 ? C.gold : "#E53E3E"
                      }}>
                        {getLetterGrade(s.courseGrade)}
                      </span>
                      <span style={{ fontSize: 11, color: C.muted, display: "block", fontWeight: 600 }}>
                        {s.courseGrade.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Student Full Grade Inspection (8 cols) */}
          {selectedStudent && (
            <div className="lg:col-span-8" style={{
              background: "#FFFFFF", borderRadius: 20,
              border: `1px solid ${C.border}`, padding: "24px 28px",
              display: "flex", flexDirection: "column", gap: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              {/* Selected Student Banner */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", background: "#F7F8F5", borderRadius: 16,
                border: `1px solid ${C.border}`, gap: 16, flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
                    color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 18, shadow: "0 4px 10px rgba(184,134,69,0.3)"
                  }}>
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.dark }}>{selectedStudent.name}</h3>
                    <span style={{ fontSize: 12, color: C.muted }}>{selectedStudent.email}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Course Grade</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: selectedStudent.courseGrade >= 90 ? "#2E7D32" : selectedStudent.courseGrade >= 70 ? C.gold : "#E53E3E" }}>
                        {getLetterGrade(selectedStudent.courseGrade)}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{selectedStudent.courseGrade.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Filters */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.dark }}>Curriculum Item Breakdown</h4>
                
                <div style={{ display: "flex", gap: 6 }}>
                  {["ALL", "ASSIGNMENT", "QUIZ", "FORUM"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      style={{
                        padding: "5px 12px", borderRadius: 8, border: "none",
                        fontSize: 11, fontWeight: 800, cursor: "pointer",
                        background: typeFilter === type ? C.dark : "#F7F8F5",
                        color: typeFilter === type ? "#FFFFFF" : C.muted,
                        transition: "all 0.2s",
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical Item Grade Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items
                  .filter((item: any) => typeFilter === "ALL" || item.type === typeFilter)
                  .map((item: any) => {
                    const score = selectedStudent.grades[item.id];
                    const percent = score !== null ? Math.round((score / item.maxScore) * 100) : 0;
                    const Icon = item.type === "ASSIGNMENT" ? FileText : item.type === "QUIZ" ? Award : MessageSquare;
                    
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: "16px 18px", borderRadius: 14,
                          border: `1px solid ${C.border}`, background: "#FFFFFF",
                          display: "flex", flexDirection: "column", gap: 10,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10,
                              background: item.type === "ASSIGNMENT" ? "#E3F2FD" : item.type === "FORUM" ? "#E8F5E9" : "#FFF3E0",
                              color: item.type === "ASSIGNMENT" ? "#1976D2" : item.type === "FORUM" ? "#2E7D32" : "#F57C00",
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                            }}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.dark }}>{item.title}</h5>
                              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{item.type} • Max Score: {item.maxScore}</span>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            {score !== null ? (
                              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{score}</span>
                                <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>/ {item.maxScore}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: percent >= 70 ? "#2E7D32" : "#E53E3E", marginLeft: 6 }}>
                                  ({percent}%)
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E0" }}>Not Graded Yet</span>
                            )}
                          </div>
                        </div>

                        {/* Fill Progress Bar */}
                        <div style={{ width: "100%", height: 6, background: "#F7F8F5", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${score !== null ? percent : 0}%`,
                            background: percent >= 90 ? "#2E7D32" : percent >= 70 ? C.gold : percent > 0 ? "#E53E3E" : "transparent",
                            borderRadius: 3, transition: "width 0.4s ease"
                          }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "items" ? (

        /* ── VIEW MODE 2: BY ASSIGNMENT (VERTICAL SCORES LIST) ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Assignment Selection Directory (4 cols) */}
          <div className="lg:col-span-4" style={{
            background: "#FFFFFF", borderRadius: 20,
            border: `1px solid ${C.border}`, padding: 18,
            display: "flex", flexDirection: "column", gap: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: C.dark }}>Curriculum Items ({items.length})</h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((item: any) => {
                const isSelected = selectedItem?.id === item.id;
                const Icon = item.type === "ASSIGNMENT" ? FileText : item.type === "QUIZ" ? Award : MessageSquare;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 14, border: `1px solid ${isSelected ? C.gold : C.border}`,
                      background: isSelected ? C.goldLight : "#FFFFFF",
                      cursor: "pointer", transition: "all 0.2s", textAlign: "left", width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <Icon size={16} color={isSelected ? C.gold : C.muted} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.dark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </span>
                    </div>
                    <ChevronRight size={16} color={C.muted} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: All Student Scores for Selected Item (8 cols) */}
          {selectedItem && (
            <div className="lg:col-span-8" style={{
              background: "#FFFFFF", borderRadius: 20,
              border: `1px solid ${C.border}`, padding: "24px 28px",
              display: "flex", flexDirection: "column", gap: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div>
                <span style={{
                  padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800,
                  background: selectedItem.type === "ASSIGNMENT" ? "#E3F2FD" : selectedItem.type === "FORUM" ? "#E8F5E9" : "#FFF3E0",
                  color: selectedItem.type === "ASSIGNMENT" ? "#1976D2" : selectedItem.type === "FORUM" ? "#2E7D32" : "#F57C00",
                }}>
                  {selectedItem.type}
                </span>
                <h3 style={{ margin: "6px 0 2px", fontSize: 20, fontWeight: 800, color: C.dark }}>{selectedItem.title}</h3>
                <span style={{ fontSize: 12, color: C.muted }}>Max Score: {selectedItem.maxScore} Points</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {students.map((s: any) => {
                  const score = s.grades[selectedItem.id];
                  const percent = score !== null ? Math.round((score / selectedItem.maxScore) * 100) : 0;
                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: "14px 18px", borderRadius: 14,
                        border: `1px solid ${C.border}`, background: "#F7F8F5",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.goldLight, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{s.email}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        {score !== null ? (
                          <span style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>
                            {score} <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>/ {selectedItem.maxScore} ({percent}%)</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#CBD5E0", fontWeight: 600 }}>Not Submitted</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (

        /* ── VIEW MODE 3: ANALYTICS OVERVIEW ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div style={{ background: "#FFFFFF", padding: 22, borderRadius: 20, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Class Average</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.dark, marginTop: 4 }}>
                {avgGrade.toFixed(1)}%
              </div>
            </div>
            <div style={{ background: "#FFFFFF", padding: 22, borderRadius: 20, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Pass Rate (&gt;=70%)</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2E7D32", marginTop: 4 }}>
                {students.length > 0 ? Math.round((passingStudentsCount / students.length) * 100) : 0}%
              </div>
            </div>
            <div style={{ background: "#FFFFFF", padding: 22, borderRadius: 20, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Total Graded Items</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.gold, marginTop: 4 }}>
                {items.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
