"use client";

import React, { useEffect, useState } from "react";
import { THEME } from "@/lib/cway-theme";
import { ClipboardList, Clock, CheckCircle, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { api } from "@/store/auth.store";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("student.assignments");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/student/assignments");
        setAssignments(res.data.data);
      } catch (err) {
        console.error("Failed to load assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, color: THEME.HERO, marginBottom: 8 }}>
          {t("title")}
        </h1>
        <p style={{ color: THEME.MUTED, fontSize: 16 }}>
          {t("subtitle")}
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", background: "white", borderRadius: 24, border: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="w-10 h-10 border-2 border-[#E4E8E0] border-t-[#C9973A] rounded-full animate-spin mb-4" />
          <p className="font-medium text-[#8A9E8C] text-lg">{t("loading")}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 0", background: "white", borderRadius: 24, border: "1px solid rgba(0,0,0,0.05)" }}>
          <ClipboardList size={56} color={THEME.MUTED} style={{ opacity: 0.5, margin: "0 auto 20px" }} />
          <h3 style={{ fontSize: 24, fontWeight: 600, color: THEME.HERO, marginBottom: 12 }}>{t("empty.title")}</h3>
          <p style={{ color: THEME.MUTED, maxWidth: 450, margin: "0 auto", fontSize: 16 }}>
            {t("empty.description")}
          </p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 24, border: "1px solid #E4E8E0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#FAFAF7", borderBottom: "1px solid #E4E8E0" }}>
                  <th style={{ padding: "20px 32px", fontFamily: "Cormorant Garamond, serif", fontSize: 20, fontWeight: 700, color: "#1A261D", width: "30%" }}>{t("table.course")}</th>
                  <th style={{ padding: "20px 32px", fontFamily: "Cormorant Garamond, serif", fontSize: 20, fontWeight: 700, color: "#1A261D", width: "35%" }}>{t("table.assignment")}</th>
                  <th style={{ padding: "20px 32px", fontFamily: "Cormorant Garamond, serif", fontSize: 20, fontWeight: 700, color: "#1A261D", width: "15%" }}>{t("table.status")}</th>
                  <th style={{ padding: "20px 32px", fontFamily: "Cormorant Garamond, serif", fontSize: 20, fontWeight: 700, color: "#1A261D", width: "10%", textAlign: "center" }}>{t("table.score")}</th>
                  <th style={{ padding: "20px 32px", fontFamily: "Cormorant Garamond, serif", fontSize: 20, fontWeight: 700, color: "#1A261D", width: "10%", textAlign: "right" }}>{t("table.action")}</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => {
                  const isPending = !assignment.submission;
                  const isAwaitingGrade = assignment.submission && !assignment.submission.isGraded;
                  const isGraded = assignment.submission && assignment.submission.isGraded;
                  const isLast = index === assignments.length - 1;

                  return (
                    <tr key={assignment.id} style={{ borderBottom: isLast ? "none" : "1px solid #E4E8E0", transition: "background 0.2s" }} className="hover:bg-[#FCFCFA] group">
                      <td style={{ padding: "24px 32px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FBF6EC", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645", flexShrink: 0, border: "1px solid #F4E8D3" }}>
                            <BookOpen size={20} />
                          </div>
                          <span style={{ fontWeight: 700, color: "#526658", fontSize: 15, lineHeight: 1.3 }}>
                            {assignment.courseName}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "24px 32px", verticalAlign: "middle" }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: isPending ? "#1A261D" : "#8A9E8C", textDecoration: isPending ? "none" : "line-through", textDecorationColor: "#E4E8E0", textDecorationThickness: 2 }}>
                          {assignment.title}
                        </span>
                      </td>
                      <td style={{ padding: "24px 32px", verticalAlign: "middle" }}>
                        {isPending && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#FDF0EE", color: "#B03A2E", fontSize: 13, fontWeight: 700, borderRadius: 999, border: "1px solid #FADBD8" }}>
                            <Clock size={16} /> {t("status.pending")}
                          </div>
                        )}
                        {isAwaitingGrade && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#FBF6EC", color: "#B88645", fontSize: 13, fontWeight: 700, borderRadius: 999, border: "1px solid #F4E8D3" }}>
                            <AlertCircle size={16} /> {t("status.awaitingGrade")}
                          </div>
                        )}
                        {isGraded && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#F2F7F4", color: "#3A7B5E", fontSize: 13, fontWeight: 700, borderRadius: 999, border: "1px solid #D5E8DD" }}>
                            <CheckCircle size={16} /> {t("status.graded")}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "24px 32px", verticalAlign: "middle", textAlign: "center" }}>
                        {isGraded ? (
                          <div style={{ display: "inline-flex", alignItems: "baseline", justifyContent: "center", gap: 6, padding: "4px 8px" }}>
                            <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, fontWeight: 700, color: "#1A261D" }}>{assignment.submission.grade}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#8A9E8C" }}>/ {assignment.totalPoints}</span>
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", alignItems: "baseline", justifyContent: "center", gap: 6, padding: "4px 8px" }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#8A9E8C", opacity: 0.7 }}>— / {assignment.totalPoints}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "24px 32px", verticalAlign: "middle", textAlign: "right" }}>
                        <Link 
                          href={`/student/courses/${assignment.courseId}/learn/${assignment.lessonId}`}
                          style={{ 
                            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, 
                            padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, 
                            textDecoration: "none", transition: "all 0.2s",
                            background: isPending ? "#1A261D" : "white", 
                            color: isPending ? "white" : "#526658",
                            border: isPending ? "none" : "1px solid #E4E8E0",
                            boxShadow: isPending ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                          }}
                        >
                          {isPending ? t("action.submit") : t("action.view")} <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
