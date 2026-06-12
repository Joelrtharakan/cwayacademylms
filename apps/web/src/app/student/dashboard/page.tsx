"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore, api } from "@/store/auth.store";
import {
  BookOpen, CheckCircle, Award, ClipboardCheck, ArrowRight, Activity, TrendingUp
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1A261D",
        border: "1px solid rgba(184,134,69,0.3)",
        color: "#FFFFFF",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 10px 25px rgba(26,38,29,0.2)",
      }}
    >
      <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", margin: "0 0 4px 0" }}>
        {label}
      </p>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#B88645", margin: 0 }}>
        {payload[0]?.value} Hours
      </p>
    </div>
  );
};

// Mock chart data for Learning Overview
const learningData = [
  { month: "Jan", hours: 12 },
  { month: "Feb", hours: 19 },
  { month: "Mar", hours: 15 },
  { month: "Apr", hours: 22 },
  { month: "May", hours: 28 },
  { month: "Jun", hours: 24 },
  { month: "Jul", hours: 30 },
  { month: "Aug", hours: 36 },
  { month: "Sep", hours: 29 },
  { month: "Oct", hours: 34 },
  { month: "Nov", hours: 42 },
  { month: "Dec", hours: 48 },
];

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: () => api.get("/student/dashboard").then(res => res.data.data),
  });

  const enrollments = data?.enrollments || [];
  const completed = enrollments.filter((e: any) => e.progress >= 100);
  const active = enrollments.filter((e: any) => e.status === "ACTIVE");

  return (
    <div style={{ maxWidth: "1400px" }}>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Student"}`}
        subtitle="Platform overview — track your learning progress and activity at a glance."
      />

      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 1400px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          label="Enrolled Courses"
          value={isLoading ? "—" : enrollments.length}
          icon={BookOpen}
          loading={isLoading}
          color="gold"
        />
        <StatCard
          label="Completed Courses"
          value={isLoading ? "—" : completed.length}
          icon={CheckCircle}
          loading={isLoading}
          color="green"
        />
        <StatCard
          label="Certificates Earned"
          value={isLoading ? "—" : data?.certificatesCount || 0}
          icon={Award}
          loading={isLoading}
          color="purple"
        />
        <StatCard
          label="Pending Assignments"
          value={isLoading ? "—" : data?.pendingAssignmentsCount || 0}
          icon={ClipboardCheck}
          loading={isLoading}
          color="blue"
        />
      </div>

      {/* Learning Overview Chart */}
      <div
        style={{
          borderRadius: "16px",
          marginBottom: "32px",
          background: "#FFFFFF",
          border: "1px solid #E4E8E0",
          boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
          padding: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#1A261D", margin: 0 }}>
              Learning Overview
            </h2>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
              Hours studied (Last 12 months)
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "#F7F8F5",
              border: "1px solid #E4E8E0",
            }}
          >
            <Activity size={13} style={{ color: "#B88645" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#526658" }}>
              Monthly
            </span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ height: "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid #B88645",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : (
          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningData} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="learningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3D7A4B" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#3D7A4B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2ED" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#8F9E93", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#8F9E93", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-8}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E4E8E0", strokeWidth: 2, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#3D7A4B"
                  strokeWidth={2.5}
                  fill="url(#learningGrad)"
                  dot={{ fill: "#FFFFFF", stroke: "#3D7A4B", r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#3D7A4B", stroke: "#FFFFFF", strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom Two Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        
        {/* Active Courses */}
        <div
          style={{
            borderRadius: "16px",
            background: "#FFFFFF",
            border: "1px solid #E4E8E0",
            boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>
                My Active Courses
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                Resume your learning journey
              </p>
            </div>
            <button
              onClick={() => router.push("/student/my-courses")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "6px 12px",
                borderRadius: "8px",
                transition: "all 0.15s",
                color: "#B88645",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(184,134,69,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "56px",
                    borderRadius: "12px",
                    background: "#F7F8F5",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : active.length === 0 ? (
            <div
              style={{
                height: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                background: "#F7F8F5",
                border: "1px dashed #DCE0D5",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#8F9E93", margin: 0 }}>
                You have no active courses right now
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {active.slice(0, 5).map((enrollment: any, i: number) => (
                <div
                  key={enrollment.id}
                  onClick={() => router.push(`/student/courses/${enrollment.course.id}/learn`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "12px",
                    transition: "all 0.15s",
                    border: "1px solid transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F7F8F5";
                    e.currentTarget.style.borderColor = "#E4E8E0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "48px",
                        height: "36px",
                        borderRadius: "6px",
                        flexShrink: 0,
                        overflow: "hidden",
                        background: "#1A261D",
                      }}
                    >
                      {enrollment.course.thumbnail && (
                        <img 
                          src={enrollment.course.thumbnail} 
                          alt="" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1A261D",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {enrollment.course.title}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right", width: "60px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1A261D", marginBottom: "4px", textAlign: "right" }}>
                        {Math.round(enrollment.progress)}%
                      </div>
                      <div style={{ width: "100%", height: "4px", background: "rgba(28,43,30,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${enrollment.progress}%`, height: "100%", background: "#C9973A" }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines Placeholder */}
        <div
          style={{
            borderRadius: "16px",
            background: "#FFFFFF",
            border: "1px solid #E4E8E0",
            boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>
                Upcoming Deadlines
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                Tasks requiring your attention
              </p>
            </div>
          </div>
          <div
            style={{
              height: "160px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              background: "#F7F8F5",
              border: "1px dashed #DCE0D5",
              gap: "8px",
            }}
          >
            <ClipboardCheck size={28} style={{ color: "#DCE0D5" }} />
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#8F9E93", margin: 0 }}>
              No upcoming deadlines
            </p>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
