"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Edit3, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { getEmailTemplates, updateEmailTemplate, testEmailTemplate } from "@/lib/api/admin";

export default function AdminEmailsPage() {
  const qc = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [showTestDialog, setShowTestDialog] = useState(false);

  const { data: templates = [], isLoading } = useQuery({ queryKey: ["admin-email-templates"], queryFn: getEmailTemplates });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateEmailTemplate(id, data),
    onSuccess: () => { toast.success("Template updated"); qc.invalidateQueries({ queryKey: ["admin-email-templates"] }); setEditingTemplate(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const testMut = useMutation({
    mutationFn: ({ id, to }: { id: string, to: string }) => testEmailTemplate(id, to, { name: "Test User", courseName: "Test Course", amount: "1,500" }),
    onSuccess: () => { toast.success("Test email sent"); setShowTestDialog(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to send test email"),
  });

  const openEdit = (t: any) => { setEditingTemplate(t); setSubject(t.subject); setHtmlBody(t.htmlBody); };

  const columns: Column<any>[] = [
    { key: "name", header: "Template Name", render: (row) => <span className="font-sans font-bold text-[#1A261D]">{row.name.replace(/_/g, " ")}</span> },
    { key: "subject", header: "Subject Line", render: (row) => <span className="text-cway-text-muted text-[13px] font-medium">{row.subject}</span> },
    { key: "updated", header: "Last Updated", render: (row) => <span className="text-cway-text-muted text-[13px]">{new Date(row.updatedAt).toLocaleDateString()}</span> },
    {
      key: "actions", header: "Actions", render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { setEditingTemplate(row); setShowTestDialog(true); }} className="p-2 rounded-lg transition-colors text-cway-text-muted hover:text-cway-gold hover:bg-cway-gold/10 border border-transparent hover:border-cway-gold/20" title="Send Test"><Send size={15} /></button>
          <button onClick={() => openEdit(row)} className="p-2 rounded-lg transition-colors text-cway-text-muted hover:text-cway-gold hover:bg-cway-gold/10 border border-transparent hover:border-cway-gold/20" title="Edit"><Edit3 size={15} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Email Templates" subtitle="Customize transactional emails sent by the platform" />

      {editingTemplate && !showTestDialog ? (
        <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-cway-light-border/60">
            <h2 className="font-serif font-bold text-[20px] text-[#1A261D]">Edit: {editingTemplate.name.replace(/_/g, " ")}</h2>
            <div className="flex items-center gap-2 font-sans text-[12px] bg-cway-light-alt px-3 py-1.5 rounded-lg border border-cway-light-border/60">
              <span className="font-bold text-cway-text-muted">Variables:</span>
              <span className="text-cway-text-muted font-mono">{editingTemplate.variables?.join(", ") || "None"}</span>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); updateMut.mutate({ id: editingTemplate.id, data: { subject, htmlBody } }); }} className="space-y-6">
            <div>
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Subject Line *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-white border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none shadow-sm" />
            </div>

            <div>
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">HTML Body *</label>
              <textarea value={htmlBody} onChange={(e) => setHtmlBody(e.target.value)} required rows={15}
                className="w-full px-4 py-3 rounded-xl font-mono text-[13px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none resize-y" />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cway-light-border/60">
              <button type="button" onClick={() => setEditingTemplate(null)} className="px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-light-border bg-white text-cway-text-muted shadow-sm hover:border-cway-gold hover:text-cway-gold">Cancel</button>
              <button type="submit" disabled={updateMut.isPending} className="px-6 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent disabled:opacity-60 disabled:cursor-not-allowed">
                {updateMut.isPending ? "Saving..." : "Save Template"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <DataTable columns={columns} data={templates} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No templates found" />
      )}

      {showTestDialog && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A261D]/40 backdrop-blur-sm">
          <div className="rounded-[20px] p-7 w-full max-w-md mx-4 shadow-xl bg-white border border-cway-light-border">
            <h2 className="font-serif font-bold mb-3 text-[22px] text-[#1A261D]">Send Test Email</h2>
            <p className="font-sans text-[13px] mb-5 text-cway-text-muted">Template: <span className="font-bold">{editingTemplate.name}</span></p>
            <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Email address..." className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-white border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none shadow-sm mb-6" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowTestDialog(false)} className="px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-light-border bg-white text-cway-text-muted shadow-sm hover:border-cway-gold hover:text-cway-gold">Cancel</button>
              <button onClick={() => testEmail && testMut.mutate({ id: editingTemplate.id, to: testEmail })} disabled={!testEmail || testMut.isPending} className="px-6 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent disabled:opacity-60 disabled:cursor-not-allowed">
                {testMut.isPending ? "Sending..." : "Send Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
