"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getCourses } from "@/lib/api/admin";
import * as Dialog from "@radix-ui/react-dialog";

function formatDate(iso: string) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: getCoupons,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-lite"],
    queryFn: () => getCourses({ limit: 100 }),
    enabled: showForm,
  });

  const resetForm = () => {
    setShowForm(false); setEditTarget(null);
    setCode(""); setDiscount(""); setType("PERCENT"); setMaxUses(""); setExpiresAt(""); setCourseId(""); setIsActive(true);
  };

  const openEdit = (c: any) => {
    setEditTarget(c);
    setCode(c.code);
    setDiscount(c.discount.toString());
    setType(c.type);
    setMaxUses(c.maxUses.toString());
    setExpiresAt(c.expiresAt ? c.expiresAt.split("T")[0] : "");
    setCourseId(c.courseId || "");
    setIsActive(c.isActive);
    setShowForm(true);
  };

  const createMut = useMutation({
    mutationFn: (d: any) => createCoupon(d),
    onSuccess: () => { toast.success("Coupon created"); qc.invalidateQueries({ queryKey: ["admin-coupons"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateCoupon(id, data),
    onSuccess: () => { toast.success("Coupon updated"); qc.invalidateQueries({ queryKey: ["admin-coupons"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => { toast.success("Coupon deleted"); qc.invalidateQueries({ queryKey: ["admin-coupons"] }); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      updateMut.mutate({ id: editTarget.id, data: { isActive, expiresAt: expiresAt || undefined, maxUses: maxUses ? parseInt(maxUses) : undefined } });
    } else {
      createMut.mutate({ code, discount: parseFloat(discount), type, maxUses: maxUses ? parseInt(maxUses) : undefined, expiresAt: expiresAt || undefined, courseId: courseId || undefined });
    }
  };

  const columns: Column<any>[] = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono text-[14px] tracking-widest font-bold text-[#1A261D] bg-cway-light-alt px-2 py-1 rounded border border-cway-light-border">{row.code}</span> },
    { key: "discount", header: "Discount", render: (row) => <span className="font-sans text-[15px] font-bold text-cway-gold">{row.type === "PERCENT" ? `${row.discount}%` : `₹${row.discount}`}</span> },
    { key: "course", header: "Course Limit", render: (row) => <span className="text-cway-text-muted text-[13px] font-medium">{row.course?.title || "All Courses"}</span> },
    { key: "usage", header: "Usage", render: (row) => <span className="text-cway-text-muted text-[13px] font-mono bg-cway-light-bg px-2 py-0.5 rounded border border-cway-light-border">{row.usedCount} / {row.maxUses}</span> },
    { key: "expiresAt", header: "Expires", render: (row) => <span className="text-cway-text-muted text-[13px]">{formatDate(row.expiresAt)}</span> },
    { key: "status", header: "Status", render: (row) => (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${row.isActive ? "bg-cway-success/10 text-cway-success" : "bg-cway-danger/10 text-cway-danger"}`}>
        {row.isActive ? "Active" : "Disabled"}
      </span>
    )},
    { key: "actions", header: "Actions", render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => openEdit(row)} className="p-2 rounded-lg transition-colors text-cway-text-muted hover:text-cway-gold hover:bg-cway-gold/10 border border-transparent hover:border-cway-gold/20"><Edit3 size={15} /></button>
        <button onClick={() => setDeleteTarget(row)} className="p-2 rounded-lg transition-colors text-cway-text-muted hover:text-cway-danger hover:bg-cway-danger/10 border border-transparent hover:border-cway-danger/20"><Trash2 size={15} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discount Coupons"
        subtitle="Create and manage promotional codes for courses"
        actions={
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl font-sans font-bold text-[12px] uppercase tracking-wider transition-all duration-300 bg-[#1A261D] text-white hover:bg-[#2C4A3B] hover:-translate-y-0.5"
            style={{ padding: "10px 20px", boxShadow: "0 8px 24px rgba(201, 151, 58, 0.25)" }}>
            <Plus size={16} strokeWidth={2.5} /> New Coupon
          </button>
        }
      />

      {/* Create/Edit Modal */}
      <Dialog.Root open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26, 38, 29, 0.6)", backdropFilter: "blur(8px)" }} />
          
          <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
            <Dialog.Content style={{
              position: "relative", width: "100%", maxWidth: "600px", outline: "none",
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
                  {editTarget ? "Edit Coupon Settings" : "Create New Coupon"}
                </Dialog.Title>
                
                <Dialog.Close asChild>
                  <button type="button" style={{ color: "#9AAE9B", cursor: "pointer", background: "transparent", border: "none", fontSize: "18px", padding: "4px" }}>✕</button>
                </Dialog.Close>
              </div>
              
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Coupon Code *</label>
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))} required disabled={!!editTarget}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: editTarget ? "rgba(228,232,224,0.3)" : "rgba(255,255,255,0.8)", border: "1px solid #E4E8E0", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.1em", color: "#1A261D", outline: "none", transition: "all 0.2s", boxSizing: "border-box", opacity: editTarget ? 0.7 : 1 }}
                      onFocus={(e) => { if (!editTarget) e.currentTarget.style.borderColor = "#B88645"; }}
                      onBlur={(e) => { if (!editTarget) e.currentTarget.style.borderColor = "#E4E8E0"; }}
                      placeholder="e.g. SUMMER25" />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)} disabled={!!editTarget}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: editTarget ? "rgba(228,232,224,0.3)" : "rgba(255,255,255,0.8)", border: "1px solid #E4E8E0", fontSize: "13px", color: "#1A261D", outline: "none", cursor: editTarget ? "not-allowed" : "pointer", boxSizing: "border-box", opacity: editTarget ? 0.7 : 1 }}>
                      <option value="PERCENT">Percent %</option>
                      <option value="FIXED">Fixed ₹</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Discount *</label>
                    <input type="number" step="any" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} required disabled={!!editTarget}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: editTarget ? "rgba(228,232,224,0.3)" : "rgba(255,255,255,0.8)", border: "1px solid #E4E8E0", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s", boxSizing: "border-box", opacity: editTarget ? 0.7 : 1 }}
                      onFocus={(e) => { if (!editTarget) e.currentTarget.style.borderColor = "#B88645"; }}
                      onBlur={(e) => { if (!editTarget) e.currentTarget.style.borderColor = "#E4E8E0"; }}
                      placeholder={type === "PERCENT" ? "e.g. 20" : "e.g. 500"} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Max Uses</label>
                    <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", border: "1px solid #E4E8E0", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; }}
                      placeholder="e.g. 100" />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Expiry Date</label>
                    <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", border: "1px solid #E4E8E0", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; }} />
                  </div>
                </div>

                {!editTarget && (
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#5C7360", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Limit to Course</label>
                    <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", border: "1px solid #E4E8E0", fontSize: "13px", color: "#1A261D", outline: "none", transition: "all 0.2s", cursor: "pointer", boxSizing: "border-box" }}>
                      <option value="">None (Valid for all courses)</option>
                      {coursesData?.courses?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                )}

                {editTarget && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", padding: "16px", background: "#F4F6F3", borderRadius: "12px", border: "1px solid #E4E8E0" }}>
                    <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#B88645", cursor: "pointer" }} />
                    <label htmlFor="isActive" style={{ fontSize: "13px", fontWeight: 700, color: "#1A261D", cursor: "pointer", margin: 0 }}>Coupon is Active</label>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "20px", borderTop: "1px solid #E4E8E0" }}>
                  <Dialog.Close asChild>
                    <button type="button" onClick={resetForm} style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C7360", border: "1px solid #E4E8E0", background: "white", cursor: "pointer" }}>Cancel</button>
                  </Dialog.Close>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "white", background: "#1A261D", border: "none", cursor: (createMut.isPending || updateMut.isPending) ? "not-allowed" : "pointer", opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1, boxShadow: "0 4px 14px rgba(26, 38, 29, 0.3)" }}>
                    {createMut.isPending || updateMut.isPending ? "Saving..." : editTarget ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>

              </form>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

      <DataTable columns={columns} data={coupons} loading={isLoading} rowKey={(r) => r.id} emptyMessage="No discount coupons found" />

      {deleteTarget && (
        <ConfirmDialog open onOpenChange={() => setDeleteTarget(null)}
          title={`Delete ${deleteTarget.code}?`}
          description="This code will no longer be valid for future purchases. Existing enrollments using this code will not be affected."
          confirmLabel="Delete" danger loading={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleteTarget.id)} />
      )}
    </div>
  );
}
