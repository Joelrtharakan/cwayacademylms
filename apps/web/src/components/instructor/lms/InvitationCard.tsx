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
        background: "#FFFFFF",
        border: "1px solid #EEF0EA",
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 12px rgba(28,43,30,0.03)",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(28,43,30,0.08)";
        e.currentTarget.style.borderColor = statusConfig.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(28,43,30,0.03)";
        e.currentTarget.style.borderColor = "#EEF0EA";
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: statusConfig.color }} />
      {/* Card header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Thumbnail / Icon */}
        <div style={{
          width: 60, height: 60, borderRadius: 12, flexShrink: 0, overflow: "hidden",
          background: "rgba(28,43,30,0.03)", display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid #EEF0EA"
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
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
              background: statusConfig.bg, color: statusConfig.color,
              padding: "4px 10px", borderRadius: 999, border: `1px solid ${statusConfig.border}`,
            }}>
              {statusConfig.label}
            </span>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1C2B1E", margin: "0 0 6px", lineHeight: 1.3 }}>
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
        <div style={{ padding: "0 20px 16px 20px" }}>
          <div style={{ background: "#F9FAFC", borderRadius: 12, padding: "12px 16px", border: "1px solid #EEF0EA" }}>
            <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#C9973A", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Mail size={12} /> Note from Admin
            </p>
            <p style={{ fontSize: 14, color: "#4A5D4E", margin: 0, lineHeight: 1.6 }}>
              {invitation.adminNote}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons — only for PENDING */}
      {isPending && (
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 12 }}>
          <button
            onClick={() => declineMut.mutate()}
            disabled={declineMut.isPending || acceptMut.isPending}
            style={{
              flex: 1, padding: "12px 0",
              background: "#FFFFFF",
              border: "1px solid #E4E8E0",
              borderRadius: 12, fontSize: 14, fontWeight: 600,
              color: "#6B7D70", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
              opacity: declineMut.isPending ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = "#FDFBF7"; 
              e.currentTarget.style.color = "#8C3A3A";
              e.currentTarget.style.borderColor = "rgba(140,58,58,0.3)";
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = "#FFFFFF"; 
              e.currentTarget.style.color = "#6B7D70";
              e.currentTarget.style.borderColor = "#E4E8E0";
            }}
          >
            {declineMut.isPending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={16} />}
            Decline
          </button>
          <button
            onClick={() => acceptMut.mutate()}
            disabled={acceptMut.isPending || declineMut.isPending}
            style={{
              flex: 2, padding: "12px 0",
              background: "linear-gradient(135deg, #4A8C5C 0%, #366B44 100%)",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
              color: "#FFFFFF", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(74,140,92,0.2)",
              opacity: acceptMut.isPending ? 0.8 : 1,
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(74,140,92,0.3)";
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,140,92,0.2)";
            }}
          >
            {acceptMut.isPending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={16} />}
            Accept & Add to My Courses
          </button>
        </div>
      )}
    </div>
  );
}
