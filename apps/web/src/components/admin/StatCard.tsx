"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; strokeWidth?: number }>;
  trend?: "up" | "down";
  trendValue?: string;
  loading?: boolean;
  color?: "gold" | "green" | "blue" | "red" | "purple";
}

const THEMES = {
  gold:   { iconBg: "rgba(184,134,69,0.12)",   iconColor: "#B88645",  shadow: "rgba(184,134,69,0.2)" },
  green:  { iconBg: "rgba(61,122,75,0.12)",    iconColor: "#3D7A4B",  shadow: "rgba(61,122,75,0.2)" },
  blue:   { iconBg: "rgba(44,74,59,0.12)",     iconColor: "#2C4A3B",  shadow: "rgba(44,74,59,0.2)" },
  red:    { iconBg: "rgba(176,58,46,0.12)",    iconColor: "#B03A2E",  shadow: "rgba(176,58,46,0.2)" },
  purple: { iconBg: "rgba(101,60,137,0.12)",   iconColor: "#653C89",  shadow: "rgba(101,60,137,0.2)" },
};

export function StatCard({ label, value, icon: Icon, trend, trendValue, loading, color = "gold" }: StatCardProps) {
  const theme = THEMES[color];

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(228,232,224, 0.8)",
        borderRadius: "20px",
        padding: "24px 28px",
        boxShadow: "0 4px 20px rgba(26,38,29,0.02), inset 0 0 0 1px rgba(255,255,255,1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "140px",
        justifyContent: "space-between"
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 30px rgba(26,38,29,0.06), inset 0 0 0 1px rgba(255,255,255,1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(184,134,69, 0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(26,38,29,0.02), inset 0 0 0 1px rgba(255,255,255,1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(228,232,224, 0.8)";
      }}
    >
      {/* Decorative gradient blob */}
      <div 
        style={{ 
          position: "absolute", 
          top: "-30px", 
          right: "-30px", 
          width: "120px", 
          height: "120px", 
          background: `radial-gradient(circle, ${theme.iconBg} 0%, transparent 70%)`,
          opacity: 0.6,
          pointerEvents: "none"
        }} 
      />

      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: theme.iconBg,
            border: `1px solid rgba(255,255,255,0.6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 4px 12px ${theme.shadow}`,
          }}
        >
          <Icon size={24} style={{ color: theme.iconColor }} strokeWidth={1.75} />
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: "#8F9E93",
              margin: 0
            }}
          >
            {label}
          </p>
        </div>
      </div>

      {/* Value Container */}
      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <div style={{ height: "46px", borderRadius: "10px", background: "#F0F2ED", animation: "pulse 1.5s ease-in-out infinite", width: "70%" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "44px",
                fontWeight: 700,
                color: "#1A261D",
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            
            {/* Trend Badge */}
            {trend && trendValue && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: trend === "up" ? "rgba(61,122,75,0.08)" : "rgba(176,58,46,0.08)",
                  color: trend === "up" ? "#3D7A4B" : "#B03A2E",
                  border: `1px solid ${trend === "up" ? "rgba(61,122,75,0.15)" : "rgba(176,58,46,0.15)"}`
                }}
              >
                {trend === "up"
                  ? <TrendingUp size={12} strokeWidth={2.5} />
                  : <TrendingDown size={12} strokeWidth={2.5} />
                }
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{trendValue}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
