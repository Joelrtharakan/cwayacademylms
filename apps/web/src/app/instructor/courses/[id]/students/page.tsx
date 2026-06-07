"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Mail, Download } from "lucide-react";
import Link from "next/link";
import { api } from "@/store/auth.store";
import { format } from "date-fns";

const GOLD = "var(--gold-primary, #C9A84C)";
const SURFACE = "#FFFFFF";
const DARK = "#1A261D";
const MUTED = "#8F9E93";

export default function CourseStudentsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["course-analytics", id],
    queryFn: () => api.get(`/instructor/courses/${id}/analytics`).then(r => r.data.data),
  });

  // Since we don't have a direct /students endpoint for a course in the controller,
  // we can use the analytics endpoint or a custom one. Wait, let me fetch enrollments.
  const { data: enrollmentsData } = useQuery({
    queryKey: ["course-enrollments", id],
    queryFn: () => api.get(`/admin/courses/${id}`).then(r => r.data.data),
  });

  const students = enrollmentsData?.enrollments || [];
  
  const filtered = students.filter((e: any) => 
    e.student?.name?.toLowerCase().includes(search.toLowerCase()) || 
    e.student?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <button onClick={() => router.back()} style={{ background: "#FFFFFF", border: "1px solid var(--border-light, #E2E8F0)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: DARK, cursor: "pointer", transition: "all 0.15s", boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))" }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: 26, fontWeight: 700, color: DARK, margin: 0, letterSpacing: "0.5px" }}>Enrolled Students</h1>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>{students.length} students enrolled</p>
        </div>
      </div>

      <div style={{ background: SURFACE, border: "1px solid var(--border-light, #E2E8F0)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light, #E2E8F0)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--cream-light, #F9FAF8)", borderRadius: 8, padding: "10px 14px", border: "1px solid var(--border-light, #E2E8F0)", width: 320 }}>
            <Search size={16} color={MUTED} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ background: "transparent", border: "none", outline: "none", color: DARK, fontSize: 14, flex: 1 }} />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid var(--border-light, #E2E8F0)", color: DARK, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))" }}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--cream-mid, #F4F5F1)" }}>
              <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Student</th>
              <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Enrolled</th>
              <th style={{ padding: "14px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Progress</th>
              <th style={{ padding: "14px 24px", textAlign: "right", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e: any) => (
              <tr key={e.id} style={{ borderTop: "1px solid var(--border-light, #E2E8F0)", background: "#FFFFFF", transition: "background 0.15s" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `rgba(201,168,76,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-dark, #A68A3D)", fontWeight: 700, fontSize: 14 }}>
                      {e.student?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{e.student?.name}</div>
                      <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{e.student?.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, color: MUTED }}>
                  {format(new Date(e.enrolledAt), "MMM d, yyyy")}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 8, background: "var(--border-light, #E2E8F0)", borderRadius: 10 }}>
                      <div style={{ width: `${e.progress}%`, height: "100%", background: GOLD, borderRadius: 10 }} />
                    </div>
                    <span style={{ fontSize: 13, color: MUTED, width: 36, fontWeight: 600 }}>{Math.round(e.progress)}%</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <Link href={`/instructor/messages/${e.studentId}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gold-dark, #A68A3D)", background: "rgba(201,168,76,0.1)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "background 0.2s" }}>
                    <Mail size={16} /> Message
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "48px", textAlign: "center", color: MUTED, fontSize: 14, background: "#FFFFFF" }}>No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
