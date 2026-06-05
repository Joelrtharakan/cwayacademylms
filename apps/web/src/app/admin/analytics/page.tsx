"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { getAdminStats, getRevenueAnalytics, getUserAnalytics, getEnrollmentAnalytics, getCourseAnalytics, getUsers } from "@/lib/api/admin";
import { TrendingUp, Users, GraduationCap, BookOpen, Calendar, BarChart2, Activity, UserPlus } from "lucide-react";

const GOLD = "#B88645";
const GREEN = "#3D7A4B";
const PURPLE = "#653C89";
const BLUE = "#2C4A3B";
const RED = "#B03A2E";
const CHART_COLORS = [GOLD, GREEN, PURPLE, BLUE, RED, "#8F9E93"];

const cardStyle = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(228, 232, 224, 0.8)",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 10px 40px rgba(26, 38, 29, 0.03), inset 0 0 0 1px rgba(255,255,255,1)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      border: "1px solid #E4E8E0",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
    }}>
      <p style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8F9E93", margin: "0 0 8px 0" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: "14px", fontWeight: 700, color: "#1A261D", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color ?? GOLD, display: "inline-block" }}></span>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

type Period = "30d" | "12m";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("12m");

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: getAdminStats });
  const { data: revenue } = useQuery({ queryKey: ["admin-rev", period], queryFn: () => getRevenueAnalytics(period) });
  const { data: users } = useQuery({ queryKey: ["admin-users-an", period], queryFn: () => getUserAnalytics(period) });
  const { data: enrollments } = useQuery({ queryKey: ["admin-enrl", period], queryFn: () => getEnrollmentAnalytics(period) });
  const { data: courses } = useQuery({ queryKey: ["admin-course-an"], queryFn: getCourseAnalytics });
  const { data: recentUsers } = useQuery({ queryKey: ["admin-recent-users"], queryFn: () => getUsers({ limit: 4, sortBy: "createdAt", sortOrder: "desc" }) });

  const pieData = (courses?.byCategory ?? [])
    .filter((c: any) => c.courseCount > 0)
    .slice(0, 6)
    .map((c: any) => ({ name: c.categoryName, value: c.courseCount }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div style={{ flex: 1 }}>
          <PageHeader
            title="Analytics & Reports"
            subtitle="Deep insights into revenue, user growth, and content performance"
          />
        </div>
        <div style={{
          display: "flex",
          background: "#F7F8F5",
          padding: "4px",
          borderRadius: "12px",
          border: "1px solid #E4E8E0",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
        }}>
          {(["30d", "12m"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "8px 20px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                borderRadius: "8px",
                transition: "all 0.2s",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: period === p ? "#FFFFFF" : "transparent",
                color: period === p ? "#1A261D" : "#8F9E93",
                boxShadow: period === p ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
              }}
            >
              <Calendar size={14} />
              {p === "30d" ? "30 Days" : "12 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>
        <StatCard label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString()}`} icon={TrendingUp} color="gold" />
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="green" />
        <StatCard label="Total Enrollments" value={stats?.totalEnrollments ?? 0} icon={GraduationCap} color="blue" />
        <StatCard label="Published Courses" value={stats?.publishedCourses ?? 0} icon={BookOpen} color="purple" />
      </div>

      {/* Revenue Area Chart */}
      <div style={{ ...cardStyle, marginBottom: "32px" }}>
        <div style={{ position: "absolute", top: "-100px", right: "-50px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(184,134,69,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <TrendingUp size={24} color={GOLD} /> Financial Performance
        </h2>
        <div style={{ height: "340px", marginTop: "16px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue ?? []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F2ED" />
              <XAxis dataKey="month" tick={{ fill: "#8F9E93", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={15} />
              <YAxis tick={{ fill: "#8F9E93", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E4E8E0', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={4} fill="url(#revGrad)" activeDot={{ r: 6, fill: GOLD, stroke: "#FFF", strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
        {/* User Growth */}
        <div style={{ ...cardStyle }}>
          <div style={{ position: "absolute", top: "-100px", right: "-50px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(61,122,75,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={22} color={GREEN} /> Audience Growth
          </h2>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={users ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F2ED" />
                <XAxis dataKey="month" tick={{ fill: "#8F9E93", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#8F9E93", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FAFBFA' }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter", color: "#5C7360", paddingTop: "20px" }} />
                <Bar dataKey="students" name="Students" fill={GOLD} radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="instructors" name="Instructors" fill={GREEN} radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment vs Completions */}
        <div style={{ ...cardStyle }}>
          <div style={{ position: "absolute", top: "-100px", right: "-50px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(44,74,59,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
            <GraduationCap size={22} color={BLUE} /> Engagement Metrics
          </h2>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollments ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F2ED" />
                <XAxis dataKey="month" tick={{ fill: "#8F9E93", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#8F9E93", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E4E8E0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter", color: "#5C7360", paddingTop: "20px" }} />
                <Line type="monotone" dataKey="newEnrollments" name="Enrollments" stroke={GOLD} strokeWidth={4} dot={{ fill: "#FFF", stroke: GOLD, strokeWidth: 3, r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="completions" name="Completions" stroke={BLUE} strokeWidth={4} dot={{ fill: "#FFF", stroke: BLUE, strokeWidth: 3, r: 5 }} strokeDasharray="8 6" activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row: Course performance + Category breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* Top 10 by enrollment */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart2 size={22} color={PURPLE} /> Top Performing Courses
          </h2>
          {(courses?.topByEnrollment ?? []).length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFBFA", borderRadius: "12px", border: "1px dashed #E4E8E0", minHeight: "240px" }}>
              <p style={{ fontSize: "14px", color: "#8F9E93", fontWeight: 500 }}>No course data available yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(courses?.topByEnrollment ?? []).map((c: any, i: number) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", borderRadius: "12px", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFBFA"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ 
                    width: "32px", height: "32px", borderRadius: "8px", background: i < 3 ? "rgba(184,134,69,0.1)" : "#F0F2ED", 
                    color: i < 3 ? "#B88645" : "#8F9E93", display: "flex", alignItems: "center", justifyContent: "center", 
                    fontSize: "14px", fontWeight: 800, flexShrink: 0 
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#1A261D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                      <span style={{ 
                        fontSize: "12px", fontWeight: 800, color: "#5C7360", background: "#F0F2ED", padding: "4px 10px", borderRadius: "8px", flexShrink: 0 
                      }}>
                        {c.enrollmentCount} <span style={{ fontWeight: 600, color: "#8F9E93" }}>Enrolled</span>
                      </span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "999px", background: "#F0F2ED", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: "999px",
                        width: `${Math.min(100, (c.enrollmentCount / ((courses?.topByEnrollment?.[0]?.enrollmentCount || 1))) * 100)}%`,
                        background: i === 0 ? "linear-gradient(90deg, #C9973A 0%, #B88645 100%)" : i < 3 ? GOLD : "#8F9E93",
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category pie and Recent Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Category pie */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignSelf: "start", width: "100%" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <BookOpen size={22} color={RED} /> Distribution by Category
            </h2>
            {pieData.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFBFA", borderRadius: "12px", border: "1px dashed #E4E8E0", minHeight: "240px" }}>
                <p style={{ fontSize: "14px", color: "#8F9E93", fontWeight: 500 }}>No category data available yet.</p>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                <div style={{ width: "100%", height: "350px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="45%" cy="50%" innerRadius={85} outerRadius={135} dataKey="value" nameKey="name" paddingAngle={4} stroke="none">
                        {pieData.map((_: any, i: number) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 13, fontWeight: 600, color: "#5C7360", paddingLeft: "10px", lineHeight: "32px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <Activity size={22} color={BLUE} /> Recent Signups
            </h2>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              {(recentUsers?.users ?? []).length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFBFA", borderRadius: "12px", border: "1px dashed #E4E8E0", minHeight: "150px" }}>
                  <p style={{ fontSize: "14px", color: "#8F9E93", fontWeight: 500 }}>No recent activity.</p>
                </div>
              ) : (
                (recentUsers?.users ?? []).slice(0, 4).map((user: any, i: number) => (
                  <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", borderRadius: "12px", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFBFA"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ 
                      width: "40px", height: "40px", borderRadius: "10px", background: "rgba(44,74,59,0.08)", 
                      color: "#2C4A3B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
                    }}>
                      <UserPlus size={18} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#1A261D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#8F9E93", flexShrink: 0 }}>
                          {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#5C7360", display: "flex", alignItems: "center", gap: "6px" }}>
                        Joined as <span style={{ padding: "2px 6px", background: user.role === "INSTRUCTOR" ? "rgba(184,134,69,0.1)" : "#F0F2ED", color: user.role === "INSTRUCTOR" ? "#B88645" : "#8F9E93", borderRadius: "4px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>{user.role}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
