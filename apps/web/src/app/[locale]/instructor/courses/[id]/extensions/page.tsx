"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Clock, Check, X, Calendar, FileText, Award,
  MessageSquare, Loader2, CheckCircle2, XCircle
} from "lucide-react";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  dark: "#1A261D",
  muted: "#7F8E82",
  border: "#EBEEE8",
};

export default function ExtensionsPage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["extensions", id],
    queryFn: () => api.get(`/courses/${id}/extensions`).then(r => r.data.data),
  });

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data.data),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ requestId, status, extendedDate }: { requestId: string, status: string, extendedDate?: string }) => 
      api.put(`/courses/${id}/extensions/${requestId}/status`, { status, extendedDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extensions", id] });
      toast.success("Extension request updated successfully!");
    },
    onError: () => toast.error("Failed to update extension request"),
  });

  const getCourseTitle = () => {
    if (!course?.title) return "Untitled Course";
    if (typeof course.title === "string") return course.title;
    return course.title.en || course.title.hi || Object.values(course.title)[0] || "Untitled Course";
  };

  if (isLoading || isCourseLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: C.gold }} />
      </div>
    );
  }

  const allRequests = requests || [];
  const pendingCount = allRequests.filter((r: any) => r.status === "PENDING").length;
  const approvedCount = allRequests.filter((r: any) => r.status === "APPROVED").length;
  const rejectedCount = allRequests.filter((r: any) => r.status === "REJECTED").length;

  const filteredRequests = allRequests.filter((r: any) =>
    statusFilter === "ALL" ? true : r.status === statusFilter
  );

  return (
    <div style={{
      width: "100%", maxWidth: 1150, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 64, boxSizing: "border-box",
    }}>
      {/* ── TOP HEADER CARD ── */}
      <div style={{
        background: "#FFFFFF",
        borderTop: `1px solid ${C.border}`,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.gold}`,
        borderRadius: 20,
        padding: "clamp(16px, 4vw, 24px) clamp(14px, 5vw, 28px)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", gap: 16,
        width: "100%", boxSizing: "border-box", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link
            href={`/instructor/courses/${id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10,
              background: "#F7F8F5", color: "#2D3A2F",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Course</span>
          </Link>

          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "4px 12px", borderRadius: 20,
            background: C.goldLight, color: C.gold, border: `1px solid rgba(184,134,69,0.25)`,
          }}>
            Manage Extensions
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", width: "100%" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 800, color: C.dark, fontFamily: "Georgia, serif" }}>
              Extension Requests
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.4 }}>
              {getCourseTitle()} — Review and approve or reject deadline extensions from students.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 6, background: "#F7F8F5",
            padding: 6, borderRadius: 14, border: `1px solid ${C.border}`,
            width: "100%", boxSizing: "border-box",
          }}>
            {[
              { id: "ALL", label: `All (${allRequests.length})` },
              { id: "PENDING", label: `Pending (${pendingCount})` },
              { id: "APPROVED", label: `Approved (${approvedCount})` },
              { id: "REJECTED", label: `Rejected (${rejectedCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "8px 12px", borderRadius: 10, border: "none",
                  fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                  background: statusFilter === tab.id ? C.gold : "transparent",
                  color: statusFilter === tab.id ? "#FFFFFF" : C.muted,
                  transition: "all 0.2s", boxSizing: "border-box",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS OVERVIEW CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div style={{ background: "#FFFFFF", padding: "18px 22px", borderRadius: 16, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FEF3C7", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pending Review</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{pendingCount}</div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "18px 22px", borderRadius: 16, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#D1FAE5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Approved</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{approvedCount}</div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "18px 22px", borderRadius: 16, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FEE2E2", color: "#B91C1C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rejected</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* ── EXTENSION REQUEST CARDS ── */}
      {filteredRequests.length === 0 ? (
        <div style={{ background: "#FFFFFF", padding: "60px 24px", textAlign: "center", borderRadius: 20, border: `1px dashed ${C.border}` }}>
          <div style={{ width: 56, height: 56, background: C.goldLight, color: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Clock size={26} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>No Extension Requests Found</h3>
          <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>There are no student extension requests matching this status.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredRequests.map((req: any) => {
            const Icon = req.itemType === "ASSIGNMENT" ? FileText : req.itemType === "QUIZ" ? Award : MessageSquare;
            const isPending = req.status === "PENDING";
            const isApproved = req.status === "APPROVED";
            
            return (
              <div
                key={req.id}
                style={{
                  background: "#FFFFFF", borderRadius: 20,
                  border: `1px solid ${C.border}`, padding: "24px 28px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex", flexDirection: "column", gap: 18,
                }}
              >
                {/* Header: Student Info + Status Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: C.goldLight, color: C.gold,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 15, flexShrink: 0,
                    }}>
                      {req.student?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.dark }}>{req.student?.name}</h3>
                      <span style={{ fontSize: 12, color: C.muted }}>{req.student?.email}</span>
                    </div>
                  </div>

                  <span style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800,
                    background: isPending ? "#FEF3C7" : isApproved ? "#D1FAE5" : "#FEE2E2",
                    color: isPending ? "#92400E" : isApproved ? "#065F46" : "#991B1B",
                    border: `1px solid ${isPending ? "#FDE68A" : isApproved ? "#A7F3D0" : "#FCA5A5"}`
                  }}>
                    {req.status}
                  </span>
                </div>

                {/* Body Details: Item Title & Reason */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item info */}
                  <div style={{ background: "#F7F8F5", padding: "14px 18px", borderRadius: 14, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                      Target Item ({req.itemType})
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: req.itemType === "ASSIGNMENT" ? "#E3F2FD" : req.itemType === "FORUM" ? "#E8F5E9" : "#FFF3E0",
                        color: req.itemType === "ASSIGNMENT" ? "#1976D2" : req.itemType === "FORUM" ? "#2E7D32" : "#F57C00",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={16} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>
                        {req.itemTitle || req.itemId}
                      </span>
                    </div>
                  </div>

                  {/* Requested Date info */}
                  <div style={{ background: "#F7F8F5", padding: "14px 18px", borderRadius: 14, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                      Requested Deadline
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.gold, fontSize: 14, fontWeight: 700 }}>
                      <Calendar size={16} />
                      <span>{req.requestedDate ? new Date(req.requestedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Reason Block */}
                <div style={{
                  background: "#FAFBF8", padding: "16px 20px", borderRadius: 14,
                  borderLeft: `4px solid ${C.gold}`, borderTop: `1px solid ${C.border}`,
                  borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>
                    Student Reason
                  </span>
                  <p style={{ margin: 0, fontSize: 14, fontStyle: "italic", color: C.dark, lineHeight: 1.5 }}>
                    "{req.reason || "No reason provided."}"
                  </p>
                </div>

                {/* Action Area (If Pending) */}
                {isPending && (
                  <div style={{
                    paddingTop: 14, borderTop: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 240 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.muted, flexShrink: 0 }}>
                        Grant Extension Date:
                      </span>
                      <input
                        type="date"
                        id={`date-${req.id}`}
                        defaultValue={req.requestedDate ? new Date(req.requestedDate).toISOString().split('T')[0] : ""}
                        style={{
                          padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
                          background: "#F7F8F5", fontSize: 13, color: C.dark, flex: 1,
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 280 }}>
                      <button
                        onClick={() => {
                          const dateInput = document.getElementById(`date-${req.id}`) as HTMLInputElement;
                          if (!dateInput.value) {
                            toast.error("Please select a date to grant the extension");
                            return;
                          }
                          updateStatusMut.mutate({ requestId: req.id, status: "APPROVED", extendedDate: dateInput.value });
                        }}
                        disabled={updateStatusMut.isPending}
                        style={{
                          flex: 1, padding: "10px 16px", background: "#2E7D32", color: "#FFFFFF",
                          border: "none", borderRadius: 10, fontWeight: 800, fontSize: 13,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          boxShadow: "0 2px 6px rgba(46,125,50,0.2)",
                        }}
                      >
                        <Check size={16} /> Approve
                      </button>

                      <button
                        onClick={() => updateStatusMut.mutate({ requestId: req.id, status: "REJECTED" })}
                        disabled={updateStatusMut.isPending}
                        style={{
                          flex: 1, padding: "10px 16px", background: "#FEE2E2", color: "#B91C1C",
                          border: "1px solid #FCA5A5", borderRadius: 10, fontWeight: 800, fontSize: 13,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
