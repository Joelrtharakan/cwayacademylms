"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TrendingUp, DollarSign, Percent, ArrowDownCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getInstructorRevenue, requestPayout, getPayoutHistory } from "@/lib/api/instructor";
import { format } from "date-fns";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

function KpiCard({ label, value, icon: Icon, accent = GOLD }: any) {
  return (
    <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, padding: "20px 22px", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${accent}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, fontWeight: 700, color: "#F5F0E8", marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    PENDING: { color: "#FBBF24", bg: "#2A2A1A" },
    APPROVED: { color: "#4ADE80", bg: "#1A4A2E" },
    REJECTED: { color: "#F87171", bg: "#4A1A1A" },
  };
  const s = map[status] || map.PENDING;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{status}</span>;
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
      <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 26, color: "#F5F0E8", marginBottom: 24 }}>Revenue & Payouts</h1>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Total Earned" value={isLoading ? "—" : fmt(revenue?.totalEarned || 0)} icon={TrendingUp} />
        <KpiCard label="Pending Payout" value={isLoading ? "—" : fmt(revenue?.pendingPayout || 0)} icon={Clock} accent="#FBBF24" />
        <KpiCard label="Paid Out" value={isLoading ? "—" : fmt(revenue?.paidOut || 0)} icon={DollarSign} accent="#4ADE80" />
        <KpiCard label="Platform Fee" value={isLoading ? "—" : `${revenue?.platformFeeRate || 30}%`} icon={Percent} accent={MUTED} />
      </div>

      {/* Chart */}
      <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8", marginBottom: 20 }}>Earnings Over Time</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid stroke="rgba(201,151,58,0.08)" vertical={false} />
            <XAxis dataKey="month" stroke={MUTED} tick={{ fontSize: 11 }} />
            <YAxis stroke={MUTED} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip contentStyle={{ background: DARK, border: "1px solid rgba(201,151,58,0.3)", borderRadius: 8 }} labelStyle={{ color: "#F5F0E8" }} formatter={(v: any) => [`₹${v.toLocaleString()}`, "Earnings"]} />
            <Line type="monotone" dataKey="earnings" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8" }}>Transaction History</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Date", "Student", "Course", "Sale", "Fee", "Your Earnings"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(revenue?.transactions || []).map((t: any) => (
                <tr key={t.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: MUTED }}>{format(new Date(t.createdAt), "MMM d, yyyy")}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#F5F0E8" }}>{t.student?.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: MUTED, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.course?.title}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#F5F0E8" }}>{fmt(t.amount)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#F87171" }}>-{fmt(t.platformFee)}</td>
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
      <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.3)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 20, color: "#F5F0E8", marginBottom: 4 }}>Request a Payout</h3>
        <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 36, fontWeight: 700, color: GOLD, marginBottom: 20 }}>
          {fmt(revenue?.pendingPayout || 0)} <span style={{ fontSize: 15, color: MUTED, fontFamily: "sans-serif", fontWeight: 400 }}>available</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Amount to Request</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={revenue?.pendingPayout || 0} placeholder={String(revenue?.pendingPayout || 0)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Note to Admin (Optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Any notes..." style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Bank / Payment Details</label>
          <textarea value={bankDetails} onChange={e => setBankDetails(e.target.value)} placeholder="Bank name, Account number, IFSC code or UPI ID..." rows={3}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => amount && payoutMut.mutate()} disabled={!amount || payoutMut.isPending}
          style={{ background: GOLD, color: DARK, borderRadius: 100, padding: "12px 28px", fontWeight: 700, fontSize: 14, border: "none", cursor: amount ? "pointer" : "not-allowed", opacity: amount ? 1 : 0.6 }}>
          {payoutMut.isPending ? "Requesting..." : "Request Payout"}
        </button>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>Minimum payout: ₹500. Payouts are processed within 5 business days.</p>
      </div>

      {/* Payout History */}
      {payouts.length > 0 && (
        <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: "#F5F0E8" }}>Payout History</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Date Requested", "Amount", "Status", "Note"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p: any) => (
                <tr key={p.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
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
