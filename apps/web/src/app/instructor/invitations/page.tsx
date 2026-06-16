"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInvitations } from "@/lib/api/instructor";
import { InvitationCard } from "@/components/instructor/lms/InvitationCard";
import { Skeleton } from "@/components/shared/SkeletonLoader";
import { Mail, Inbox } from "lucide-react";

const FILTERS = ["ALL", "PENDING", "ACCEPTED", "DECLINED"] as const;
type Filter = typeof FILTERS[number];

export default function InvitationsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");

  const { data: all, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => getInvitations(),
    refetchInterval: 30000,
  });

  const invitations: any[] = Array.isArray(all) ? all : [];

  const filtered = filter === "ALL"
    ? invitations
    : invitations.filter((inv) => inv.status === filter);

  const pendingCount = invitations.filter((i) => i.status === "PENDING").length;

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#1C2B1E", margin: 0 }}>
            Course Invitations
          </h1>
          {pendingCount > 0 && (
            <span style={{
              background: "#C9973A", color: "#FFFFFF",
              borderRadius: 999, minWidth: 22, height: 22, padding: "0 7px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800,
            }}>
              {pendingCount}
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: "#8A9E8C", margin: 0 }}>
          When an admin assigns you to a course, you'll receive an invitation here. Accept to add it to your dashboard.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {FILTERS.map((f) => {
          const count = f === "ALL" ? invitations.length : invitations.filter((i) => i.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                border: active ? "none" : "1px solid #E4E8E0",
                background: active ? "#1C2B1E" : "transparent",
                color: active ? "#FFFFFF" : "#8A9E8C",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F5F0E8"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {f === "PENDING" ? f.charAt(0) + f.slice(1).toLowerCase() : f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              {count > 0 && (
                <span style={{
                  background: active ? "rgba(255,255,255,0.2)" : "rgba(138,158,140,0.15)",
                  borderRadius: 999, padding: "0 6px", fontSize: 11, fontWeight: 700,
                  color: active ? "#FFFFFF" : "#8A9E8C",
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ background: "#F5F0E8", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <Skeleton height={42} />
              <Skeleton height={16} width="60%" />
              <Skeleton height={14} width="40%" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 40px", background: "#FFFFFF", borderRadius: 20, border: "1px dashed #D4D9CE" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,151,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            {filter === "ALL" ? <Inbox size={28} color="#C9973A" /> : <Mail size={28} color="#C9973A" />}
          </div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1C2B1E", margin: "0 0 8px" }}>
            {filter === "ALL" ? "No invitations yet" : `No ${filter.toLowerCase()} invitations`}
          </h3>
          <p style={{ fontSize: 13, color: "#8A9E8C", margin: 0, maxWidth: 320, marginInline: "auto" }}>
            {filter === "ALL"
              ? "When admins assign courses to you, they'll appear here."
              : `You have no ${filter.toLowerCase()} invitations.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
          ))}
        </div>
      )}
    </div>
  );
}
