"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GraduationCap, TrendingUp, Star, Award, AlertTriangle, ArrowRight, Plus, Activity, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getInstructorStats, getInstructorCourses, getCourseAnalytics } from "@/lib/api/instructor";
import { useAuthStore } from "@/store/auth.store";
import { StatCard } from "@/components/admin/StatCard";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    PUBLISHED: { bg: "rgba(61,122,75,0.1)", text: "#3D7A4B" },
    DRAFT: { bg: "rgba(184,134,69,0.1)", text: "#B88645" },
    PENDING: { bg: "rgba(60,52,137,0.1)", text: "#3c3489" },
    REJECTED: { bg: "rgba(176,58,46,0.1)", text: "#B03A2E" },
  };
  const s = map[status] || map.DRAFT;
  return <span style={{ background: s.bg, color: s.text, borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{status}</span>;
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
        {payload[0]?.value?.toLocaleString()} enrollments
      </p>
    </div>
  );
};

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["instructor-stats"], queryFn: getInstructorStats });
  const { data: coursesData, isLoading: coursesLoading } = useQuery({ queryKey: ["instructor-courses"], queryFn: () => getInstructorCourses() });

  const courses = coursesData?.courses || [];
  const firstCourseId = courses[0]?.id;

  const { data: analytics } = useQuery({ queryKey: ["course-analytics", firstCourseId], queryFn: () => getCourseAnalytics(firstCourseId!), enabled: !!firstCourseId });

  const revenueData = analytics?.enrollmentsOverTime || Array.from({ length: 6 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i], count: 0,
  }));

  return (
    <div style={{ maxWidth: "1400px" }}>
      {/* Header section */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#1A261D", margin: 0, lineHeight: 1.2 }}>
            Welcome back, {user?.name?.split(" ")[0] || "Instructor"}
          </h1>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "#8F9E93", margin: "6px 0 0 0", lineHeight: 1.5 }}>
            Here's what's happening in your courses today.
          </p>
        </div>
        <Link 
          href="/instructor/courses/new" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            background: "#1A261D", 
            color: "#FFFFFF", 
            borderRadius: "10px", 
            padding: "10px 20px", 
            fontSize: "13px", 
            fontWeight: 600, 
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(26,38,29,0.15)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(26,38,29,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,38,29,0.15)";
          }}
        >
          <Plus size={16} />
          New Course
        </Link>
      </div>

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
          label="Total Students"
          value={statsLoading ? "—" : (stats?.totalStudents ?? 0).toLocaleString()}
          icon={GraduationCap}
          loading={statsLoading}
          color="gold"
        />
        <StatCard
          label="Revenue Earned"
          value={statsLoading ? "—" : `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          loading={statsLoading}
          color="green"
        />
        <StatCard
          label="Avg Rating"
          value={statsLoading ? "—" : (stats?.avgRating ?? 0).toFixed(1)}
          icon={Star}
          loading={statsLoading}
          color="gold"
        />
        <StatCard
          label="Completions"
          value={statsLoading ? "—" : (stats?.totalCompletions ?? 0).toLocaleString()}
          icon={Award}
          loading={statsLoading}
          color="blue"
        />
      </div>

      {/* Pending Action Banner */}
      {!statsLoading && stats?.pendingSubmissions > 0 && (
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
                {stats.pendingSubmissions} assignment{stats.pendingSubmissions !== 1 ? "s" : ""} awaiting grading
              </p>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0" }}>
                Review and grade student submissions
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/instructor/assignments")}
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
            Grade Now <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Chart Section */}
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
              Enrollments Over Time
            </h2>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
              {courses.length > 0 ? courses[0]?.title : "Course analytics"}
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
              Recent Trend
            </span>
          </div>
        </div>

        {!revenueData || revenueData.length === 0 ? (
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
              No enrollment data yet
            </p>
          </div>
        ) : (
          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
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
                  dx={-8}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E4E8E0", strokeWidth: 2, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#B88645"
                  strokeWidth={2.5}
                  fill="url(#enrollmentGrad)"
                  dot={{ fill: "#FFFFFF", stroke: "#B88645", r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#B88645", stroke: "#FFFFFF", strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom Courses Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
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
                Recent Courses
              </h2>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "4px 0 0 0" }}>
                Manage your content
              </p>
            </div>
            <button
              onClick={() => router.push("/instructor/courses")}
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
          ) : courses.length === 0 ? (
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
                No courses yet
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {courses.slice(0, 5).map((course: any, i: number) => (
                <div
                  key={course.id}
                  onClick={() => router.push(`/instructor/courses/${course.id}`)}
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
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(184,134,69,0.1)",
                        color: "#B88645",
                        border: "1px solid rgba(184,134,69,0.2)",
                        overflow: "hidden"
                      }}
                    >
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <BookOpen size={18} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {course.title}
                      </p>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        ₹{course.price} • {course._count?.enrollments || 0} students
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <StatusBadge status={course.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
