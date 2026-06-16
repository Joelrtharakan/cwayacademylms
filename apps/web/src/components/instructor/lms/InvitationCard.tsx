"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptInvitation, declineInvitation } from "@/lib/api/instructor";
import { toast } from "sonner";
import { BookOpen, Clock, Mail, Loader2, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

interface InvitationCardProps {
  invitation: {
    id: string;
    status: string;
    adminNote?: string;
    createdAt: string;
    course: {
      id: string;
      title: string;
      description?: string;
      thumbnail?: string;
      weeksDuration?: number;
      invitationStatus?: string;
      program?: { id: string; title: string } | null;
    };
  };
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const acceptMut = useMutation({
    mutationFn: () => acceptInvitation(invitation.id),
    onSuccess: () => {
      toast.success("Invitation accepted! The course is now in your dashboard.");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to accept"),
  });

  const declineMut = useMutation({
    mutationFn: () => declineInvitation(invitation.id),
    onSuccess: () => {
      toast.success("Invitation declined.");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to decline"),
  });

  const isPending = invitation.status === "PENDING";
  const isAccepted = invitation.status === "ACCEPTED";
  const isDeclined = invitation.status === "DECLINED";

  const statusConfig = {
    PENDING: { bg: "rgba(201,151,58,0.1)", border: "rgba(201,151,58,0.3)", color: "#C9973A", label: "Awaiting Response" },
    ACCEPTED: { bg: "rgba(74,140,92,0.08)", border: "rgba(74,140,92,0.25)", color: "#4A8C5C", label: "Accepted" },
    DECLINED: { bg: "rgba(140,58,58,0.08)", border: "rgba(140,58,58,0.2)", color: "#8C3A3A", label: "Declined" },
  }[invitation.status] || { bg: "#FAFAF8", border: "#E4E8E0", color: "#8A9E8C", label: "Unknown" };

  return (
    <div
      style={{
        background: statusConfig.bg,
        border: `1.5px solid ${statusConfig.border}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Card header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Thumbnail / Icon */}
        <div style={{
          width: 56, height: 42, borderRadius: 8, flexShrink: 0, overflow: "hidden",
          background: "rgba(201,151,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {invitation.course.thumbnail ? (
            <img src={invitation.course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <BookOpen size={20} color="#C9973A" />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {invitation.course.program && (
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: statusConfig.color }}>
                {invitation.course.program.title}
              </span>
            )}
            {invitation.course.program && <span style={{ color: "#D4D9CE", fontSize: 10 }}>·</span>}
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
              background: statusConfig.bg, color: statusConfig.color,
              padding: "2px 8px", borderRadius: 999, border: `1px solid ${statusConfig.border}`,
            }}>
              {statusConfig.label}
            </span>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1C2B1E", margin: "0 0 4px", lineHeight: 1.3 }}>
            {invitation.course.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {invitation.course.weeksDuration && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8A9E8C" }}>
                <Clock size={12} />
                <span>{invitation.course.weeksDuration} weeks</span>
              </div>
            )}
            <span style={{ fontSize: 12, color: "#8A9E8C" }}>
              {new Date(invitation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        {invitation.adminNote && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8A9E8C", padding: 4 }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Admin note */}
      {expanded && invitation.adminNote && (
        <div style={{ padding: "0 20px 14px" }}>
          <div style={{ background: "rgba(28,43,30,0.04)", borderRadius: 8, padding: "10px 14px", borderLeft: "3px solid #C9973A" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#8A9E8C", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Note from Admin
            </p>
            <p style={{ fontSize: 13, color: "#1C2B1E", margin: 0, lineHeight: 1.5 }}>
              {invitation.adminNote}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons — only for PENDING */}
      {isPending && (
        <div style={{ padding: "12px 20px 16px", display: "flex", gap: 10 }}>
          <button
            onClick={() => declineMut.mutate()}
            disabled={declineMut.isPending || acceptMut.isPending}
            style={{
              flex: 1, padding: "9px 0",
              background: "transparent",
              border: "1.5px solid rgba(140,58,58,0.3)",
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: "#8C3A3A", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
              opacity: declineMut.isPending ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(140,58,58,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {declineMut.isPending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={14} />}
            Decline
          </button>
          <button
            onClick={() => acceptMut.mutate()}
            disabled={acceptMut.isPending || declineMut.isPending}
            style={{
              flex: 2, padding: "9px 0",
              background: "#4A8C5C",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: "#FFFFFF", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
              boxShadow: "0 2px 8px rgba(74,140,92,0.25)",
              opacity: acceptMut.isPending ? 0.8 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#5AA06E"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#4A8C5C"; }}
          >
            {acceptMut.isPending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={14} />}
            Accept & Add to My Courses
          </button>
        </div>
      )}
    </div>
  );
}
