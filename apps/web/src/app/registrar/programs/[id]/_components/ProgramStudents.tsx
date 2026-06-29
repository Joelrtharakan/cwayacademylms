"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getProgramStudents } from "@/lib/api/registrar";
import { SkeletonRow } from "@/components/shared/SkeletonLoader";
import { UserCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function ProgramStudents({ programId }: { programId: string }) {
  const { data: students, isLoading } = useQuery({
    queryKey: ["programStudents", programId],
    queryFn: () => getProgramStudents(programId),
  });

  if (isLoading) {
    return (
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8EAE4", padding: 28 }}>
        {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8EAE4", padding: "60px 28px", textAlign: "center" }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%", background: "rgba(138,158,140,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#8A9E8C",
        }}>
          <UserCircle size={26} />
        </div>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1C2B1E", margin: "0 0 8px" }}>
          No students enrolled
        </h3>
        <p style={{ fontSize: 13, color: "#8A9E8C", margin: "0" }}>
          Students will appear here once they enroll in this program.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8EAE4", boxShadow: "0 1px 4px rgba(28,43,30,0.04)", overflow: "hidden" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid #EEF0EA" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
          Enrolled Students ({students.length})
        </h2>
      </div>

      <div>
        {students.map((enrollment: any, idx: number) => (
          <Link
            key={enrollment.id}
            href={`/registrar/programs/${programId}/students/${enrollment.student.id}`}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "18px 28px",
              borderBottom: idx < students.length - 1 ? "1px solid #F0F2ED" : "none",
              textDecoration: "none", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAF8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: "#F0F2ED",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0
            }}>
              {enrollment.student.avatar ? (
                <img src={enrollment.student.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UserCircle size={24} color="#8A9E8C" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1C2B1E", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {enrollment.student.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#8A9E8C" }}>{enrollment.student.email}</span>
                <span style={{ fontSize: 13, color: "#8A9E8C", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={13} /> Enrolled {format(new Date(enrollment.enrolledAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              <span style={{
                background: enrollment.status === "ACTIVE" ? "rgba(74,140,92,0.12)" : enrollment.status === "COMPLETED" ? "rgba(201,151,58,0.12)" : "rgba(140,58,58,0.12)",
                color: enrollment.status === "ACTIVE" ? "#4A8C5C" : enrollment.status === "COMPLETED" ? "#C9973A" : "#8C3A3A",
                borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                {enrollment.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
