"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, #E8EAE4 25%, #F2F3EF 50%, #E8EAE4 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        border: "1px solid #E4E8E0",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Skeleton height={200} borderRadius={12} />
      <Skeleton height={20} width="70%" />
      <Skeleton height={14} width="50%" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${60 + (i * 15 % 30)}%`} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
      <Skeleton width={40} height={40} borderRadius={8} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton height={14} width="60%" />
        <Skeleton height={12} width="40%" />
      </div>
      <Skeleton width={72} height={22} borderRadius={999} />
    </div>
  );
}

// Inject animation keyframes once
if (typeof document !== "undefined") {
  const styleId = "skeleton-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
