"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Search, Users, Shield, GraduationCap, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { getNotifications, broadcastNotification } from "@/lib/api/admin";
import * as Dialog from "@radix-ui/react-dialog";

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Users", icon: <Users size={14} /> },
  { value: "STUDENT", label: "Students Only", icon: <GraduationCap size={14} /> },
  { value: "INSTRUCTOR", label: "Instructors Only", icon: <CheckCircle size={14} /> },
  { value: "ADMIN", label: "Admins Only", icon: <Shield size={14} /> },
];

export default function AdminNotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [targetRole, setTargetRole] = useState<"ALL" | "ADMIN" | "INSTRUCTOR" | "STUDENT">("ALL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sendEmail, setSendEmail] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications", page],
    queryFn: () => getNotifications({ page, limit: 20 }),
  });

  const broadcastMut = useMutation({
    mutationFn: (d: any) => broadcastNotification(d),
    onSuccess: () => { toast.success("Notification sent"); qc.invalidateQueries({ queryKey: ["admin-notifications"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to send notification"),
  });

  const resetForm = () => { setShowForm(false); setTargetRole("ALL"); setTitle(""); setBody(""); setLink(""); setSendEmail(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    broadcastMut.mutate({ targetRole, title, body, link: link || undefined, sendEmail });
  };

  const columns: Column<any>[] = [
    { key: "type", header: "Type", render: (row) => <span className="font-sans text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cway-gold/10 text-cway-gold border border-cway-gold/20">{row.type}</span> },
    { key: "recipient", header: "Recipient", render: (row) => <span className="text-[#1A261D] font-bold text-[13px]">{row.user?.name || "System"}</span> },
    {
      key: "content", header: "Notification",
      render: (row) => (
        <div className="max-w-sm">
          <p className="font-sans text-[14px] font-bold text-[#1A261D]">{row.title}</p>
          <p className="font-sans text-[12px] line-clamp-1 mt-0.5 text-cway-text-muted">{row.body}</p>
        </div>
      )
    },
    { key: "status", header: "Status", render: (row) => <span className={`text-[13px] font-bold ${row.isRead ? "text-cway-success" : "text-cway-gold"}`}>{row.isRead ? "Read" : "Unread"}</span> },
    { key: "createdAt", header: "Sent", render: (row) => <span className="text-cway-text-muted text-[13px] font-medium">{formatDate(row.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Push Notifications" subtitle="Send announcements and alerts to platform users"
        actions={
          <button onClick={() => setShowForm(true)} className="group flex items-center gap-2 rounded-xl font-medium text-sm transition-all duration-300 bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-xl hover:-translate-y-0.5"
            style={{ padding: "12px 28px", boxShadow: "0 8px 24px rgba(201, 151, 58, 0.25)" }}>
            <Send size={18} strokeWidth={2.5} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /> Send Broadcast
          </button>
        } />

      <DataTable columns={columns} data={data?.notifications ?? []} loading={isLoading}
        pagination={data ? { page: data.page, pages: data.pages, total: data.total } : undefined}
        onPageChange={setPage} rowKey={(r) => r.id} emptyMessage="No notifications found" />

      {/* Broadcast Modal */}
      <Dialog.Root open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26, 38, 29, 0.6)", backdropFilter: "blur(8px)" }} />
          
          {/* Scrollable Wrapper to guarantee mouse scroll works perfectly */}
          <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
            
            <Dialog.Content style={{
              position: "relative", width: "100%", maxWidth: "520px", outline: "none",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(228, 232, 224, 0.8)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 10px 40px rgba(26, 38, 29, 0.05), inset 0 0 0 1px rgba(255,255,255,1)",
              margin: "auto"
            }}>
              
              <Dialog.Title style={{ fontFamily: "serif", fontWeight: 700, fontSize: "20px", color: "#1A261D", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(228, 232, 224, 0.6)" }}>
                New Broadcast Message
              </Dialog.Title>
              
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Target Audience</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {ROLE_OPTIONS.map((r) => (
                      <button key={r.value} type="button" onClick={() => setTargetRole(r.value as any)}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", 
                          borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                          border: targetRole === r.value ? "1px solid #B88645" : "1px solid #E4E8E0", 
                          background: targetRole === r.value ? "rgba(184, 134, 69, 0.1)" : "white", 
                          color: targetRole === r.value ? "#1A261D" : "#5C7360", 
                          transition: "all 0.2s" 
                        }}>
                        {r.icon} {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Notification Title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Short & catchy title" 
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "rgba(255,255,255,0.8)", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Message Body *</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} 
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "#F4F6F3", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s", resize: "vertical" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Call to Action Link (Optional)</label>
                  <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="e.g. /courses or https://..." 
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E4E8E0", background: "rgba(255,255,255,0.8)", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "4px", padding: "16px", background: "#F4F6F3", borderRadius: "12px", border: "1px solid #E4E8E0" }}>
                  <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#B88645", cursor: "pointer", marginTop: "2px" }} />
                  <div>
                    <label htmlFor="sendEmail" style={{ fontSize: "13px", fontWeight: 700, color: "#1A261D", cursor: "pointer", display: "block" }}>Also deliver as Email Alert</label>
                    <p style={{ fontSize: "11px", color: "#5C7360", marginTop: "4px", lineHeight: "1.4" }}>Sends a physical email to targeted users. Use for high-priority news.</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "20px", borderTop: "1px solid #E4E8E0" }}>
                  <Dialog.Close asChild>
                    <button type="button" style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C7360", border: "1px solid #E4E8E0", background: "white", cursor: "pointer" }}>Cancel</button>
                  </Dialog.Close>
                  <button type="submit" disabled={broadcastMut.isPending} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "white", background: "#B88645", border: "none", cursor: broadcastMut.isPending ? "not-allowed" : "pointer", opacity: broadcastMut.isPending ? 0.7 : 1, boxShadow: "0 4px 14px rgba(184, 134, 69, 0.3)" }}>
                    {broadcastMut.isPending ? "Sending..." : <><Send size={15} strokeWidth={2.5} /> Send Broadcast</>}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
