"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getCourses } from "@/lib/api/admin";

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
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent">
            <Plus size={15} strokeWidth={2.5} /> New Coupon
          </button>
        }
      />

      {showForm && (
        <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
          <h2 className="font-serif font-bold mb-6 text-[20px] text-[#1A261D]">{editTarget ? "Edit Coupon Settings" : "Create New Coupon"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Coupon Code *</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))} required disabled={!!editTarget}
                className="w-full px-4 py-3 rounded-xl font-mono text-[14px] tracking-wider bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] disabled:opacity-50 disabled:bg-cway-light-alt transition-all outline-none"
                placeholder="e.g. SUMMER25" />
            </div>

            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} disabled={!!editTarget}
                  className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] disabled:opacity-50 disabled:bg-cway-light-alt transition-all outline-none cursor-pointer">
                  <option value="PERCENT">Percent %</option>
                  <option value="FIXED">Fixed ₹</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Discount *</label>
                <input type="number" step="any" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} required disabled={!!editTarget}
                  className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] disabled:opacity-50 disabled:bg-cway-light-alt transition-all outline-none"
                  placeholder={type === "PERCENT" ? "e.g. 20" : "e.g. 500"} />
              </div>
            </div>

            <div>
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Max Uses</label>
              <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none"
                placeholder="e.g. 100" />
            </div>

            <div>
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Expiry Date</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none" />
            </div>

            {!editTarget && (
              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">Limit to Course</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none cursor-pointer">
                  <option value="">None (Valid for all courses)</option>
                  {coursesData?.courses?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            )}

            {editTarget && (
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-5 h-5 accent-cway-gold cursor-pointer" />
                <label htmlFor="isActive" className="font-sans text-[14px] text-[#1A261D] cursor-pointer font-medium">Coupon is Active</label>
              </div>
            )}

            <div className="col-span-full flex justify-end gap-3 mt-4">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-light-border bg-white text-cway-text-muted shadow-sm hover:border-cway-gold hover:text-cway-gold">Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                className="px-6 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent disabled:opacity-60 disabled:cursor-not-allowed">
                {createMut.isPending || updateMut.isPending ? "Saving..." : editTarget ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>

          </form>
        </div>
      )}

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
