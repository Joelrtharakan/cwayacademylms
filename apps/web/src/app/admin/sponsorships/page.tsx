"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { getSponsorships, linkSponsorship, getUsers, getCourses } from "@/lib/api/admin";
import * as Dialog from "@radix-ui/react-dialog";

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

export default function AdminSponsorshipsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"UNLINKED" | "LINKED">("UNLINKED");
  const [page, setPage] = useState(1);
  const [linkTarget, setLinkTarget] = useState<any>(null);
  
  // Link Modal State
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sponsorships", tab, page],
    queryFn: () => getSponsorships({
      // We check if studentId is null/not-null. Our backend currently just takes 'status'.
      // For this UI, we assume "status" = COMPLETED means linked, PENDING means unlinked
      // Actually the schema has studentId. We'll filter client-side for simplicity if backend doesn't support it,
      // But let's fetch all and filter.
      page, limit: 100 // Fetch a larger chunk since backend filtering by linked isn't fully implemented in our initial controller
    }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin-users-search", studentSearch],
    queryFn: () => getUsers({ search: studentSearch, limit: 10 }),
    enabled: !!studentSearch && !!linkTarget,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-all"],
    queryFn: () => getCourses({ limit: 100 }),
    enabled: !!linkTarget,
  });

  const linkMut = useMutation({
    mutationFn: ({ id, studentId, courseId }: { id: string, studentId: string, courseId: string }) => 
      linkSponsorship(id, studentId, courseId),
    onSuccess: () => { 
      toast.success("Sponsorship linked successfully"); 
      qc.invalidateQueries({ queryKey: ["admin-sponsorships"] });
      setLinkTarget(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to link sponsorship"),
  });

  const sponsorships = data?.sponsorships || [];
  const filtered = sponsorships.filter((s: any) => tab === "LINKED" ? s.studentId !== null : s.studentId === null);

  const columns: Column<any>[] = [
    {
      key: "sponsor", header: "Sponsor",
      render: (row) => (
        <div>
          <p className="font-sans text-[14px] font-bold text-[#1A261D]">{row.sponsorName}</p>
          <p className="font-sans text-[12px] text-cway-text-muted mt-0.5">{row.sponsorEmail}</p>
        </div>
      )
    },
    { key: "amount", header: "Amount", render: (row) => <span className="font-serif font-bold text-[16px] text-cway-gold">₹{row.amount.toLocaleString()}</span> },
    { key: "message", header: "Message", render: (row) => <span className="text-cway-text-muted text-[13px] line-clamp-2 max-w-xs">{row.message || "—"}</span> },
    { key: "createdAt", header: "Date", render: (row) => <span className="text-cway-text-muted text-[13px]">{formatDate(row.createdAt)}</span> },
    ...(tab === "LINKED" ? [
      { key: "student", header: "Linked Student", render: (row: any) => <span className="text-[#1A261D] font-medium text-[13px]">{row.student?.name}</span> }
    ] : []),
    {
      key: "actions", header: "Actions",
      render: (row) => tab === "UNLINKED" ? (
        <button onClick={() => { setLinkTarget(row); setSelectedStudent(""); setSelectedCourse(""); setStudentSearch(""); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-sans text-[12px] font-bold uppercase tracking-wider bg-cway-gold/10 text-cway-gold hover:bg-cway-gold/20 border border-cway-gold/20 hover:border-cway-gold/40">
          <Link size={12} strokeWidth={2.5} /> Link to Student
        </button>
      ) : (
        <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-cway-success"><CheckCircle size={14} /> Linked</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsorships"
        subtitle="Manage donations and allocate them to student enrollments"
      />

      <div style={{ display: "flex", gap: "8px", background: "#F0F2ED", padding: "6px", borderRadius: "14px", width: "fit-content", marginBottom: "24px", border: "1px solid #E4E8E0" }}>
        {["UNLINKED", "LINKED"].map((t) => (
          <button key={t} onClick={() => setTab(t as any)}
            style={{ 
              padding: "12px 28px", 
              borderRadius: "10px", 
              fontSize: "12px", 
              fontWeight: 800, 
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "none",
              cursor: "pointer",
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "#B88645" : "#8F9E93",
              boxShadow: tab === t ? "0 4px 12px rgba(26, 38, 29, 0.05), 0 1px 2px rgba(26, 38, 29, 0.05)" : "none"
            }}>
            {t === "UNLINKED" ? "Unlinked Funds" : "Allocated Funds"}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} loading={isLoading} rowKey={(r) => r.id} emptyMessage={`No ${tab.toLowerCase()} sponsorships found`} />

      {/* Link Modal */}
      <Dialog.Root open={!!linkTarget} onOpenChange={(o) => !o && setLinkTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1A261D]/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-[20px] p-7 w-full max-w-lg shadow-xl bg-white border border-cway-light-border outline-none">
            
            <Dialog.Title className="font-serif font-bold text-[24px] mb-6 text-[#1A261D]">Allocate Sponsorship</Dialog.Title>
            
            <div className="rounded-xl p-5 mb-8 bg-cway-light-alt border border-cway-light-border/60">
              <p className="font-sans text-[11px] font-bold uppercase tracking-wider mb-2 text-cway-text-muted">Sponsor Details</p>
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-[16px] text-[#1A261D]">{linkTarget?.sponsorName}</span>
                <span className="font-serif font-bold text-[22px] text-cway-gold">₹{linkTarget?.amount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">1. Select Student</label>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cway-text-muted/60" />
                  <input type="text" placeholder="Search student by name or email..."
                    value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl font-sans text-[14px] bg-white border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] placeholder:text-cway-text-muted/60 transition-all outline-none shadow-sm" />
                </div>
                {usersData?.users && usersData.users.length > 0 && (
                  <div className="max-h-36 overflow-y-auto rounded-xl border border-cway-light-border bg-white shadow-sm mt-1">
                    {usersData.users.map((u: any) => (
                      <button key={u.id} onClick={() => { setSelectedStudent(u.id); setStudentSearch(u.name); }}
                        className={`w-full text-left px-4 py-3 text-[14px] font-sans transition-colors border-b border-cway-light-border/50 last:border-b-0 ${
                          selectedStudent === u.id ? "bg-cway-gold/10 text-[#1A261D] font-bold" : "text-[#1A261D] hover:bg-cway-light-alt"
                        }`}>
                        {u.name} <span className="text-[12px] text-cway-text-muted font-normal ml-1">({u.email})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">2. Select Course to Unlock</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-white border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none cursor-pointer shadow-sm">
                  <option value="">Select a course...</option>
                  {coursesData?.courses?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title} (₹{c.price})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-2">
              <Dialog.Close asChild>
                <button className="px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-light-border bg-white text-cway-text-muted shadow-sm hover:border-cway-gold hover:text-cway-gold">Cancel</button>
              </Dialog.Close>
              <button 
                onClick={() => linkMut.mutate({ id: linkTarget.id, studentId: selectedStudent, courseId: selectedCourse })}
                disabled={!selectedStudent || !selectedCourse || linkMut.isPending}
                className="px-6 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent disabled:opacity-60 disabled:cursor-not-allowed">
                {linkMut.isPending ? "Allocating..." : "Allocate & Enroll Student"}
              </button>
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
