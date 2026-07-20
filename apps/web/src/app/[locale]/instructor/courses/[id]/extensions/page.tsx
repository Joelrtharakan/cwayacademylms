"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Check, X, Calendar } from "lucide-react";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

export default function ExtensionsPage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  
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
      toast.success("Extension request updated");
    },
    onError: () => toast.error("Failed to update extension request"),
  });

  if (isLoading || isCourseLoading || !course) return <div style={{ padding: "40px", textAlign: "center" }}>Loading extensions...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8F5", color: "#1A261D" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#FFFFFF", padding: "16px 40px", borderBottom: "1px solid #E4E8E0", display: "flex", alignItems: "center", gap: "20px" }}>
        <Link href={`/instructor/courses/${id}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8F9E93", textDecoration: "none" }}>
          <ArrowLeft size={18} /> Back to Course
        </Link>
        <div style={{ height: "24px", width: "1px", background: "rgba(184,134,69,0.3)" }}></div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, margin: 0, color: "#B88645" }}>Extension Requests: {course.title}</h1>
      </header>

      <main style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: "8px" }}>Manage Extensions</h2>
        <p style={{ color: "#8F9E93", marginBottom: "32px" }}>Review and approve or reject extension requests from students.</p>

        {!requests || requests.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
            <Clock size={32} color="#8F9E93" style={{ margin: "0 auto 16px auto" }} />
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}>No extension requests</h3>
            <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {requests.map((req: any) => (
              <div key={req.id} style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "16px", background: "#F5F0E8", color: "#B88645", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {req.student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{req.student.name}</h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#8F9E93" }}>{req.student.email}</p>
                    </div>
                    <div style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: req.status === "PENDING" ? "#FEF3C7" : req.status === "APPROVED" ? "#D1FAE5" : "#FEE2E2", color: req.status === "PENDING" ? "#92400E" : req.status === "APPROVED" ? "#065F46" : "#991B1B" }}>
                      {req.status}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#8F9E93", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Item ({req.itemType})</p>
                    <p style={{ margin: 0, fontSize: "14px" }}>ID: {req.itemId} (Will show title once populated)</p>
                  </div>

                  <div style={{ marginBottom: "16px", padding: "16px", background: "#F7F8F5", borderRadius: "8px", border: "1px solid #E4E8E0" }}>
                    <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#8F9E93", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reason</p>
                    <p style={{ margin: 0, fontSize: "14px", fontStyle: "italic", color: "#1A261D" }}>"{req.reason}"</p>
                  </div>

                  {req.requestedDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#B88645", fontSize: "14px", fontWeight: 600 }}>
                      <Calendar size={16} /> Requested Date: {new Date(req.requestedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {req.status === "PENDING" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#8F9E93" }}>Grant Extension To:</h4>
                    <input 
                      type="date" 
                      id={`date-${req.id}`}
                      defaultValue={req.requestedDate ? new Date(req.requestedDate).toISOString().split('T')[0] : ""}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px" }}
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button 
                        onClick={() => {
                          const dateInput = document.getElementById(`date-${req.id}`) as HTMLInputElement;
                          if (!dateInput.value) {
                            toast.error("Please select a date to grant the extension");
                            return;
                          }
                          updateStatusMut.mutate({ requestId: req.id, status: "APPROVED", extendedDate: dateInput.value });
                        }}
                        style={{ flex: 1, padding: "8px", background: "#4A8C5C", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => updateStatusMut.mutate({ requestId: req.id, status: "REJECTED" })}
                        style={{ flex: 1, padding: "8px", background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "6px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
