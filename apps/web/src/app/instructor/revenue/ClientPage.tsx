"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TrendingUp, DollarSign, Percent, ArrowDownCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getInstructorRevenue, requestPayout, getPayoutHistory } from "@/lib/api/instructor";
import { format } from "date-fns";

const GOLD = "#B88645";
const SURFACE = "#FFFFFF";
const DARK = "#1A261D";
const MUTED = "#8F9E93";
const BORDER = "#E4E8E0";
const BG_ALT = "#F7F8F5";

function KpiCard({ label, value, icon: Icon, accent = GOLD }: any) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 22px", display: "flex", gap: 14, alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${accent}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: DARK, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    PENDING: { color: "#D97706", bg: "#FEF3C7" },
    APPROVED: { color: "#059669", bg: "#D1FAE5" },
    REJECTED: { color: "#DC2626", bg: "#FEE2E2" },
  };
  const s = map[status] || map.PENDING;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{status}</span>;
}

export default function RevenuePage() {
  const [amount, setAmount] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [note, setNote] = useState("");

  const { data: revenue, isLoading } = useQuery({ queryKey: ["instructor-revenue"], queryFn: getInstructorRevenue });
  const { data: payouts = [] } = useQuery({ queryKey: ["payout-history"], queryFn: getPayoutHistory });

  const payoutMut = useMutation({
    mutationFn: () => requestPayout({ amount: Number(amount), bankDetails, note }),
    onSuccess: () => { toast.success("Payout request submitted!"); setAmount(""); setBankDetails(""); setNote(""); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to request payout"),
  });

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  // Build last 6 months chart data from transactions
  const chartData = React.useMemo(() => {
    const months: any = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("default", { month: "short" });
      months[key] = { month: key, earnings: 0 };
    }
    (revenue?.transactions || []).forEach((t: any) => {
      const key = new Date(t.createdAt).toLocaleString("default", { month: "short" });
      if (months[key]) months[key].earnings += t.instructorEarnings;
    });
    return Object.values(months);
  }, [revenue]);

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: DARK, marginBottom: 24, fontWeight: 700 }}>Revenue & Payouts</h1>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Total Earned" value={isLoading ? "—" : fmt(revenue?.totalEarned || 0)} icon={TrendingUp} />
        <KpiCard label="Pending Payout" value={isLoading ? "—" : fmt(revenue?.pendingPayout || 0)} icon={Clock} accent="#D97706" />
        <KpiCard label="Paid Out" value={isLoading ? "—" : fmt(revenue?.paidOut || 0)} icon={DollarSign} accent="#059669" />
        <KpiCard label="Platform Fee" value={isLoading ? "—" : `${revenue?.platformFeeRate || 30}%`} icon={Percent} accent={MUTED} />
      </div>

      {/* Chart */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: DARK, marginBottom: 20, fontWeight: 700 }}>Earnings Over Time</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis dataKey="month" stroke={MUTED} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke={MUTED} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} labelStyle={{ color: DARK, fontWeight: 700 }} itemStyle={{ color: GOLD }} formatter={(v: any) => [`₹${v.toLocaleString()}`, "Earnings"]} />
            <Line type="monotone" dataKey="earnings" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: DARK, fontWeight: 700 }}>Transaction History</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: BG_ALT }}>
                {["Date", "Student", "Course", "Sale", "Fee", "Your Earnings"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(revenue?.transactions || []).map((t: any) => (
                <tr key={t.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: MUTED }}>{format(new Date(t.createdAt), "MMM d, yyyy")}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: DARK, fontWeight: 500 }}>{t.student?.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: MUTED, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.course?.title}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: DARK }}>{fmt(t.amount)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#EF4444" }}>-{fmt(t.platformFee)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: GOLD }}>{fmt(t.instructorEarnings)}</td>
                </tr>
              ))}
              {(revenue?.transactions || []).length === 0 && (
                <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: MUTED, fontSize: 13 }}>No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Request */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: DARK, marginBottom: 4, fontWeight: 700 }}>Request a Payout</h3>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 700, color: GOLD, marginBottom: 20 }}>
          {fmt(revenue?.pendingPayout || 0)} <span style={{ fontSize: 15, color: MUTED, fontFamily: "sans-serif", fontWeight: 400 }}>available</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Amount to Request</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={revenue?.pendingPayout || 0} placeholder={String(revenue?.pendingPayout || 0)}
              style={{ width: "100%", background: BG_ALT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: DARK, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Note to Admin (Optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Any notes..." style={{ width: "100%", background: BG_ALT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: DARK, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Bank / Payment Details</label>
          <textarea value={bankDetails} onChange={e => setBankDetails(e.target.value)} placeholder="Bank name, Account number, IFSC code or UPI ID..." rows={3}
            style={{ width: "100%", background: BG_ALT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: DARK, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => amount && payoutMut.mutate()} disabled={!amount || payoutMut.isPending}
          style={{ background: GOLD, color: "#FFFFFF", borderRadius: 8, padding: "14px 28px", fontWeight: 700, fontSize: 14, border: "none", cursor: amount ? "pointer" : "not-allowed", opacity: amount ? 1 : 0.6, transition: "background 0.2s" }}
          onMouseEnter={(e) => amount && (e.currentTarget.style.background = "#A3763A")}
          onMouseLeave={(e) => amount && (e.currentTarget.style.background = GOLD)}>
          {payoutMut.isPending ? "Requesting..." : "Request Payout"}
        </button>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 12 }}>Minimum payout: ₹500. Payouts are processed within 5 business days.</p>
      </div>

      {/* Payout History */}
      {payouts.length > 0 && (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: DARK, fontWeight: 700 }}>Payout History</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: BG_ALT }}>
                {["Date Requested", "Amount", "Status", "Note"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p: any) => (
                <tr key={p.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: MUTED }}>{format(new Date(p.requestedAt), "MMM d, yyyy")}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: GOLD }}>{fmt(p.amount)}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: MUTED }}>{p.note || p.adminNote || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
