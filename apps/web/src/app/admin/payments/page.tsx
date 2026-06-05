"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCcw, Download, DollarSign, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getPayments, refundPayment } from "@/lib/api/admin";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  COMPLETED: { bg: "rgba(61,122,75,0.08)", color: "#3D7A4B" },
  PENDING:   { bg: "rgba(184,134,69,0.08)", color: "#B88645" },
  FAILED:    { bg: "rgba(176,58,46,0.08)", color: "#B03A2E" },
  REFUNDED:  { bg: "rgba(143,158,147,0.08)", color: "#8F9E93" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.REFUNDED;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: "10px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<{ id: string; amount: number; studentName: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", debouncedSearch, statusFilter, page],
    queryFn: () => getPayments({ search: debouncedSearch, status: statusFilter, page, limit: 20 }),
  });

  const refundMut = useMutation({
    mutationFn: (id: string) => refundPayment(id),
    onSuccess: () => { toast.success("Refund processed"); qc.invalidateQueries({ queryKey: ["admin-payments"] }); setRefundTarget(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to process refund"),
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any).__pt);
    (window as any).__pt = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 350);
  };

  const summaryCards = [
    { label: "Total Revenue", value: `₹${(data?.summary?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "#B88645", bg: "rgba(184,134,69,0.08)" },
    { label: "Total Refunded", value: `₹${(data?.summary?.totalRefunded ?? 0).toLocaleString()}`, icon: XCircle, color: "#B03A2E", bg: "rgba(176,58,46,0.08)" },
    { label: "Pending Payments", value: (data?.summary?.pendingCount ?? 0).toLocaleString(), icon: Clock, color: "#8F9E93", bg: "rgba(143,158,147,0.08)" },
  ];

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "Transaction ID",
      render: (row) => (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "8px",
            background: "#F7F8F5",
            color: "#8F9E93",
            border: "1px solid #E4E8E0",
          }}
        >
          {row.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0 }}>{row.student?.name}</p>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0" }}>{row.student?.email}</p>
        </div>
      ),
    },
    { key: "course", header: "Course", render: (row) => <span style={{ fontSize: "13px", fontWeight: 500, color: "#1A261D" }}>{row.course?.title}</span> },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#B88645" }}>
          ₹{row.amount.toLocaleString()}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "createdAt", header: "Date", render: (row) => <span style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93" }}>{formatDate(row.createdAt)}</span> },
  ];

  const actions = (row: any) => {
    if (row.status !== "COMPLETED") return null;
    return (
      <button
        onClick={() => setRefundTarget({ id: row.id, amount: row.amount, studentName: row.student?.name })}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: 600,
          transition: "all 0.15s",
          background: "rgba(176,58,46,0.08)",
          color: "#B03A2E",
          border: "1px solid rgba(176,58,46,0.15)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(176,58,46,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(176,58,46,0.08)";
        }}
      >
        <RefreshCcw size={12} /> Refund
      </button>
    );
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Manage transactions and process refunds"
        actions={
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "1px solid #E4E8E0",
              color: "#526658",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: "0 1px 3px rgba(26,38,29,0.05)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.color = "#B88645"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.color = "#526658"; }}
          >
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {summaryCards.map((card, i) => (
          <div
            key={i}
            style={{
              borderRadius: "16px",
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E4E8E0",
              boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9AAE9B", marginBottom: "12px", margin: 0 }}>
                  {card.label}
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 700, lineHeight: 1, color: card.color, margin: "12px 0 0 0" }}>
                  {card.value}
                </p>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: card.bg }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E4E8E0",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9AAE9B" }} />
          <input
            type="text"
            placeholder="Search by student or course..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              fontSize: "13.5px",
              fontWeight: 500,
              borderRadius: "10px",
              border: "1px solid #E4E8E0",
              background: "#F7F8F5",
              color: "#1A261D",
              outline: "none",
              transition: "all 0.15s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#B88645"; e.target.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#E4E8E0"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontWeight: 500,
            border: "1px solid #E4E8E0",
            background: "#F7F8F5",
            color: "#1A261D",
            outline: "none",
            cursor: "pointer",
            minWidth: "140px",
            transition: "all 0.15s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; }}
        >
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.payments ?? []}
        loading={isLoading}
        pagination={data ? { page: data.page, pages: data.pages, total: data.total } : undefined}
        onPageChange={setPage}
        actions={actions}
        rowKey={(r) => r.id}
        emptyMessage="No payments found"
      />

      {refundTarget && (
        <ConfirmDialog
          open
          onOpenChange={() => setRefundTarget(null)}
          title={`Refund ₹${refundTarget.amount.toLocaleString()}?`}
          description={`You are about to issue a full refund to ${refundTarget.studentName}. This will automatically revoke their course access.`}
          confirmLabel="Process Refund"
          danger
          loading={refundMut.isPending}
          onConfirm={() => refundMut.mutate(refundTarget.id)}
        />
      )}
    </div>
  );
}
