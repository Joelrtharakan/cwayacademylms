"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, PlayCircle, Award, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getCourseAnalytics, getCourseById } from "@/lib/api/instructor";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const MUTED = "#8A9E8C";

export default function CourseAnalyticsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: course } = useQuery({ queryKey: ["course", id], queryFn: () => getCourseById(id) });
  const { data: analytics, isLoading } = useQuery({ queryKey: ["course-analytics", id], queryFn: () => getCourseAnalytics(id) });

  if (isLoading) return <div style={{ color: MUTED }}>Loading analytics...</div>;

  const progressData = [
    { name: "Completed", value: analytics?.studentProgress?.completed || 0, color: "#4ADE80" },
    { name: "In Progress", value: analytics?.studentProgress?.inProgress || 0, color: GOLD },
    { name: "Not Started", value: analytics?.studentProgress?.notStarted || 0, color: "#4B5563" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", cursor: "pointer", transition: "all 0.15s" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: "#F5F0E8", margin: 0 }}>Course Analytics</h1>
          <p style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{course?.title}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Enrollments Chart */}
        <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Users size={18} color={GOLD} /> Enrollments Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics?.enrollmentsOverTime} margin={{ left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke={MUTED} tick={{ fontSize: 11 }} />
              <YAxis stroke={MUTED} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1C2B1E", border: "1px solid rgba(201,151,58,0.3)", borderRadius: 8 }} labelStyle={{ color: "#F5F0E8" }} />
              <Line type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Student Progress */}
        <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Target size={18} color={GOLD} /> Overall Progress</h3>
          <div style={{ display: "flex", alignItems: "center", height: 220 }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={progressData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {progressData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1C2B1E", border: "1px solid rgba(201,151,58,0.3)", borderRadius: 8 }} itemStyle={{ color: "#F5F0E8" }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              {progressData.map(d => (
                <div key={d.name}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} /> {d.name}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#F5F0E8", marginTop: 4, marginLeft: 18 }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Completion Rates */}
      <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><PlayCircle size={18} color={GOLD} /> Lesson Completion Rates</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={analytics?.lessonCompletionRates} margin={{ left: -20 }} layout="vertical">
            <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 100]} stroke={MUTED} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="lessonTitle" type="category" width={180} stroke={MUTED} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#1C2B1E", border: "1px solid rgba(201,151,58,0.3)", borderRadius: 8 }} labelStyle={{ color: "#F5F0E8" }} formatter={(v: any) => [`${Math.round(v)}%`, "Completed"]} />
            <Bar dataKey="completionRate" fill={GOLD} radius={[0, 4, 4, 0]} barSize={16}>
              {analytics?.lessonCompletionRates?.map((e: any, i: number) => <Cell key={i} fill={e.completionRate > 80 ? "#4ADE80" : e.completionRate > 40 ? GOLD : "#F87171"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
