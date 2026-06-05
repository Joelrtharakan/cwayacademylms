"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  trend?: "up" | "down";
  trendValue?: string;
  loading?: boolean;
  color?: "gold" | "green" | "blue" | "red" | "purple";
}

const THEMES = {
  gold:   { iconBg: "rgba(184,134,69,0.1)",   iconColor: "#B88645",  trendUp: "#B88645" },
  green:  { iconBg: "rgba(61,122,75,0.1)",    iconColor: "#3D7A4B",  trendUp: "#3D7A4B" },
  blue:   { iconBg: "rgba(44,74,59,0.1)",     iconColor: "#2C4A3B",  trendUp: "#2C4A3B" },
  red:    { iconBg: "rgba(176,58,46,0.1)",    iconColor: "#B03A2E",  trendUp: "#B03A2E" },
  purple: { iconBg: "rgba(101,60,137,0.1)",   iconColor: "#653C89",  trendUp: "#653C89" },
};

export function StatCard({ label, value, icon: Icon, trend, trendValue, loading, color = "gold" }: StatCardProps) {
  const theme = THEMES[color];

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4E8E0",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(26,38,29,0.09)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(26,38,29,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.14em",
            color: "#9AAE9B",
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: theme.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} style={{ color: theme.iconColor }} />
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <div style={{ height: "40px", borderRadius: "8px", background: "#F0F2ED", animation: "pulse 1.5s ease-in-out infinite" }} />
      ) : (
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "36px",
            fontWeight: 700,
            color: "#1A261D",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      )}

      {/* Trend */}
      {trend && trendValue && !loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: trend === "up" ? "rgba(61,122,75,0.08)" : "rgba(176,58,46,0.08)",
              color: trend === "up" ? "#3D7A4B" : "#B03A2E",
            }}
          >
            {trend === "up"
              ? <TrendingUp size={11} strokeWidth={2.5} />
              : <TrendingDown size={11} strokeWidth={2.5} />
            }
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{trendValue}</span>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
