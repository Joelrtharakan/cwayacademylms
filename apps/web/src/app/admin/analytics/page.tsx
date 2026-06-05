"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { getAdminStats, getRevenueAnalytics, getUserAnalytics, getEnrollmentAnalytics, getCourseAnalytics } from "@/lib/api/admin";
import { TrendingUp, Users, GraduationCap, BookOpen } from "lucide-react";

const GOLD = "#C9973A";
const GREEN = "#4A8C5C";
const PURPLE = "#9d99e8";
const MUTED = "#8A9E8C";
const CHART_COLORS = [GOLD, GREEN, PURPLE, "#5B8DE8", "#E85B5B"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-4 py-3 text-sm font-sans shadow-lg bg-white border border-cway-light-border/80">
      <p className="font-bold text-cway-text-muted mb-1 text-[11px] uppercase tracking-wider">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold text-[#1A261D] text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color ?? GOLD }}></span>
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

  const pieData = (courses?.byCategory ?? [])
    .filter((c: any) => c.courseCount > 0)
    .slice(0, 6)
    .map((c: any) => ({ name: c.categoryName, value: c.courseCount }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        subtitle="Platform-wide revenue, growth, and performance metrics"
        actions={
          <div className="flex rounded-[10px] overflow-hidden border border-cway-light-border bg-cway-light-alt p-1 shadow-inner">
            {(["30d", "12m"] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-5 py-1.5 font-sans text-[12px] font-bold tracking-wider uppercase rounded-md transition-all ${
                  period === p 
                    ? "bg-white text-[#1A261D] shadow-sm" 
                    : "text-cway-text-muted hover:text-[#1A261D]"
                }`}>
                {p === "30d" ? "30 Days" : "12 Months"}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString()}`} icon={TrendingUp} />
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} />
        <StatCard label="Total Enrollments" value={stats?.totalEnrollments ?? 0} icon={GraduationCap} />
        <StatCard label="Published Courses" value={stats?.publishedCourses ?? 0} icon={BookOpen} />
      </div>

      {/* Revenue Area Chart */}
      <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
        <h2 className="font-serif font-bold mb-8 text-[22px] text-[#1A261D]">Revenue Over Time</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue ?? []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECE4" />
              <XAxis dataKey="month" tick={{ fill: "#526658", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={15} />
              <YAxis tick={{ fill: "#526658", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EAECE4', strokeWidth: 2, strokeDasharray: '5 5' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={3} fill="url(#revGrad)" activeDot={{ r: 6, fill: GOLD, stroke: "#FFF", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Growth */}
        <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
          <h2 className="font-serif font-bold mb-8 text-[20px] text-[#1A261D]">New Registrations</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={users ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECE4" />
                <XAxis dataKey="month" tick={{ fill: "#526658", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#526658", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FAFAF7' }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: "#526658", paddingTop: "15px" }} />
                <Bar dataKey="students" name="Students" fill={GOLD} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="instructors" name="Instructors" fill={GREEN} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment vs Completions */}
        {/* Enrollment vs Completions */}
        <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
          <h2 className="font-serif font-bold mb-8 text-[20px] text-[#1A261D]">Enrollments & Completions</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollments ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECE4" />
                <XAxis dataKey="month" tick={{ fill: "#526658", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#526658", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EAECE4', strokeWidth: 2, strokeDasharray: '5 5' }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: "#526658", paddingTop: "15px" }} />
                <Line type="monotone" dataKey="newEnrollments" name="Enrollments" stroke={GOLD} strokeWidth={3} dot={{ fill: "#FFF", stroke: GOLD, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="completions" name="Completions" stroke={GREEN} strokeWidth={3} dot={{ fill: "#FFF", stroke: GREEN, strokeWidth: 2, r: 4 }} strokeDasharray="6 6" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row: Course performance + Category breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top 10 by enrollment */}
        <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm flex flex-col">
          <h2 className="font-serif font-bold mb-6 text-[20px] text-[#1A261D]">Top Courses by Enrollment</h2>
          {(courses?.topByEnrollment ?? []).length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-cway-light-alt/50 rounded-xl border border-dashed border-cway-light-border min-h-[200px]">
              <p className="font-sans text-[15px] text-cway-text-muted">No data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(courses?.topByEnrollment ?? []).map((c: any, i: number) => (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="w-6 font-sans text-[13px] font-bold text-cway-text-muted text-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-sans font-semibold text-[14px] text-[#1A261D] truncate">{c.title}</span>
                      <span className="font-sans font-bold text-[12px] flex-shrink-0 ml-3 text-[#1A261D] bg-cway-light-bg px-2 py-0.5 rounded-md border border-cway-light-border shadow-sm">{c.enrollmentCount}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-cway-light-alt border border-cway-light-border/50">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (c.enrollmentCount / ((courses?.topByEnrollment?.[0]?.enrollmentCount || 1))) * 100)}%`,
                        background: GOLD,
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category pie */}
        <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm flex flex-col">
          <h2 className="font-serif font-bold mb-6 text-[20px] text-[#1A261D]">Courses by Category</h2>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-cway-light-alt/50 rounded-xl border border-dashed border-cway-light-border min-h-[200px]">
              <p className="font-sans text-[15px] text-cway-text-muted">No category data yet</p>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={4}>
                    {pieData.map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: "#526658", paddingTop: "20px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
