"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Edit3, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { getEmailTemplates, updateEmailTemplate, createEmailTemplate, testEmailTemplate } from "@/lib/api/admin";

export default function AdminEmailsPage() {
  const qc = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
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

  const createMut = useMutation({
    mutationFn: (data: any) => createEmailTemplate(data),
    onSuccess: () => { toast.success("Template created"); qc.invalidateQueries({ queryKey: ["admin-email-templates"] }); setIsCreating(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create template"),
  });

  const testMut = useMutation({
    mutationFn: ({ id, to }: { id: string, to: string }) => testEmailTemplate(id, to, { name: "Test User", courseName: "Test Course", amount: "1,500" }),
    onSuccess: () => { toast.success("Test email sent"); setShowTestDialog(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to send test email"),
  });

  const openEdit = (t: any) => { setEditingTemplate(t); setName(t.name); setSubject(t.subject); setHtmlBody(t.htmlBody); setIsCreating(false); };
  const openCreate = () => { setEditingTemplate(null); setName(""); setSubject(""); setHtmlBody(""); setIsCreating(true); };

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
      <PageHeader title="Email Templates" subtitle="Customize transactional emails sent by the platform" 
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl font-medium text-sm transition-all duration-300 bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-xl hover:-translate-y-0.5"
            style={{ padding: "12px 28px", boxShadow: "0 8px 24px rgba(201, 151, 58, 0.25)" }}>
            <Mail size={18} strokeWidth={2.5} /> Create New Template
          </button>
        } />

      {(editingTemplate || isCreating) && !showTestDialog ? (
        <div style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(228, 232, 224, 0.8)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 10px 40px rgba(26, 38, 29, 0.03), inset 0 0 0 1px rgba(255,255,255,1)",
        }}>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-cway-light-border/60">
            <h2 className="font-serif font-bold text-[24px] text-[#1A261D]">{isCreating ? "Create New Email Template" : `Edit: ${editingTemplate.name.replace(/_/g, " ")}`}</h2>
            {!isCreating && (
              <div className="flex items-center gap-2 font-sans text-[12px] bg-cway-light-alt px-3 py-1.5 rounded-lg border border-cway-light-border/60">
                <span className="font-bold text-cway-text-muted">Available Variables:</span>
                <span className="text-cway-text-muted font-mono">{editingTemplate.variables?.join(", ") || "None"}</span>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if (isCreating) createMut.mutate({ name: name.toUpperCase().replace(/\s+/g, "_"), subject, htmlBody });
            else updateMut.mutate({ id: editingTemplate.id, data: { subject, htmlBody } }); 
          }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {isCreating && (
              <div>
                <label className="block text-[11px] font-bold text-[#5C7360] uppercase tracking-wider mb-2">Template Key Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, "_"))} required placeholder="e.g. WELCOME_EMAIL" 
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #E4E8E0", background: "rgba(255,255,255,0.8)", fontSize: "14px", fontFamily: "monospace", color: "#1A261D", outline: "none", transition: "all 0.2s" }}
                />
                <p className="text-[12px] text-[#5C7360] mt-2 font-medium">Used internally to trigger the email. Must be uppercase with underscores.</p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#5C7360] uppercase tracking-wider mb-2">Subject Line *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Email Subject"
                style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #E4E8E0", background: "rgba(255,255,255,0.8)", fontSize: "15px", color: "#1A261D", outline: "none", transition: "all 0.2s" }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C7360] uppercase tracking-wider mb-2">HTML Body *</label>
              <textarea value={htmlBody} onChange={(e) => setHtmlBody(e.target.value)} required rows={18}
                style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #E4E8E0", background: "#F4F6F3", fontSize: "13px", fontFamily: "monospace", color: "#1A261D", outline: "none", transition: "all 0.2s", resize: "vertical" }}
              />
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-[#E4E8E0]">
              <button type="button" onClick={() => { setEditingTemplate(null); setIsCreating(false); }} 
                style={{ padding: "12px 24px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C7360", border: "1px solid #E4E8E0", background: "white", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={updateMut.isPending || createMut.isPending} 
                style={{ padding: "12px 28px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "white", background: "#B88645", border: "none", cursor: updateMut.isPending || createMut.isPending ? "not-allowed" : "pointer", opacity: updateMut.isPending || createMut.isPending ? 0.7 : 1, boxShadow: "0 4px 14px rgba(184, 134, 69, 0.3)" }}>
                {updateMut.isPending || createMut.isPending ? "Saving..." : isCreating ? "Create Template" : "Save Changes"}
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
