"use client";

import React, { useState } from "react";
import { useManagementPath } from "@/hooks/useManagementPath";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  GraduationCap, BookOpen, TrendingUp, Users, AlertTriangle,
  Star, ArrowRight, Activity, Plus, Bell, Tag, Clock, FileText, CheckCircle, Shield, Radio,
  Mail, MapPin, Building, BadgeCheck, Medal
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminStats, getRevenueAnalytics, getCourseAnalytics, getUsers, getRecentEnrollments, getStudentTimeAnalytics, getApplications, getCourses, getLogs } from "@/lib/api/admin";
import { formatDistanceToNow } from "date-fns";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:      { bg: "rgba(60,52,137,0.08)", color: "#3c3489" },
  INSTRUCTOR: { bg: "rgba(61,122,75,0.08)", color: "#3D7A4B" },
  STUDENT:    { bg: "rgba(184,134,69,0.08)", color: "#B88645" },
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_COLORS[role] || { bg: "rgba(143,158,147,0.1)", color: "#8F9E93" };
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: "10px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {role}
    </span>
  );
}

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
        ₹{payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
};

export default function AdminDashboardPage() {
  const basePath = useManagementPath();
  const router = useRouter();
  const [period] = useState<"12m">("12m");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["admin-revenue", period],
    queryFn: () => getRevenueAnalytics(period),
  });

  const { data: courseData, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-course-analytics"],
    queryFn: getCourseAnalytics,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-recent-users"],
    queryFn: () => getUsers({ limit: 8, sortBy: "createdAt", sortOrder: "desc" }),
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["admin-recent-enrollments"],
    queryFn: () => getRecentEnrollments(5),
  });

  const { data: activeStudentsData, isLoading: activeStudentsLoading } = useQuery({
    queryKey: ["admin-active-students"],
    queryFn: () => getStudentTimeAnalytics(5),
  });

  const { data: pendingCoursesData } = useQuery({
    queryKey: ["admin-pending-courses"],
    queryFn: () => getCourses({ status: "PENDING", limit: 1 }),
  });

  const { data: pendingAppsData } = useQuery({
    queryKey: ["admin-pending-apps"],
    queryFn: () => getApplications({ status: "PENDING", limit: 1 }),
  });

  const { data: recentLogsData, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: () => getLogs({ limit: 6 }),
  });

  const topCourses = courseData?.topByEnrollment?.slice(0, 5) ?? [];
  const completionRates = courseData?.completionRates?.slice(0, 5) ?? [];
  const topRatedCourses = courseData?.topByRating?.slice(0, 5) ?? [];
  const byCategory = courseData?.byCategory ?? [];
  
  const recentUsers = usersData?.users ?? [];
  const recentEnrollments = enrollmentsData ?? [];
  const activeStudents = activeStudentsData ?? [];
  const recentLogs = recentLogsData?.logs ?? [];
  const pendingAppsCount = pendingAppsData?.total ?? 0;

  const CATEGORY_COLORS = ["#B88645", "#3D7A4B", "#3c3489", "#1A261D", "#8F9E93"];

  function formatSeconds(seconds: number) {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div style={{ maxWidth: "1400px" }}>
      <PageHeader
        title="Dashboard"
        subtitle="Platform overview — track your growth and activity at a glance."
      />

      {/* Needs Attention */}
      {((stats?.pendingApprovals ?? 0) > 0 || pendingAppsCount > 0) && (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
          {(stats?.pendingApprovals ?? 0) > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 24px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(184,134,69,0.1), rgba(184,134,69,0.05))",
                border: "1px solid rgba(184,134,69,0.2)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => router.push(`${basePath}/courses?status=PENDING`)}
              className="hover-card"
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(184,134,69,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645" }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1A261D", margin: 0 }}>{stats?.pendingApprovals} Pending Courses</h3>
                <p style={{ fontSize: "13px", color: "#8F9E93", margin: "2px 0 0 0" }}>Require your review</p>
              </div>
            </div>
          )}
          {pendingAppsCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 24px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(60,52,137,0.1), rgba(60,52,137,0.05))",
                border: "1px solid rgba(60,52,137,0.2)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => router.push(`${basePath}/applications`)}
              className="hover-card"
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(60,52,137,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3c3489" }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1A261D", margin: 0 }}>{pendingAppsCount} Applications</h3>
                <p style={{ fontSize: "13px", color: "#8F9E93", margin: "2px 0 0 0" }}>Awaiting approval</p>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .hover-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .hover-scale:hover { transform: scale(1.02); }
        .hover-bg:hover { background: #E4E8E0 !important; }
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
          label="Total Students"
          value={statsLoading ? "—" : (stats?.totalStudents ?? 0).toLocaleString()}
          icon={GraduationCap}
          loading={statsLoading}
          color="gold"
        />
        <StatCard
          label="Total Courses"
          value={statsLoading ? "—" : (stats?.totalCourses ?? 0).toLocaleString()}
          icon={BookOpen}
          loading={statsLoading}
          color="green"
        />
        <StatCard
          label="Revenue This Month"
          value={statsLoading ? "—" : `₹${(stats?.revenueThisMonth ?? 0).toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          trendValue="This month"
          loading={statsLoading}
          color="gold"
        />
        <StatCard
          label="Active Enrollments"
          value={statsLoading ? "—" : (stats?.totalEnrollments ?? 0).toLocaleString()}
          icon={Users}
          loading={statsLoading}
          color="blue"
        />
      </div>

      {/* Pending Approvals Banner */}
      {!statsLoading && stats?.pendingApprovals > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "32px",
            background: "rgba(196,125,17,0.06)",
            border: "1px solid rgba(196,125,17,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(196,125,17,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={17} style={{ color: "#C47D11" }} />
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0 }}>
                {stats.pendingApprovals} course{stats.pendingApprovals !== 1 ? "s" : ""} awaiting your approval
              </p>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0" }}>
                Review and publish submitted courses
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`${basePath}/courses?status=PENDING`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "10px 16px",
              borderRadius: "10px",
              transition: "all 0.15s",
              background: "#FFFFFF",
              border: "1px solid #E4E8E0",
              color: "#1A261D",
              boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C47D11";
              e.currentTarget.style.color = "#C47D11";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E4E8E0";
              e.currentTarget.style.color = "#1A261D";
            }}
          >
            Review Now <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "32px", alignItems: "stretch" }}>
        {/* Revenue Chart */}
        <div
          style={{
            borderRadius: "16px",
            background: "#FFFFFF",
            border: "1px solid #E4E8E0",
            boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
            padding: "28px",
          }}
        >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#1A261D", margin: 0 }}>
              Revenue Overview
            </h2>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
              Last 12 months
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

        {revenueLoading ? (
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
        ) : !revenue || revenue.length === 0 ? (
          <div
            style={{
              height: "260px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              borderRadius: "12px",
              background: "#F7F8F5",
              border: "1px dashed #DCE0D5",
            }}
          >
            <TrendingUp size={28} style={{ color: "#DCE0D5" }} />
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#8F9E93", margin: 0 }}>
              No revenue data yet
            </p>
          </div>
        ) : (
          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B88645" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#B88645" stopOpacity={0} />
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
                  tickFormatter={(v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E4E8E0", strokeWidth: 2, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#B88645"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ fill: "#FFFFFF", stroke: "#B88645", r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#B88645", stroke: "#FFFFFF", strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        </div>

        {/* Category Distribution Chart */}
        <div style={{ borderRadius: "16px", background: "#FFFFFF", border: "1px solid #E4E8E0", boxShadow: "0 1px 3px rgba(26,38,29,0.04)", padding: "28px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>Category Distribution</h2>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>Courses per category</p>
          </div>
          {coursesLoading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "32px", height: "32px", border: "3px solid #3c3489", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : byCategory.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", borderRadius: "12px", background: "#F7F8F5", border: "1px dashed #DCE0D5" }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#8F9E93", margin: 0 }}>No categories</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ height: "180px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={byCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="courseCount" stroke="none">
                      {byCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div style={{ background: "#1A261D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                            <span style={{ fontWeight: 600 }}>{data.categoryName}</span>: {data.courseCount} courses
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                {byCategory.slice(0, 4).map((cat: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span style={{ color: "#526658" }}>{cat.categoryName}</span>
                    </div>
                    <span style={{ color: "#1A261D", fontWeight: 600 }}>{cat.courseCount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Two Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "24px" }}>
        {/* Top Courses */}
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
                Top Courses
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                By enrollment count
              </p>
            </div>
            <button
              onClick={() => router.push(`${basePath}/courses`)}
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

          {coursesLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(5)].map((_, i) => (
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
          ) : topCourses.length === 0 ? (
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
                No published courses yet
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {topCourses.map((course: any, i: number) => (
                <div
                  key={course.id}
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
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        background: "rgba(184,134,69,0.1)",
                        color: "#B88645",
                        border: "1px solid rgba(184,134,69,0.2)",
                      }}
                    >
                      {i + 1}
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
                      {course.title}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1A261D" }}>
                        {course.enrollmentCount}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 500, color: "#8F9E93", marginLeft: "4px" }}>
                        students
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        background: "#F7F8F5",
                        border: "1px solid #E4E8E0",
                      }}
                    >
                      <Star size={11} fill="#B88645" style={{ color: "#B88645" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1A261D" }}>
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Completion Rates */}
        <div style={{ borderRadius: "16px", background: "#FFFFFF", border: "1px solid #E4E8E0", boxShadow: "0 1px 3px rgba(26,38,29,0.04)", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>Completion Rates</h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>Highest completion %</p>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(61,122,75,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D7A4B" }}>
              <CheckCircle size={18} />
            </div>
          </div>
          {coursesLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[...Array(5)].map((_, i) => <div key={i} style={{ height: "40px", borderRadius: "8px", background: "#F7F8F5", animation: "pulse 1.5s ease-in-out infinite" }} />)}
            </div>
          ) : completionRates.length === 0 ? (
            <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "#F7F8F5", border: "1px dashed #DCE0D5" }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#8F9E93", margin: 0 }}>No completion data yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {completionRates.map((course: any, i: number) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                    <span style={{ color: "#1A261D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "80%" }}>{course.courseTitle}</span>
                    <span style={{ color: "#3D7A4B" }}>{course.completionRate}%</span>
                  </div>
                  <div style={{ height: "6px", width: "100%", background: "#F7F8F5", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${course.completionRate}%`, background: "#3D7A4B", borderRadius: "3px", transition: "width 1s ease-out" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Rated Courses */}
        <div style={{ borderRadius: "16px", background: "#FFFFFF", border: "1px solid #E4E8E0", boxShadow: "0 1px 3px rgba(26,38,29,0.04)", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>Top Rated Courses</h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>Highest average reviews</p>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645" }}>
              <Medal size={18} />
            </div>
          </div>
          {coursesLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(5)].map((_, i) => <div key={i} style={{ height: "48px", borderRadius: "12px", background: "#F7F8F5", animation: "pulse 1.5s ease-in-out infinite" }} />)}
            </div>
          ) : topRatedCourses.length === 0 ? (
            <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "#F7F8F5", border: "1px dashed #DCE0D5" }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#8F9E93", margin: 0 }}>No ratings yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topRatedCourses.map((course: any, i: number) => (
                <div key={course.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", background: "#FAFAFA", border: "1px solid #F7F8F5" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#1A261D", border: "1px solid #E4E8E0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1A261D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{course.title}</span>
                    <span style={{ display: "block", fontSize: "12px", color: "#8F9E93", marginTop: "2px" }}>{course.reviewCount} reviews</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(184,134,69,0.1)", padding: "4px 8px", borderRadius: "6px" }}>
                    <Star size={12} fill="#B88645" style={{ color: "#B88645" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#B88645" }}>{course.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Signups */}
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
                Recent Signups
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                Newest registered users
              </p>
            </div>
            <button
              onClick={() => router.push(`${basePath}/users`)}
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
              Manage all <ArrowRight size={12} />
            </button>
          </div>

          {usersLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(5)].map((_, i) => (
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
          ) : recentUsers.length === 0 ? (
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
                No users yet
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "12px",
                    transition: "all 0.15s",
                    cursor: "pointer",
                    border: "1px solid transparent",
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
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: "#1A261D",
                        color: "#FFFFFF",
                      }}
                    >
                      {user.name?.slice(0, 2) || "U"}
                    </div>
                    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                      <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.name} {user.emailVerified && <BadgeCheck size={14} style={{ color: "#3D7A4B" }} />}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          <Mail size={12} /> {user.email}
                        </p>
                        {(user.location || user.church) && (
                          <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user.location ? <><MapPin size={12} /> {user.location}</> : <><Building size={12} /> {user.church}</>}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <RoleBadge role={user.role} />
                    {user.role === "STUDENT" && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1A261D" }}>
                          {user._count?.enrollments || 0}
                        </span>
                        <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#8F9E93" }}>
                          Courses
                        </span>
                      </div>
                    )}
                    <span style={{ fontSize: "11px", fontWeight: 500, color: "#8F9E93", minWidth: "70px", textAlign: "right" }}>
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                    <a
                      href={`mailto:${user.email}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: "28px", height: "28px", borderRadius: "8px", background: "rgba(184,134,69,0.1)", color: "#B88645", transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.1)"; }}
                    >
                      <Mail size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Recent Enrollments */}
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
                Recent Enrollments
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                Latest course joins & progress
              </p>
            </div>
          </div>

          {enrollmentsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(5)].map((_, i) => (
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
          ) : recentEnrollments.length === 0 ? (
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
                No enrollments yet
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentEnrollments.map((enr: any) => (
                <div
                  key={enr.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: "rgba(184,134,69,0.1)",
                        color: "#B88645",
                      }}
                    >
                      {enr.student?.name?.slice(0, 2) || "S"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {enr.student?.name}
                      </p>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Enrolled in <span style={{ color: "#B88645" }}>{enr.course?.title}</span>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1A261D" }}>
                      {enr.progress}%
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 500, color: "#8F9E93", marginTop: "2px" }}>
                      {formatDistanceToNow(new Date(enr.enrolledAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Active Students */}
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
                Most Active Students
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                By total time spent learning
              </p>
            </div>
          </div>

          {activeStudentsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(5)].map((_, i) => (
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
          ) : activeStudents.length === 0 ? (
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
                No active students yet
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeStudents.map((student: any, i: number) => (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        background: "rgba(61,122,75,0.1)",
                        color: "#3D7A4B",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {student.name}
                      </p>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {student.enrollmentCount} course{student.enrollmentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1A261D" }}>
                      {formatSeconds(student.totalSeconds)}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8F9E93", marginTop: "2px" }}>
                      Active Time
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div
          style={{
            borderRadius: "16px",
            background: "#FFFFFF",
            border: "1px solid #E4E8E0",
            boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
            padding: "28px",
            gridColumn: "1 / -1",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1A261D", margin: 0 }}>
                Live Activity Log
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                Real-time platform events
              </p>
            </div>
            <button
              onClick={() => router.push(`${basePath}/logs`)}
              style={{
                background: "transparent", border: "none", color: "#8F9E93",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {logsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    background: "#F7F8F5",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div
              style={{
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                background: "#F7F8F5",
                border: "1px dashed #DCE0D5",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#8F9E93", margin: 0 }}>
                No recent activity
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #F7F8F5",
                    background: "#FAFAFA",
                  }}
                >
                  <div
                    style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: log.action.includes("CREATE") ? "rgba(61,122,75,0.1)" : log.action.includes("DELETE") ? "rgba(220,38,38,0.1)" : "rgba(138,141,145,0.1)",
                      color: log.action.includes("CREATE") ? "#3D7A4B" : log.action.includes("DELETE") ? "#DC2626" : "#8F9E93",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}
                  >
                    <Activity size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#1A261D", margin: 0 }}>
                      <span style={{ fontWeight: 600 }}>{log.user?.name || log.actorName || "System"}</span>{" "}
                      {(() => {
                        const act = log.action || "";
                        switch(act) {
                          case "CREATE": return "created a new";
                          case "UPDATE": return "updated";
                          case "DELETE": return "deleted";
                          case "LOGIN": return "logged in";
                          case "LOGOUT": return "logged out";
                          case "APPROVE": return "approved";
                          case "REJECT": return "rejected";
                          case "BAN": return "banned";
                          case "UNBAN": return "unbanned";
                          default: return act ? act.replace(/_/g, " ").toLowerCase() : "performed action";
                        }
                      })()}{" "}
                      {log.resource ? <span style={{ fontWeight: 600 }}>{log.resource.toLowerCase().replace(/_/g, " ")}</span> : null}
                    </p>
                    {log.description && (
                      <p style={{ fontSize: "13px", color: "#8F9E93", margin: "4px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {log.description}
                      </p>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 500, color: "#8F9E93", flexShrink: 0 }}>
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
