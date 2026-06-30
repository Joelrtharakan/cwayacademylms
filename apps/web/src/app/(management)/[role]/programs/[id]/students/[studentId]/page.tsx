"use client";

import { useManagementPath } from "@/hooks/useManagementPath";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProgramStudentDetails } from "@/lib/api/admin";
import { api } from "@/store/auth.store";
import Link from "next/link";
import { ArrowLeft, UserCircle, Award, BookOpen, CheckCircle, Clock, Mail, Phone, MessageSquare, Download } from "lucide-react";
import { format } from "date-fns";
import { SkeletonRow } from "@/components/shared/SkeletonLoader";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: "rgba(74,140,92,0.12)", color: "#4A8C5C" },
    COMPLETED: { bg: "rgba(201,151,58,0.12)", color: "#C9973A" },
    DROPPED: { bg: "rgba(140,58,58,0.12)", color: "#8C3A3A" },
  };
  const s = map[status] || map.ACTIVE;
  return (
    <span style={{
      background: s.bg, color: s.color, borderRadius: 999,
      padding: "4px 12px", fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      {status}
    </span>
  );
}

export default function ProgramStudentDetailsPage() {
  const basePath = useManagementPath();
  const { id, studentId } = useParams() as { id: string; studentId: string };

  const { data, isLoading, error } = useQuery({
    queryKey: ["programStudentDetails", id, studentId],
    queryFn: () => getProgramStudentDetails(id, studentId),
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100 }}>
        <div style={{ height: 32, background: "#E4E8E0", borderRadius: 8, width: 200, marginBottom: 32, animation: "pulse 1.5s infinite" }} />
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 40px" }}>
        <p style={{ color: "#8A9E8C" }}>Could not load student details.</p>
        <Link href={`${basePath}/programs/${id}`} style={{ color: "#C9973A" }}>← Back to Program</Link>
      </div>
    );
  }

  const { programEnrollment, courses, certificates } = data;
  const { student, program } = programEnrollment;

  const handleResetQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to reset this student's attempts for this quiz?")) return;
    try {
      await api.post(`/quizzes/${quizId}/reset`, { studentId });
      alert("Quiz attempts reset successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to reset quiz", error);
      alert("Failed to reset quiz attempts. Please try again.");
    }
  };

  const handleViewCertificate = async (id: string) => {
    const newWindow = window.open('about:blank', '_blank');
    if (!newWindow) {
      alert("Please allow pop-ups for this site to view the certificate.");
      return;
    }
    
    try {
      newWindow.document.write(`
        <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa;margin:0;">
          <div style="text-align:center;">
            <div style="width:40px;height:40px;border:3px solid #e2e8f0;border-top:3px solid #C9973A;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
            <p style="color:#64748b;font-size:15px;margin:0;font-weight:500;">Loading secure certificate...</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          </div>
        </div>
      `);
      const res = await api.get(`/admin/certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      newWindow.location.href = url;
    } catch (error) {
      console.error("Failed to view", error);
      newWindow.close();
      alert("Failed to open certificate. Please try again later.");
    }
  };

  const handleDownloadCertificate = async (id: string, slug: string) => {
    try {
      const res = await api.get(`/admin/certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${slug}-certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download", error);
      alert("Failed to download certificate. Please try again later.");
    }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Back nav */}
      <Link
        href={`${basePath}/programs/${id}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8A9E8C", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 24, transition: "color 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#1C2B1E"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#8A9E8C"; }}
      >
        <ArrowLeft size={15} /> Back to {program.title}
      </Link>

      {/* Header */}
      <div style={{
        background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8EAE4",
        boxShadow: "0 2px 12px rgba(28,43,30,0.05)", padding: "28px 32px", marginBottom: 28,
        display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap"
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: "#F0F2ED",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0
        }}>
          {student.avatar ? (
            <img src={student.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <UserCircle size={40} color="#8A9E8C" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
              {student.name}
            </h1>
            <StatusBadge status={programEnrollment.status} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 20px", color: "#8A9E8C", fontSize: 14 }}>
            <span style={{ whiteSpace: "nowrap" }}>{student.email}</span>
            {student.phone && <span style={{ whiteSpace: "nowrap" }}>• {student.phone}</span>}
            <span style={{ whiteSpace: "nowrap" }}>• Enrolled {format(new Date(programEnrollment.enrolledAt), "MMM d, yyyy")}</span>
            {programEnrollment.completedAt && (
              <span style={{ color: "#4A8C5C", whiteSpace: "nowrap" }}>• Completed {format(new Date(programEnrollment.completedAt), "MMM d, yyyy")}</span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${student.email}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, background: "#F0F2ED", color: "#1C2B1E", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#E4E8E0"} onMouseLeave={(e) => e.currentTarget.style.background = "#F0F2ED"}>
            <Mail size={16} /> Email
          </a>
          {student.phone && (
            <a href={`tel:${student.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, background: "#F0F2ED", color: "#1C2B1E", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#E4E8E0"} onMouseLeave={(e) => e.currentTarget.style.background = "#F0F2ED"}>
              <Phone size={16} /> Call
            </a>
          )}
          <a href={`${basePath}/messages?userId=${student.id}&name=${encodeURIComponent(student.name)}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, background: "#C9973A", color: "#FFFFFF", textDecoration: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#E8B85A"} onMouseLeave={(e) => e.currentTarget.style.background = "#C9973A"}>
            <MessageSquare size={16} /> Message
          </a>
        </div>
      </div>

      {/* Certificates Section */}
      {certificates && certificates.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1C2B1E", margin: "0 0 16px" }}>
            Certificates
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {certificates.map((cert: any) => (
              <div key={cert.id} style={{
                background: "#FFFFFF", borderRadius: 16, border: "1px solid #E8EAE4",
                padding: 20, display: "flex", alignItems: "flex-start", gap: 16
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: "rgba(201,151,58,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#C9973A", flexShrink: 0
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1C2B1E", margin: "0 0 4px" }}>
                    {cert.course?.title || cert.program?.title || "Certificate"}
                  </p>
                  <p style={{ fontSize: 12, color: "#8A9E8C", margin: "0 0 8px" }}>
                    Issued: {format(new Date(cert.issuedAt), "MMM d, yyyy")}
                  </p>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                    <button 
                      onClick={() => handleViewCertificate(cert.id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C9973A", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <Award size={14} /> View PDF
                    </button>
                    <button 
                      onClick={() => handleDownloadCertificate(cert.id, cert.course?.slug || cert.program?.slug || 'certificate')}
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8A9E8C", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade Sheet */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
            Detailed Progress
          </h2>
          <Link href={`${basePath}/programs/${id}/students/${studentId}/grade-sheet`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#C9973A", color: "#FFFFFF", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#E8B85A"} onMouseLeave={(e) => e.currentTarget.style.background = "#C9973A"}>
            View Official Grade Sheet
          </Link>
        </div>
        {courses.length === 0 ? (
          <p style={{ color: "#8A9E8C" }}>No courses in this program.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {courses.map((course: any) => {
              const enrollment = course.enrollments[0];
              const quizzes = course.quizzes || [];
              const assignments = course.assignments || [];

              return (
                <div key={course.id} style={{
                  background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8EAE4",
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "20px 24px", background: "#FAFAF8", borderBottom: "1px solid #EEF0EA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: "#FFFFFF", border: "1px solid #E8EAE4",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#8A9E8C"
                      }}>
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>{course.title}</h3>
                        {enrollment ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#8A9E8C", marginTop: 4 }}>
                            <span>Progress: {enrollment.progress}%</span>
                            <span>•</span>
                            <span style={{ color: enrollment.status === "COMPLETED" ? "#4A8C5C" : "inherit" }}>
                              {enrollment.status}
                            </span>
                          </div>
                        ) : (
                          <p style={{ fontSize: 12, color: "#8C3A3A", margin: "4px 0 0" }}>Not enrolled</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {enrollment && (quizzes.length > 0 || assignments.length > 0) ? (
                    <div style={{ padding: "16px 24px" }}>
                      {/* Quizzes */}
                      {quizzes.length > 0 && (
                        <div style={{ marginBottom: assignments.length > 0 ? 20 : 0 }}>
                          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Quizzes</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {quizzes.map((quiz: any) => {
                              const attempt = quiz.attempts[0];
                              return (
                                <div key={quiz.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
                                  <span style={{ color: "#1C2B1E" }}>{quiz.title}</span>
                                  {attempt ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontWeight: 600, color: attempt.passed ? "#4A8C5C" : "#8C3A3A" }}>
                                          Score: {attempt.score} (Pass: {quiz.passingScore})
                                        </span>
                                        {attempt.passed && <CheckCircle size={14} color="#4A8C5C" />}
                                      </div>
                                      {!attempt.passed && (
                                        <button
                                          onClick={() => handleResetQuiz(quiz.id)}
                                          style={{
                                            fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 4,
                                            background: "rgba(201, 151, 58, 0.1)", color: "#C9973A", border: "1px solid rgba(201, 151, 58, 0.2)", cursor: "pointer"
                                          }}
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span style={{ color: "#8A9E8C", fontSize: 12 }}>Not attempted</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Assignments */}
                      {assignments.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#8A9E8C", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Assignments</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {assignments.map((assignment: any) => {
                              const submission = assignment.submissions[0];
                              return (
                                <div key={assignment.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
                                  <span style={{ color: "#1C2B1E" }}>{assignment.title}</span>
                                  {submission ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 12, color: "#8A9E8C" }}>
                                        {submission.isGraded ? "Graded" : "Submitted"}
                                      </span>
                                      {submission.isGraded && (
                                        <span style={{ fontWeight: 600, color: "#4A8C5C" }}>
                                          {submission.grade} / {assignment.maxScore}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span style={{ color: "#8A9E8C", fontSize: 12 }}>Not submitted</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : enrollment ? (
                    <div style={{ padding: "20px 24px", color: "#8A9E8C", fontSize: 13 }}>
                      No quizzes or assignments in this course.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
