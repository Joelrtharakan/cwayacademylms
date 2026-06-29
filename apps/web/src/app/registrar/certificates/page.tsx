"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Eye, FileText, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/registrar/PageHeader";
import { DataTable, Column } from "@/components/registrar/DataTable";
import { ConfirmDialog } from "@/components/registrar/ConfirmDialog";
import {
  getCertificateTemplates, createCertificateTemplate,
  updateCertificateTemplate, deleteCertificateTemplate,
  previewCertificateTemplate
} from "@/lib/api/registrar";
import * as Dialog from "@radix-ui/react-dialog";

// ── Shared CSS + frame used for both preview and default templates ────────────
const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 297mm; height: 210mm; background: #0C1527; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; }
  .cert-frame { width: 289mm; height: 202mm; position: relative; overflow: hidden; }
  .border-outer { position: absolute; inset: 0; background: #0C1527; }
  .corner { position: absolute; width: 80px; height: 80px; }
  .corner-tl { top: 8mm; left: 8mm; border-top: 3px solid #C9973A; border-left: 3px solid #C9973A; }
  .corner-tr { top: 8mm; right: 8mm; border-top: 3px solid #C9973A; border-right: 3px solid #C9973A; }
  .corner-bl { bottom: 8mm; left: 8mm; border-bottom: 3px solid #C9973A; border-left: 3px solid #C9973A; }
  .corner-br { bottom: 8mm; right: 8mm; border-bottom: 3px solid #C9973A; border-right: 3px solid #C9973A; }
  .edge-deco { position: absolute; background: #C9973A; }
`;
const PREVIEW_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; }
  .cert-container { width: 297mm; height: 210mm; position: relative; background: #fff; overflow: hidden; transform-origin: top left; }
  .cert-inner { position: absolute; top: 14mm; left: 14mm; right: 14mm; bottom: 14mm; background: #FDFAF4; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 22px 44px; gap: 0; }
  .inner-border { position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #C9973A; pointer-events: none; opacity: 0.3; }
  .inner-corner { position: absolute; width: 20px; height: 20px; border: 1.5px solid #C9973A; }
  .inner-corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
  .inner-corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
  .inner-corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
  .inner-corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }
  .org-title { font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 2px; }
  .org-title .cway { color: #1A261D; }
  .org-title .academy { color: #C9973A; letter-spacing: 0.18em; font-weight: 400; }
  .org-subtitle { font-family: 'Montserrat', sans-serif; font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: #8A9E8C; margin-bottom: 14px; }
  .cert-title { font-family: 'Cinzel', serif; font-size: 34px; font-weight: 700; color: #1A261D; letter-spacing: 0.08em; margin-bottom: 0px; }
  .cert-subtitle { font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #C9973A; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .cert-subtitle::before, .cert-subtitle::after { content: ''; width: 55px; height: 1.5px; background: #C9973A; }
  .presented-to { font-family: 'Playfair Display', serif; font-size: 16px; font-style: italic; color: #666; margin-bottom: 8px; }
  .student-name { font-family: 'Great Vibes', cursive; font-size: 56px; font-weight: 400; color: #C9973A; letter-spacing: 0.02em; border-bottom: 2px solid #C9973A; padding-bottom: 4px; margin-bottom: 16px; min-width: 380px; text-align: center; }
  .cert-body { font-family: 'Playfair Display', serif; font-size: 15px; font-style: italic; color: #444; text-align: center; line-height: 1.6; max-width: 560px; margin-bottom: 0px; }
  .top-section { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; }
  .bottom-section { width: 100%; }
  .signatories { width: 100%; display: flex; justify-content: space-between; align-items: flex-start; padding: 0 16px; margin-top: 0px; }
  .signatory { text-align: center; min-width: 170px; }
  .sig-line { width: 150px; height: 1px; background: #333; margin: 0 auto 6px; }
  .sig-name { font-family: 'Montserrat', sans-serif; font-size: 12px; color: #0C1527; font-weight: 700; margin-bottom: 2px; }
  .sig-title { font-family: 'Montserrat', sans-serif; font-size: 9px; color: #C9973A; letter-spacing: 0.03em; }
  .seal-section { text-align: center; display: flex; flex-direction: column; align-items: center; margin-top: 14px; }
  .seal img { width: 38px; height: 38px; object-fit: contain; }
  .cert-number { font-family: 'Montserrat', sans-serif; font-size: 10px; color: #555; letter-spacing: 0.03em; margin-bottom: 2px; }
  .reg-info { font-family: 'Montserrat', sans-serif; font-size: 8px; color: #999; }
`;

const SIGNATORIES = `
  <div class="bottom-section">
    <div class="signatories">
      <div class="signatory"><div class="sig-line"></div><div class="sig-name">Dr. Reeju Tharakan</div><div class="sig-title">Executive Director</div></div>
      <div class="signatory"><div class="sig-line"></div><div class="sig-name">Pr. Robin Ninan</div><div class="sig-title">Director of Academics</div></div>
      <div class="signatory"><div class="sig-line"></div><div class="sig-name">Evg. Finny Philip Varghese</div><div class="sig-title">Administrative Director</div></div>
    </div>
    <div class="seal-section">
      <div class="seal"><img src="https://cwayacademy.netlify.app/logo.png?v=3" alt="Seal"></div>
      <div class="cert-number">Certificate Number: {{certificateNumber}}</div>
      <div class="reg-info">a project under CWAY MISSIONS Regn # HLS-4-00219-2023-24</div>
    </div>
  </div>`;

function makeDefaultHtml(type: "COURSE" | "PROGRAM"): string {
  const title = type === "PROGRAM" ? "PROGRAM" : "CERTIFICATE";
  const subtitle = type === "PROGRAM" ? "CERTIFICATE OF COMPLETION" : "OF COMPLETION";
  const body = type === "PROGRAM"
    ? `for fulfilling all the requirements of the program titled "{{courseName}}," conducted by CWAY Academy. Completed on {{completionDate}}.`
    : `for successfully completing the course titled "{{courseName}}," conducted by CWAY Academy. Completed on {{completionDate}}.`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>${SHARED_STYLES}</style></head>
<body>
  <div class="cert-frame">
    <div class="border-outer"></div>
    <div class="gold-bar gold-bar-top"></div><div class="gold-bar gold-bar-bottom"></div>
    <div class="corner corner-tl"></div><div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div><div class="corner corner-br"></div>
    <div class="edge-deco edge-top"></div><div class="edge-deco edge-bottom"></div>
    <div class="edge-deco edge-left"></div><div class="edge-deco edge-right"></div>
    <div class="cert-inner">
      <div class="inner-border"></div>
      <div class="inner-corner inner-corner-tl"></div><div class="inner-corner inner-corner-tr"></div>
      <div class="inner-corner inner-corner-bl"></div><div class="inner-corner inner-corner-br"></div>
      <div class="top-section">
        <div class="org-title"><span class="cway">CWAY</span> <span class="academy">ACADEMY</span></div>
        <div class="org-subtitle">Coach, Challenge, and Commission</div>
        <div class="cert-title">${title}</div>
        <div class="cert-subtitle">${subtitle}</div>
        <div class="presented-to">presented to:</div>
        <div class="student-name">{{studentName}}</div>
        <div class="cert-body">${body}</div>
      </div>
      ${SIGNATORIES}
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCertificatesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<"COURSE" | "PROGRAM">("COURSE");
  const [htmlTemplate, setHtmlTemplate] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin-cert-templates"],
    queryFn: getCertificateTemplates,
  });

  const resetForm = () => {
    setShowForm(false); setEditTarget(null);
    setName(""); setType("COURSE"); setHtmlTemplate(""); setIsDefault(false);
  };

  const openEdit = (t: any) => {
    setEditTarget(t); setName(t.name);
    setType(t.type || "COURSE"); setHtmlTemplate(t.htmlTemplate);
    setIsDefault(t.isDefault || false); setShowForm(true);
  };

  const loadDefault = () => {
    setName(type === "PROGRAM" ? "CWAY Program Certificate" : "CWAY Course Certificate");
    setHtmlTemplate(makeDefaultHtml(type));
  };

  const handleLocalPreview = () => {
    let html = htmlTemplate
      .replace(/{{studentName}}/g, "John Doe")
      .replace(/{{courseName}}/g, type === "PROGRAM" ? "Biblical Leadership Program" : "Introduction to Biblical Studies")
      .replace(/{{completionDate}}/g, new Date().toLocaleDateString())
      .replace(/{{certificateNumber}}/g, "CA/2406/12345")
      .replace(/{{uniqueCode}}/g, "CWAY-CERT-1234");
    setPreviewHtml(html);
  };

  const createMut = useMutation({
    mutationFn: (d: any) => createCertificateTemplate(d),
    onSuccess: () => { toast.success("Template created"); qc.invalidateQueries({ queryKey: ["admin-cert-templates"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCertificateTemplate(id, data),
    onSuccess: () => { toast.success("Template updated"); qc.invalidateQueries({ queryKey: ["admin-cert-templates"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCertificateTemplate(id),
    onSuccess: () => { toast.success("Template deleted"); qc.invalidateQueries({ queryKey: ["admin-cert-templates"] }); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, type, htmlTemplate, isDefault };
    if (editTarget) updateMut.mutate({ id: editTarget.id, data: payload });
    else createMut.mutate(payload);
  };

  const columns: Column<any>[] = [
    {
      key: "name", header: "Template",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: row.type === "PROGRAM" ? "rgba(184,134,69,0.1)" : "rgba(26,38,29,0.07)", border: `1px solid ${row.type === "PROGRAM" ? "rgba(184,134,69,0.3)" : "rgba(26,38,29,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: row.type === "PROGRAM" ? "#B88645" : "#1A261D", flexShrink: 0 }}>
            {row.type === "PROGRAM" ? <GraduationCap size={18} /> : <BookOpen size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1A261D" }}>{row.name}</div>
            <div style={{ fontSize: 11, color: "#8A9E8C", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: row.type === "PROGRAM" ? "rgba(184,134,69,0.12)" : "rgba(26,38,29,0.07)", color: row.type === "PROGRAM" ? "#B88645" : "#4A7A5C", padding: "1px 8px", borderRadius: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 10 }}>{row.type || "COURSE"}</span>
              {row.isDefault && <span style={{ background: "rgba(26,38,29,0.07)", color: "#1A261D", padding: "1px 8px", borderRadius: 10, fontWeight: 600, fontSize: 10, letterSpacing: "0.04em" }}>DEFAULT</span>}
            </div>
          </div>
        </div>
      )
    },
    { key: "count", header: "Linked Certs", render: (row) => <span style={{ fontSize: 13, color: "#8A9E8C", fontWeight: 500 }}>{row._count?.certificates ?? 0} certificates</span> },
    {
      key: "actions", header: "Actions",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={() => { let html = row.htmlTemplate.replace(/{{studentName}}/g, "Jane Smith").replace(/{{courseName}}/g, "Biblical Leadership").replace(/{{completionDate}}/g, new Date().toLocaleDateString()).replace(/{{certificateNumber}}/g, "CA/2406/12345").replace(/{{uniqueCode}}/g, "CWAY-CERT-1234"); setPreviewHtml(html); }}
            style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#8A9E8C", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,122,92,0.1)"; e.currentTarget.style.color = "#4A7A5C"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8A9E8C"; }}
            title="Preview">
            <Eye size={15} />
          </button>
          <button onClick={() => openEdit(row)}
            style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#8A9E8C", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,134,69,0.1)"; e.currentTarget.style.color = "#B88645"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8A9E8C"; }}>
            <Edit3 size={15} />
          </button>
          <button onClick={() => setDeleteTarget(row)}
            style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#8A9E8C", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(176,58,46,0.1)"; e.currentTarget.style.color = "#B03A2E"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8A9E8C"; }}>
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, background: "#F9FAF8", border: "1.5px solid #E4E8E0", fontSize: 13, color: "#1A261D", outline: "none", transition: "all 0.2s", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Certificate Templates"
        subtitle="Design and manage certificate templates for courses and programs"
        actions={
          <button onClick={() => setShowForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, fontWeight: 600, fontSize: 14, background: "#1A261D", color: "white", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(201,151,58,0.25)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2C4A3B"}
            onMouseLeave={e => e.currentTarget.style.background = "#1A261D"}>
            <Plus size={18} strokeWidth={2.5} /> Create Template
          </button>
        }
      />

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { type: "COURSE", icon: <BookOpen size={20} />, label: "Course Certificate", desc: "Issued when a student completes a standalone course", color: "#4A7A5C", bg: "rgba(74,122,92,0.08)" },
          { type: "PROGRAM", icon: <GraduationCap size={20} />, label: "Program Certificate", desc: "Issued when a student completes a full program", color: "#B88645", bg: "rgba(184,134,69,0.08)" },
        ].map(card => (
          <div key={card.type} style={{ padding: "20px 24px", borderRadius: 16, background: card.bg, border: `1px solid ${card.color}30`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}15`, border: `1px solid ${card.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1A261D", marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 13, color: "#8A9E8C", lineHeight: 1.4 }}>{card.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={templates} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No certificate templates yet. Create one to get started." />

      {/* Create/Edit Modal */}
      <Dialog.Root open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26,38,29,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px" }}>
            <Dialog.Content style={{ position: "relative", width: "100%", maxWidth: 800, outline: "none", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(228,232,224,0.8)", borderRadius: 20, padding: 28, boxShadow: "0 20px 60px rgba(26,38,29,0.12)", margin: "auto" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(228,232,224,0.7)" }}>
                <Dialog.Title style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 20, color: "#1A261D", margin: 0 }}>
                  {editTarget ? "Edit Template" : "Create Certificate Template"}
                </Dialog.Title>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={loadDefault} type="button"
                    style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B88645", border: "1px solid rgba(184,134,69,0.3)", padding: "7px 14px", borderRadius: 8, background: "rgba(184,134,69,0.06)", cursor: "pointer" }}>
                    Load CWAY Default
                  </button>
                  <Dialog.Close asChild>
                    <button type="button" style={{ color: "#9AAE9B", cursor: "pointer", background: "transparent", border: "none", fontSize: 20, padding: 4, lineHeight: 1 }}>✕</button>
                  </Dialog.Close>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Name + Type row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Template Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. CWAY Course Certificate"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "#B88645"}
                      onBlur={e => e.currentTarget.style.borderColor = "#E4E8E0"} />
                  </div>
                  <div>
                    <label style={labelStyle}>Certificate Type *</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} required
                      style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="COURSE">Course Certificate</option>
                      <option value="PROGRAM">Program Certificate</option>
                    </select>
                  </div>
                </div>

                {/* Default toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: isDefault ? "rgba(184,134,69,0.06)" : "#F9FAF8", border: `1.5px solid ${isDefault ? "rgba(184,134,69,0.3)" : "#E4E8E0"}`, cursor: "pointer", transition: "all 0.2s" }} onClick={() => setIsDefault(!isDefault)}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: isDefault ? "#B88645" : "transparent", border: `2px solid ${isDefault ? "#B88645" : "#C8D0C4"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>
                    {isDefault && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1A261D" }}>Set as default {type === "PROGRAM" ? "program" : "course"} template</div>
                    <div style={{ fontSize: 11, color: "#8A9E8C", marginTop: 1 }}>New {type === "PROGRAM" ? "program" : "course"} certificates will use this template automatically</div>
                  </div>
                </div>

                {/* HTML Editor */}
                <div>
                  <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
                    <span>HTML Template *</span>
                    <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: "normal", color: "#9AAE9B" }}>
                      Variables: {`{{studentName}}`} {`{{courseName}}`} {`{{completionDate}}`} {`{{certificateNumber}}`}
                    </span>
                  </label>
                  <textarea value={htmlTemplate} onChange={e => setHtmlTemplate(e.target.value)} required rows={14}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "#0F1923", border: "1px solid #2A3F4F", fontSize: 12, fontFamily: "'Fira Code', 'Courier New', monospace", color: "#E8F0E8", outline: "none", resize: "vertical", boxSizing: "border-box", minHeight: 240, lineHeight: 1.6 }}
                    onFocus={e => e.currentTarget.style.borderColor = "#B88645"}
                    onBlur={e => e.currentTarget.style.borderColor = "#2A3F4F"} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid #E4E8E0" }}>
                  <button type="button" onClick={handleLocalPreview}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#F0F2ED", border: "1px solid #E4E8E0", color: "#1A261D", cursor: "pointer", marginRight: "auto" }}>
                    <Eye size={14} /> Preview
                  </button>
                  <Dialog.Close asChild>
                    <button type="button" onClick={resetForm} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C7360", border: "1px solid transparent", background: "transparent", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                    style={{ padding: "10px 28px", borderRadius: 10, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "white", background: "#1A261D", border: "none", cursor: "pointer", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1, boxShadow: "0 4px 14px rgba(26,38,29,0.3)", transition: "all 0.2s" }}>
                    {createMut.isPending || updateMut.isPending ? "Saving..." : editTarget ? "Update Template" : "Save Template"}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog open onOpenChange={() => setDeleteTarget(null)} title={`Delete "${deleteTarget.name}"?`}
          description="Any certificates already issued with this template will retain their original design. New certificates won't use it."
          confirmLabel="Delete" danger loading={deleteMut.isPending} onConfirm={() => deleteMut.mutate(deleteTarget.id)} />
      )}

      {/* Preview Dialog */}
      <Dialog.Root open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1A261D]/90 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center outline-none">
            <Dialog.Title className="sr-only">Certificate Preview</Dialog.Title>
            <button onClick={() => setPreviewHtml(null)}
              style={{ position: "absolute", top: 24, right: 24, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E4E8E0", color: "#1A261D", borderRadius: "50%", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", cursor: "pointer", fontSize: 18, zIndex: 60, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.color = "#B88645"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.color = "#1A261D"; }}>
              ✕
            </button>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div ref={(el) => {
                if (el) {
                  const update = () => {
                    const child = el.firstElementChild as HTMLElement;
                    if (!child) return;
                    const wScale = (window.innerWidth * 0.88) / Math.max(child.scrollWidth, 1000);
                    const hScale = (window.innerHeight * 0.85) / Math.max(child.scrollHeight, 700);
                    el.style.transform = `scale(${Math.min(1, wScale, hScale)})`;
                  };
                  setTimeout(update, 60);
                  window.addEventListener("resize", update);
                }
              }} style={{ transformOrigin: "center center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div dangerouslySetInnerHTML={{ __html: previewHtml || "" }} style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }} />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
