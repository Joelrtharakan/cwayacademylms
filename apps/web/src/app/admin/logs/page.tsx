"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  LogIn,
  LogOut,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  User,
  Clock,
  Globe,
  ShieldAlert,
  MessageCircle,
  FileCheck,
  BookOpen,
  Bookmark,
  Award,
  PenTool,
  AlertOctagon,
} from "lucide-react";
import { getLogs, getLogStats } from "@/lib/api/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityLog {
  id: string;
  userId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  } | null;
}

interface LogStats {
  total: number;
  logins: number;
  mutations: number;
  failures: number;
  byAction: { action: string; count: number }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  LOGIN: { label: "Login", color: "#16A34A", bg: "rgba(22,163,74,0.1)", icon: <LogIn size={11} /> },
  LOGOUT: { label: "Logout", color: "#6B7280", bg: "rgba(107,114,128,0.1)", icon: <LogOut size={11} /> },
  LOGIN_FAILED: { label: "Login Failed", color: "#DC2626", bg: "rgba(220,38,38,0.1)", icon: <ShieldAlert size={11} /> },
  CREATE: { label: "Created", color: "#2563EB", bg: "rgba(37,99,235,0.1)", icon: <Activity size={11} /> },
  UPDATE: { label: "Updated", color: "#D97706", bg: "rgba(217,119,6,0.1)", icon: <Edit3 size={11} /> },
  DELETE: { label: "Deleted", color: "#DC2626", bg: "rgba(220,38,38,0.1)", icon: <Trash2 size={11} /> },
  APPROVE: { label: "Approved", color: "#059669", bg: "rgba(5,150,105,0.1)", icon: <CheckCircle size={11} /> },
  REJECT: { label: "Rejected", color: "#DC2626", bg: "rgba(220,38,38,0.1)", icon: <XCircle size={11} /> },
  BAN: { label: "Banned", color: "#7C3AED", bg: "rgba(124,58,237,0.1)", icon: <Shield size={11} /> },
  UNBAN: { label: "Unbanned", color: "#059669", bg: "rgba(5,150,105,0.1)", icon: <Shield size={11} /> },
  REFUND: { label: "Refund", color: "#D97706", bg: "rgba(217,119,6,0.1)", icon: <RefreshCw size={11} /> },
  BROADCAST: { label: "Broadcast", color: "#0EA5E9", bg: "rgba(14,165,233,0.1)", icon: <Activity size={11} /> },
  IMPERSONATE: { label: "Impersonate", color: "#7C3AED", bg: "rgba(124,58,237,0.1)", icon: <User size={11} /> },
  QUIZ_ATTEMPT: { label: "Quiz Attempt", color: "#2563EB", bg: "rgba(37,99,235,0.1)", icon: <PenTool size={11} /> },
  QUIZ_SUBMIT: { label: "Quiz Submitted", color: "#059669", bg: "rgba(5,150,105,0.1)", icon: <CheckCircle size={11} /> },
  ASSIGNMENT_SUBMIT: { label: "Assignment Submitted", color: "#059669", bg: "rgba(5,150,105,0.1)", icon: <FileCheck size={11} /> },
  ASSIGNMENT_UNSUBMIT: { label: "Assignment Unsubmitted", color: "#D97706", bg: "rgba(217,119,6,0.1)", icon: <RefreshCw size={11} /> },
  LESSON_COMPLETE: { label: "Lesson Completed", color: "#059669", bg: "rgba(5,150,105,0.1)", icon: <CheckCircle size={11} /> },
  GRADE: { label: "Graded", color: "#7C3AED", bg: "rgba(124,58,237,0.1)", icon: <Award size={11} /> },
  SUBMIT_REVIEW: { label: "Submitted for Review", color: "#0EA5E9", bg: "rgba(14,165,233,0.1)", icon: <FileCheck size={11} /> },
  ENROLL: { label: "Enrolled", color: "#16A34A", bg: "rgba(22,163,74,0.1)", icon: <BookOpen size={11} /> },
  DISCUSSION_POST: { label: "Posted Discussion", color: "#2563EB", bg: "rgba(37,99,235,0.1)", icon: <MessageCircle size={11} /> },
  DISCUSSION_REPLY: { label: "Replied", color: "#2563EB", bg: "rgba(37,99,235,0.1)", icon: <MessageCircle size={11} /> },
  ERROR: { label: "API Error", color: "#DC2626", bg: "rgba(220,38,38,0.1)", icon: <AlertOctagon size={11} /> },
};

const ACTION_LABELS = ["All Actions", ...Object.keys(ACTION_CONFIG)];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getInitials(name: string | null, email: string | null): string {
  if (name) return name.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function getAvatarColor(role: string | null): string {
  const colors: Record<string, string> = {
    ADMIN: "#B88645",
    INSTRUCTOR: "#2563EB",
    STUDENT: "#059669",
  };
  return colors[role ?? ""] ?? "#6B7280";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8EDE4",
        borderRadius: "14px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flex: 1,
        minWidth: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#1A261D", lineHeight: 1.1 }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#8F9E93", marginTop: "2px" }}>{label}</div>
        {sub && <div style={{ fontSize: "11px", color: "#B0B8B2", marginTop: "2px" }}>{sub}</div>}
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const cfg = ACTION_CONFIG[action] ?? {
    label: action,
    color: "#6B7280",
    bg: "rgba(107,114,128,0.1)",
    icon: <Activity size={11} />,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 8px",
        borderRadius: "20px",
        background: cfg.bg,
        color: cfg.color,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const ok = status === "SUCCESS";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        fontWeight: 600,
        color: ok ? "#16A34A" : "#DC2626",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: ok ? "#16A34A" : "#DC2626",
          flexShrink: 0,
        }}
      />
      {ok ? "Success" : "Failed"}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLogsPage() {

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getLogStats(30);
      setStats(data);
    } catch {}
    setStatsLoading(false);
  }, []);

  const fetchLogs = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const data = await getLogs({
          page: pageNum,
          limit: 50,
          search: search || undefined,
          action: actionFilter || undefined,
          status: statusFilter || undefined,
          role: roleFilter || undefined,
        });
        setLogs(data.logs);
        setPagination(data.pagination);
      } catch {}
      setLoading(false);
    },
    [search, actionFilter, statusFilter, roleFilter]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handleRefresh = () => {
    fetchStats();
    fetchLogs(page);
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(184,134,69,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#B88645",
              }}
            >
              <Activity size={18} />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1A261D", margin: 0 }}>Activity Logs</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#8F9E93", margin: 0, paddingLeft: "46px" }}>
            Track all admin actions, logins, and system changes
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 16px",
            borderRadius: "10px",
            background: "#F7F8F5",
            border: "1px solid #E4E8E0",
            fontSize: "13px",
            fontWeight: 600,
            color: "#4A5E4D",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#B88645";
            e.currentTarget.style.color = "#B88645";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E4E8E0";
            e.currentTarget.style.color = "#4A5E4D";
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
        <StatCard
          icon={<Activity size={20} />}
          label="Total Events (30d)"
          value={statsLoading ? "—" : (stats?.total ?? 0)}
          color="#B88645"
          bg="rgba(184,134,69,0.1)"
        />
        <StatCard
          icon={<LogIn size={20} />}
          label="Logins (30d)"
          value={statsLoading ? "—" : (stats?.logins ?? 0)}
          color="#16A34A"
          bg="rgba(22,163,74,0.1)"
        />
        <StatCard
          icon={<Edit3 size={20} />}
          label="Changes (30d)"
          value={statsLoading ? "—" : (stats?.mutations ?? 0)}
          color="#2563EB"
          bg="rgba(37,99,235,0.1)"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Failures (30d)"
          value={statsLoading ? "—" : (stats?.failures ?? 0)}
          color="#DC2626"
          bg="rgba(220,38,38,0.1)"
        />
      </div>

      {/* ── Filters ── */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E8EDE4",
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "220px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9AAE9B" }} />
            <input
              type="text"
              placeholder="Search actor, email, description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "12px",
                height: "36px",
                fontSize: "13px",
                fontFamily: "inherit",
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                borderRadius: "8px",
                outline: "none",
                color: "#1A261D",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#B88645"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E4E8E0"; }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0 14px",
              height: "36px",
              borderRadius: "8px",
              background: "#1A261D",
              border: "none",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            style={{
              padding: "0 10px",
              height: "36px",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 600,
              background: "#F7F8F5",
              border: "1px solid #E4E8E0",
              borderRadius: "8px",
              color: "#4A5E4D",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="STUDENT">Student</option>
          </select>

          {/* Action filter */}
          <div style={{ position: "relative" }}>
            <Filter size={12} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "#9AAE9B", pointerEvents: "none" }} />
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              style={{
                paddingLeft: "26px",
                paddingRight: "10px",
                height: "36px",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 600,
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                borderRadius: "8px",
                color: "#4A5E4D",
                outline: "none",
                cursor: "pointer",
                appearance: "none",
              }}
            >
              <option value="">All Actions</option>
              {Object.keys(ACTION_CONFIG).map((a) => (
                <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: "0 10px",
              height: "36px",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 600,
              background: "#F7F8F5",
              border: "1px solid #E4E8E0",
              borderRadius: "8px",
              color: "#4A5E4D",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
            }}
          >
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Quick Errors Button */}
          <button
            type="button"
            onClick={() => {
              setActionFilter("ERROR");
              setStatusFilter("FAILED");
              setPage(1);
            }}
            style={{
              padding: "0 12px",
              height: "36px",
              borderRadius: "8px",
              background: actionFilter === "ERROR" ? "#FEF2F2" : "#F7F8F5",
              border: `1px solid ${actionFilter === "ERROR" ? "#FCA5A5" : "#E4E8E0"}`,
              color: actionFilter === "ERROR" ? "#DC2626" : "#4A5E4D",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s",
            }}
          >
            <AlertOctagon size={12} />
            Errors Only
          </button>

          {/* Clear filters */}
          {(search || actionFilter || statusFilter || roleFilter) && (
            <button
              onClick={() => { setSearch(""); setActionFilter(""); setStatusFilter(""); setRoleFilter(""); setPage(1); }}
              style={{
                padding: "0 12px",
                height: "36px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid #E4E8E0",
                fontSize: "12px",
                fontWeight: 600,
                color: "#8F9E93",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E8EDE4",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.4fr 1fr 1.4fr 0.8fr 0.9fr",
            padding: "10px 20px",
            background: "#F7F8F5",
            borderBottom: "1px solid #E8EDE4",
            gap: "12px",
          }}
        >
          {["Actor", "Action", "Resource", "Description", "Status", "Time"].map((h) => (
            <div key={h} style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8F9E93" }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "2.5px solid #B88645",
                borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: "13px", color: "#8F9E93", margin: 0 }}>Loading logs…</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Activity size={32} style={{ color: "#C8D4CA", margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#8F9E93", margin: "0 0 4px" }}>No logs found</p>
            <p style={{ fontSize: "12px", color: "#B0B8B2", margin: 0 }}>
              Activity logs will appear here once admin actions are performed.
            </p>
          </div>
        ) : (
          logs.map((log, idx) => {
            const isExpanded = expandedId === log.id;
            const isLast = idx === logs.length - 1;
            const isError = log.action === "ERROR";
            return (
              <div key={log.id} style={{ background: isError ? "#FEF2F2" : "transparent" }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.4fr 1fr 1.4fr 0.8fr 0.9fr",
                    padding: "13px 20px",
                    borderBottom: isLast && !isExpanded ? "none" : "1px solid #F0F4EE",
                    gap: "12px",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background 0.12s",
                    background: log.status === "FAILED" ? "rgba(220,38,38,0.02)" : "transparent",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFBF8"; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = log.status === "FAILED" ? "rgba(220,38,38,0.02)" : "transparent";
                  }}
                >
                  {/* Actor */}
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: `${getAvatarColor(log.actorRole)}1A`,
                        border: `1.5px solid ${getAvatarColor(log.actorRole)}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: getAvatarColor(log.actorRole),
                        flexShrink: 0,
                      }}
                    >
                      {log.action === "LOGIN_FAILED"
                        ? "?"
                        : getInitials(log.actorName, log.actorEmail)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#1A261D",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.actorName ?? "Unknown"}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#8F9E93",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.actorEmail ?? "—"}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div>
                    <ActionBadge action={log.action} />
                  </div>

                  {/* Resource */}
                  <div>
                    {log.resource ? (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#4A5E4D",
                          background: "#F0F4EE",
                          padding: "2px 7px",
                          borderRadius: "5px",
                          textTransform: "capitalize",
                        }}
                      >
                        {log.resource.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#C8D4CA" }}>—</span>
                    )}
                  </div>

                  {/* Description */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#4A5E4D",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={log.description ?? ""}
                  >
                    {log.description ?? "—"}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusDot status={log.status} />
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: "11px", color: "#8F9E93" }} title={formatFullDate(log.createdAt)}>
                    {formatRelativeTime(log.createdAt)}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "16px 20px 20px 59px",
                      borderBottom: isLast ? "none" : "1px solid #F0F4EE",
                      background: "#FAFBF8",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {[
                      { icon: <Clock size={12} />, label: "Timestamp", value: formatFullDate(log.createdAt) },
                      { icon: <Globe size={12} />, label: "IP Address", value: log.ipAddress ?? "—" },
                      { icon: <User size={12} />, label: "Role", value: log.actorRole ?? "—" },
                      { icon: <Activity size={12} />, label: "Resource ID", value: log.resourceId ? log.resourceId : "—" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9AAE9B",
                            marginBottom: "4px",
                          }}
                        >
                          {item.icon}
                          {item.label}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#1A261D", wordBreak: "break-all" }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                    {log.userAgent && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9AAE9B",
                            marginBottom: "4px",
                          }}
                        >
                          User Agent
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#4A5E4D",
                            background: "#F0F4EE",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            wordBreak: "break-all",
                            fontFamily: "monospace",
                          }}
                        >
                          {log.userAgent}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: "1px solid #E8EDE4",
              background: "#F7F8F5",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#8F9E93" }}>
              Showing{" "}
              <strong style={{ color: "#1A261D" }}>
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{" "}
              of <strong style={{ color: "#1A261D" }}>{pagination.total.toLocaleString()}</strong> events
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: page === 1 ? "#F0F4EE" : "#1A261D",
                  border: "none",
                  color: page === 1 ? "#9AAE9B" : "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                <ChevronLeft size={13} />
                Prev
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#4A5E4D",
                  background: "#FFFFFF",
                  border: "1px solid #E4E8E0",
                  borderRadius: "8px",
                }}
              >
                {page} / {pagination.totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: page === pagination.totalPages ? "#F0F4EE" : "#1A261D",
                  border: "none",
                  color: page === pagination.totalPages ? "#9AAE9B" : "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: page === pagination.totalPages ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
