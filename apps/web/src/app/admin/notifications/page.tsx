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
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent">
            <Send size={15} strokeWidth={2.5} /> Send Broadcast
          </button>
        } />

      <DataTable columns={columns} data={data?.notifications ?? []} loading={isLoading}
        pagination={data ? { page: data.page, pages: data.pages, total: data.total } : undefined}
        onPageChange={setPage} rowKey={(r) => r.id} emptyMessage="No notifications found" />

      {/* Broadcast Modal */}
      <Dialog.Root open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1A261D]/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-[20px] p-7 w-full max-w-lg shadow-xl bg-white border border-cway-light-border outline-none">
            <Dialog.Title className="font-serif font-bold text-[24px] mb-6 text-[#1A261D]">New Broadcast Message</Dialog.Title>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLE_OPTIONS.map((r) => (
                    <button key={r.value} type="button" onClick={() => setTargetRole(r.value as any)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-sans text-[13px] font-bold transition-all border ${
                        targetRole === r.value ? "bg-cway-gold/10 border-cway-gold text-[#1A261D]" : "bg-white border-cway-light-border text-cway-text-muted hover:border-cway-gold/40"
                      }`}>
                      {r.icon} {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Notification Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-white border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none shadow-sm" />
              </div>

              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Message Body *</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-white border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none shadow-sm resize-none" />
              </div>

              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Call to Action Link (Optional)</label>
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/courses or https://..." className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-white border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none shadow-sm placeholder:text-cway-text-muted/60" />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-cway-light-border/60">
                <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="w-5 h-5 accent-cway-gold cursor-pointer" />
                <div>
                  <label htmlFor="sendEmail" className="font-sans text-[14px] font-bold block text-[#1A261D] cursor-pointer">Send as Email Alert as well</label>
                  <p className="font-sans text-[12px] text-cway-text-muted font-medium mt-0.5">This will send an email to all targeted users. Use sparingly.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-light-border bg-white text-cway-text-muted shadow-sm hover:border-cway-gold hover:text-cway-gold">Cancel</button>
                </Dialog.Close>
                <button type="submit" disabled={broadcastMut.isPending} className="flex items-center gap-2 px-6 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent disabled:opacity-60 disabled:cursor-not-allowed">
                  {broadcastMut.isPending ? "Sending..." : <><Send size={15} strokeWidth={2.5} /> Send Broadcast</>}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
