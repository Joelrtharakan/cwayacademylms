"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: { label: string; color?: "gold" | "green" | "red" };
}

const BADGE_THEMES = {
  gold:  { bg: "rgba(184,134,69,0.1)",  color: "#B88645" },
  green: { bg: "rgba(61,122,75,0.1)",   color: "#3D7A4B" },
  red:   { bg: "rgba(176,58,46,0.1)",   color: "#B03A2E" },
};

export function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  const badgeTheme = badge ? (BADGE_THEMES[badge.color ?? "gold"]) : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "24px",
        marginBottom: "28px",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" as const }}>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#1A261D",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {badge && badgeTheme && (
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                background: badgeTheme.bg,
                color: badgeTheme.color,
              }}
            >
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "14px",
              fontWeight: 500,
              color: "#9AAE9B",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, paddingTop: "4px" }}>
          {actions}
        </div>
      )}
    </div>
  );
}
