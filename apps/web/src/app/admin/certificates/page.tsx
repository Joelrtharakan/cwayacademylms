"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getCertificateTemplates, createCertificateTemplate, updateCertificateTemplate, deleteCertificateTemplate, previewCertificateTemplate } from "@/lib/api/admin";
import * as Dialog from "@radix-ui/react-dialog";

export default function AdminCertificatesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [htmlTemplate, setHtmlTemplate] = useState("");
  const [cssStyles, setCssStyles] = useState("");

  const { data: templates = [], isLoading } = useQuery({ queryKey: ["admin-cert-templates"], queryFn: getCertificateTemplates });

  const resetForm = () => { setShowForm(false); setEditTarget(null); setName(""); setHtmlTemplate(""); setCssStyles(""); };

  const openEdit = (t: any) => { setEditTarget(t); setName(t.name); setHtmlTemplate(t.htmlTemplate); setCssStyles(t.cssStyles || ""); setShowForm(true); };

  const createMut = useMutation({
    mutationFn: (d: any) => createCertificateTemplate(d),
    onSuccess: () => { toast.success("Template created"); qc.invalidateQueries({ queryKey: ["admin-cert-templates"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateCertificateTemplate(id, data),
    onSuccess: () => { toast.success("Template updated"); qc.invalidateQueries({ queryKey: ["admin-cert-templates"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCertificateTemplate(id),
    onSuccess: () => { toast.success("Template deleted"); qc.invalidateQueries({ queryKey: ["admin-cert-templates"] }); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const previewMut = useMutation({
    mutationFn: (id: string) => previewCertificateTemplate(id, {
      studentName: "John Doe", courseName: "Biblical Leadership", issueDate: new Date().toISOString(), uniqueCode: "CWAY-CERT-1234"
    }),
    onSuccess: (data) => setPreviewHtml(data.html),
    onError: (e: any) => toast.error("Failed to generate preview"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) updateMut.mutate({ id: editTarget.id, data: { name, htmlTemplate, cssStyles } });
    else createMut.mutate({ name, htmlTemplate, cssStyles });
  };

  const columns: Column<any>[] = [
    {
      key: "name", header: "Template Name",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cway-light-bg border border-cway-light-border shadow-sm text-cway-text-muted">
            <FileText size={18} strokeWidth={1.5} />
          </div>
          <span className="font-sans text-[15px] font-bold text-[#1A261D]">{row.name}</span>
        </div>
      )
    },
    { key: "courses", header: "Linked Courses", render: (row) => <span className="text-[13px] font-medium text-cway-text-muted">{row._count?.courses ?? 0} courses</span> },
    {
      key: "actions", header: "Actions", render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => previewMut.mutate(row.id)} className="p-2 rounded-lg transition-colors text-cway-text-muted hover:text-cway-success hover:bg-cway-success/10 border border-transparent hover:border-cway-success/20" title="Preview"><Eye size={15} /></button>
          <button onClick={() => openEdit(row)} className="p-2 rounded-lg transition-colors text-cway-text-muted hover:text-cway-gold hover:bg-cway-gold/10 border border-transparent hover:border-cway-gold/20"><Edit3 size={15} /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-2 rounded-lg transition-colors text-cway-text-muted hover:text-cway-danger hover:bg-cway-danger/10 border border-transparent hover:border-cway-danger/20"><Trash2 size={15} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Certificate Templates" subtitle="Design dynamic certificates generated for students upon completion"
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent">
            <Plus size={15} strokeWidth={2.5} /> New Template
          </button>
        } />

      {showForm && (
        <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
          <h2 className="font-serif font-bold mb-6 text-[20px] text-[#1A261D]">{editTarget ? "Edit Template" : "Create New Template"}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Template Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 flex justify-between items-end text-cway-text-muted">
                  <span>HTML Template *</span>
                  <span className="text-[10px] normal-case tracking-normal opacity-70">Use {`{{studentName}}`}, {`{{courseName}}`}, {`{{issueDate}}`}, {`{{uniqueCode}}`}</span>
                </label>
                <textarea value={htmlTemplate} onChange={(e) => setHtmlTemplate(e.target.value)} required rows={14}
                  className="w-full px-4 py-3 rounded-xl font-mono text-[13px] bg-cway-light-alt border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none resize-y" />
              </div>
              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">CSS Styles</label>
                <textarea value={cssStyles} onChange={(e) => setCssStyles(e.target.value)} rows={14}
                  className="w-full px-4 py-3 rounded-xl font-mono text-[13px] bg-cway-light-alt border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none resize-y" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-light-border bg-white text-cway-text-muted shadow-sm hover:border-cway-gold hover:text-cway-gold">Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-6 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent disabled:opacity-60 disabled:cursor-not-allowed">
                {createMut.isPending || updateMut.isPending ? "Saving..." : "Save Template"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={templates} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No certificate templates found" />

      {deleteTarget && (
        <ConfirmDialog open onOpenChange={() => setDeleteTarget(null)} title={`Delete ${deleteTarget.name}?`}
          description="Courses using this template will no longer generate certificates until a new template is assigned."
          confirmLabel="Delete" danger loading={deleteMut.isPending} onConfirm={() => deleteMut.mutate(deleteTarget.id)} />
      )}

      {/* Preview Dialog */}
      <Dialog.Root open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1A261D]/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-xl border border-cway-light-border">
            <button onClick={() => setPreviewHtml(null)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white border border-cway-light-border text-cway-text-muted rounded-full shadow-sm z-10 hover:border-cway-gold hover:text-cway-gold transition-all">✕</button>
            <div className="w-full h-full p-6 overflow-auto bg-cway-light-bg">
              <div dangerouslySetInnerHTML={{ __html: previewHtml || "" }} className="w-full min-h-[500px] shadow-lg border border-cway-light-border bg-white" />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
