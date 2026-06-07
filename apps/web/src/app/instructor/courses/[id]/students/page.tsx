"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Mail, Download } from "lucide-react";
import Link from "next/link";
import { api } from "@/store/auth.store";
import { format } from "date-fns";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

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
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", cursor: "pointer", transition: "all 0.15s" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: "#F5F0E8", margin: 0 }}>Enrolled Students</h1>
          <p style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{students.length} students enrolled</p>
        </div>
      </div>

      <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.06)", width: 300 }}>
            <Search size={14} color={MUTED} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ background: "transparent", border: "none", outline: "none", color: "#F5F0E8", fontSize: 13, flex: 1 }} />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F0E8", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Student</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Enrolled</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Progress</th>
              <th style={{ padding: "12px 20px", textAlign: "right", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e: any) => (
              <tr key={e.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${GOLD}20`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontWeight: 700, fontSize: 12 }}>
                      {e.student?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#F5F0E8" }}>{e.student?.name}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>{e.student?.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, color: MUTED }}>
                  {format(new Date(e.enrolledAt), "MMM d, yyyy")}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 10 }}>
                      <div style={{ width: `${e.progress}%`, height: "100%", background: GOLD, borderRadius: 10 }} />
                    </div>
                    <span style={{ fontSize: 12, color: MUTED, width: 32 }}>{Math.round(e.progress)}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right" }}>
                  <Link href={`/instructor/messages/${e.studentId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: GOLD, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                    <Mail size={14} /> Message
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: MUTED, fontSize: 13 }}>No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
