"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  GraduationCap, BookOpen, TrendingUp, Users, AlertTriangle,
  Star, ArrowRight, Activity,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminStats, getRevenueAnalytics, getCourseAnalytics, getUsers } from "@/lib/api/admin";
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

  const topCourses = courseData?.topByEnrollment?.slice(0, 5) ?? [];
  const recentUsers = usersData?.users ?? [];

  return (
    <div style={{ maxWidth: "1400px" }}>
      <PageHeader
        title="Dashboard"
        subtitle="Platform overview — track your growth and activity at a glance."
      />

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
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
            onClick={() => router.push("/admin/courses?status=PENDING")}
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

      {/* Revenue Chart */}
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
            <ResponsiveContainer width="100%" height="100%">
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
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  dx={-8}
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

      {/* Bottom Two Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
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
              onClick={() => router.push("/admin/courses")}
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
              onClick={() => router.push("/admin/users")}
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
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <RoleBadge role={user.role} />
                    <span style={{ fontSize: "11px", fontWeight: 500, color: "#8F9E93", minWidth: "70px", textAlign: "right" }}>
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
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
