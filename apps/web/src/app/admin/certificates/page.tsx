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

  const loadDefaultTemplate = () => {
    setName("CWAY Standard Certificate");
    setHtmlTemplate(`<style>
.certificate {
  width: 800px;
  height: 600px;
  padding: 40px;
  background: white;
  border: 10px solid #B88645;
  box-sizing: border-box;
  text-align: center;
  position: relative;
  font-family: 'Georgia', serif;
}
.logo { height: 60px; margin: 0 auto 20px auto; display: block; }
h1 { font-size: 36px; color: #1A261D; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px; }
.body p { font-size: 18px; color: #5C7360; margin: 10px 0; }
.body h2 { font-size: 42px; color: #B88645; margin: 20px 0; font-style: italic; }
.body h3 { font-size: 28px; color: #1A261D; margin: 20px 0; }
.footer { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px; }
.signature .line { width: 200px; border-bottom: 1px solid #1A261D; margin-bottom: 10px; }
.date { text-align: left; }
.code { font-size: 12px; color: #8F9E93; margin-top: 5px; font-family: monospace; }
</style>

<div class="certificate">
  <div class="header">
    <img src="/logo.png" alt="CWAY Academy Logo" class="logo" />
    <h1>Certificate of Completion</h1>
  </div>
  <div class="body">
    <p>This is to certify that</p>
    <h2>{{studentName}}</h2>
    <p>has successfully completed the course</p>
    <h3>{{courseName}}</h3>
  </div>
  <div class="footer">
    <div class="signature">
      <div class="line"></div>
      <p>Director of Academics</p>
    </div>
    <div class="date">
      <p>Date: {{issueDate}}</p>
      <p class="code">Credential ID: {{uniqueCode}}</p>
    </div>
  </div>
</div>`);
  };

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
    onSuccess: (data) => setPreviewHtml(data.renderedHtml),
    onError: (e: any) => toast.error("Failed to generate preview"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) updateMut.mutate({ id: editTarget.id, data: { name, htmlTemplate } });
    else createMut.mutate({ name, htmlTemplate });
  };

  const handleLocalPreview = () => {
    let html = htmlTemplate;
    html = html.replace(/{{studentName}}/g, "John Doe");
    html = html.replace(/{{courseName}}/g, "Biblical Leadership");
    html = html.replace(/{{issueDate}}/g, new Date().toLocaleDateString());
    html = html.replace(/{{uniqueCode}}/g, "CWAY-CERT-1234");
    setPreviewHtml(`<div style="display:flex;justify-content:center;align-items:center;min-height:100%;padding:20px;">${html}</div>`);
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
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl font-medium text-sm transition-all duration-300 bg-[#1A261D] text-white hover:bg-[#2C4A3B] hover:shadow-xl hover:-translate-y-0.5"
            style={{ padding: "12px 28px", boxShadow: "0 8px 24px rgba(201, 151, 58, 0.25)" }}>
            <Plus size={18} strokeWidth={2.5} /> Create New Template
          </button>
        } />

      {/* Create/Edit Modal */}
      <Dialog.Root open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26, 38, 29, 0.6)", backdropFilter: "blur(8px)" }} />
          
          <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
            <Dialog.Content style={{
              position: "relative", width: "100%", maxWidth: "700px", outline: "none",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(228, 232, 224, 0.8)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 10px 40px rgba(26, 38, 29, 0.05), inset 0 0 0 1px rgba(255,255,255,1)",
              margin: "auto"
            }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(228, 232, 224, 0.6)" }}>
                <Dialog.Title style={{ fontFamily: "serif", fontWeight: 700, fontSize: "20px", color: "#1A261D", margin: 0 }}>
                  {editTarget ? "Edit Template" : "Create New Template"}
                </Dialog.Title>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {!editTarget && (
                    <button onClick={loadDefaultTemplate} type="button" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B88645", border: "1px solid rgba(184, 134, 69, 0.3)", padding: "6px 12px", borderRadius: "8px", background: "rgba(184, 134, 69, 0.05)", cursor: "pointer", transition: "all 0.2s" }}>
                      Load Default CWAY Template
                    </button>
                  )}
                  <Dialog.Close asChild>
                    <button type="button" style={{ color: "#9AAE9B", cursor: "pointer", background: "transparent", border: "none", fontSize: "18px", padding: "4px" }}>✕</button>
                  </Dialog.Close>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Template Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. End of Course Diploma"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "#F9FAF8", border: "1.5px solid #E4E8E0", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; }}
                  />
                </div>

                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    <span>HTML / CSS Template *</span>
                    <span style={{ fontSize: "10px", fontWeight: 400, textTransform: "none", letterSpacing: "normal", opacity: 0.7 }}>Use {`{{studentName}}`}, {`{{courseName}}`}, {`{{issueDate}}`}, {`{{uniqueCode}}`}</span>
                  </label>
                  <textarea value={htmlTemplate} onChange={(e) => setHtmlTemplate(e.target.value)} required rows={12}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "#F0F2ED", border: "1px solid #E4E8E0", fontSize: "12px", fontFamily: "monospace", color: "#1A261D", outline: "none", resize: "vertical", boxSizing: "border-box", minHeight: "200px" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", marginTop: "12px", paddingTop: "20px", borderTop: "1px solid #E4E8E0" }}>
                  <button type="button" onClick={handleLocalPreview} style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#FAFBFA", border: "1px solid #E4E8E0", color: "#1A261D", cursor: "pointer" }}>
                    <Eye size={14} /> Live Preview
                  </button>

                  <Dialog.Close asChild>
                    <button type="button" onClick={resetForm} style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C7360", border: "1px solid transparent", background: "transparent", cursor: "pointer" }}>Cancel</button>
                  </Dialog.Close>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "white", background: "#1A261D", border: "none", cursor: (createMut.isPending || updateMut.isPending) ? "not-allowed" : "pointer", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1, boxShadow: "0 4px 14px rgba(26, 38, 29, 0.3)" }}>
                    {createMut.isPending || updateMut.isPending ? "Saving..." : "Save Template"}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

      <DataTable columns={columns} data={templates} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No certificate templates found" />

      {deleteTarget && (
        <ConfirmDialog open onOpenChange={() => setDeleteTarget(null)} title={`Delete ${deleteTarget.name}?`}
          description="Courses using this template will no longer generate certificates until a new template is assigned."
          confirmLabel="Delete" danger loading={deleteMut.isPending} onConfirm={() => deleteMut.mutate(deleteTarget.id)} />
      )}

      {/* Preview Dialog */}
      <Dialog.Root open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1A261D]/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center outline-none overflow-hidden">
            <Dialog.Title className="sr-only">Certificate Preview</Dialog.Title>
            
            <button onClick={() => setPreviewHtml(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white border border-cway-light-border text-[#1A261D] rounded-full shadow-2xl z-[60] hover:scale-105 hover:border-cway-gold hover:text-cway-gold transition-all">✕</button>

            <div className="flex-1 w-full h-full flex items-center justify-center relative">
              <div 
                ref={(el) => {
                  if (el) {
                    const updateScale = () => {
                      const child = el.firstElementChild;
                      if (!child) return;
                      const contentWidth = Math.max(child.scrollWidth, 1000);
                      const contentHeight = Math.max(child.scrollHeight, 700);
                      const wScale = (window.innerWidth * 0.9) / contentWidth;
                      const hScale = (window.innerHeight * 0.85) / contentHeight;
                      el.style.transform = `scale(${Math.min(1, wScale, hScale)})`;
                    };
                    setTimeout(updateScale, 50); // wait for HTML to render
                    window.addEventListener('resize', updateScale);
                    (el as any)._cleanup = () => window.removeEventListener('resize', updateScale);
                  }
                }}
                style={{ transformOrigin: "center center", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div dangerouslySetInnerHTML={{ __html: previewHtml || "" }} className="shadow-2xl bg-white flex-shrink-0 inline-block" />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
