"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ban, UserCheck, Mail, MapPin, Church, Globe, Calendar, Shield } from "lucide-react";
import { toast } from "sonner";
import { getUserById, banUser, unbanUser } from "@/lib/api/admin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const TABS = ["Overview", "Enrollments", "Courses", "Payments", "Certificates"];

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-cway-light-alt border border-cway-light-border">
        <div className="h-full rounded-full bg-cway-gold shadow-sm" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="font-sans text-[12px] font-bold w-10 text-right flex-shrink-0 text-cway-text-muted">
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#4A8C5C", COMPLETED: "#C9973A", REFUNDED: "#8C3A3A",
  COMPLETED_P: "#4A8C5C", FAILED: "#8C3A3A", PENDING: "#C9973A",
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("Overview");
  const [confirmState, setConfirmState] = useState<"ban" | "unban" | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => getUserById(id),
  });

  const banMut = useMutation({
    mutationFn: () => banUser(id),
    onSuccess: () => { toast.success("User banned"); qc.invalidateQueries({ queryKey: ["admin-user", id] }); setConfirmState(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const unbanMut = useMutation({
    mutationFn: () => unbanUser(id),
    onSuccess: () => { toast.success("User unbanned"); qc.invalidateQueries({ queryKey: ["admin-user", id] }); setConfirmState(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cway-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <div className="font-sans text-center py-16 text-[15px] font-medium text-cway-text-muted">User not found</div>;

  const ROLE_BADGE: Record<string, string> = {
    ADMIN: "bg-indigo-100 text-indigo-700 border-indigo-200",
    INSTRUCTOR: "bg-cway-success/10 text-cway-success border-cway-success/20",
    STUDENT: "bg-cway-gold/10 text-cway-gold border-cway-gold/20",
  };
  const roleBadge = ROLE_BADGE[user.role] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 font-sans text-[13px] font-bold uppercase tracking-wider transition-colors text-cway-text-muted hover:text-[#1A261D]"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Users
      </button>

      {/* Header */}
      <div className="rounded-[20px] p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white border border-cway-light-border shadow-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-serif font-bold text-[32px] uppercase flex-shrink-0 bg-cway-gold text-white shadow-md">
          {user.name?.slice(0, 2) || "U"}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif font-bold text-[26px] text-[#1A261D] leading-none">{user.name}</h1>
            <span className={`font-sans text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${roleBadge}`}>
              {user.role}
            </span>
            {user.isBanned && (
              <span className="font-sans text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-cway-danger/10 text-cway-danger border border-cway-danger/20">
                BANNED
              </span>
            )}
          </div>
          <p className="font-sans text-[14px] mt-2 font-medium text-cway-text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.isBanned ? (
            <button onClick={() => setConfirmState("unban")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-success/50 text-cway-success hover:bg-cway-success/10 bg-white">
              <UserCheck size={16} strokeWidth={2.5} /> Unban
            </button>
          ) : (
            <button onClick={() => setConfirmState("ban")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-wider transition-all border border-cway-danger/50 text-cway-danger hover:bg-cway-danger/10 bg-white">
              <Ban size={16} strokeWidth={2.5} /> Ban User
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto border-b border-cway-light-border pb-1">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-sans text-[14px] font-bold transition-all relative ${
              activeTab === tab ? "text-cway-gold" : "text-cway-text-muted hover:text-[#1A261D]"
            }`}>
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-[-5px] left-0 right-0 h-1 bg-cway-gold rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="font-serif text-[20px] font-bold text-[#1A261D] border-b border-cway-light-border/60 pb-3">Profile Details</h3>
              <div className="space-y-4">
              {[
                { icon: <Mail size={16} />, label: "Email", value: user.email },
                { icon: <Church size={16} />, label: "Church", value: user.church || "—" },
                { icon: <MapPin size={16} />, label: "Location", value: user.location || "—" },
                { icon: <Globe size={16} />, label: "Language", value: user.preferredLanguage },
                { icon: <Calendar size={16} />, label: "Joined", value: formatDate(user.createdAt) },
                { icon: <Shield size={16} />, label: "Verified", value: user.isVerified ? "Yes ✓" : "No" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-cway-text-muted/60">{item.icon}</span>
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider w-24 flex-shrink-0 text-cway-text-muted">{item.label}</span>
                  <span className="font-sans text-[15px] font-semibold text-[#1A261D]">{item.value}</span>
                </div>
              ))}
              </div>
            </div>
            <div className="space-y-5">
              <h3 className="font-serif text-[20px] font-bold text-[#1A261D] border-b border-cway-light-border/60 pb-3">Quick Stats</h3>
              <div className="space-y-0.5">
              {[
                { label: "Courses Enrolled", value: user.enrollments?.length ?? 0 },
                { label: "Courses Completed", value: user.enrollments?.filter((e: any) => e.status === "COMPLETED").length ?? 0 },
                { label: "Total Spent", value: `₹${(user.payments?.reduce((s: number, p: any) => s + (p.status === "COMPLETED" ? p.amount : 0), 0) ?? 0).toLocaleString()}` },
                { label: "Certificates Earned", value: user.certificates?.length ?? 0 },
                ...(user.role === "INSTRUCTOR" ? [
                  { label: "Courses Created", value: user.coursesCreated?.length ?? 0 },
                  { label: "Payout Rate", value: `${user.payoutPercentage ?? 70}%` },
                ] : []),
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-cway-light-border/40 last:border-b-0">
                  <span className="font-sans text-[14px] font-medium text-cway-text-muted">{stat.label}</span>
                  <span className="font-serif font-bold text-[18px] text-cway-gold">{stat.value}</span>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Enrollments" && (
          <div className="space-y-4">
            <h3 className="font-serif text-[20px] font-bold text-[#1A261D] border-b border-cway-light-border/60 pb-3 mb-5">Course Enrollments</h3>
            {user.enrollments?.length === 0 ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No enrollments yet</p>
            ) : (
              user.enrollments?.map((e: any) => (
                <div key={e.id} className="flex items-center gap-6 py-4 border-b border-cway-light-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[15px] font-bold truncate text-[#1A261D]">{e.course?.title}</p>
                    <p className="font-sans text-[13px] mt-1 text-cway-text-muted font-medium">Enrolled {formatDate(e.enrolledAt)}</p>
                  </div>
                  <div className="w-40 flex-shrink-0"><ProgressBar value={e.progress ?? 0} /></div>
                  <span className="font-sans text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 uppercase tracking-wider"
                    style={{ background: `${STATUS_COLOR[e.status] || "#8A9E8C"}15`, color: STATUS_COLOR[e.status] || "#8A9E8C", border: `1px solid ${STATUS_COLOR[e.status] || "#8A9E8C"}30` }}>
                    {e.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Courses" && (
          <div className="space-y-4">
            <h3 className="font-serif text-[20px] font-bold text-[#1A261D] border-b border-cway-light-border/60 pb-3 mb-5">Courses Created</h3>
            {!user.coursesCreated?.length ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No courses created</p>
            ) : (
              user.coursesCreated?.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-4 border-b border-cway-light-border/50 last:border-0">
                  <span className="font-sans text-[15px] font-bold text-[#1A261D]">{c.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-sans text-[13px] font-medium text-cway-text-muted bg-cway-light-bg px-3 py-1 rounded-full border border-cway-light-border">{c._count?.enrollments ?? 0} students</span>
                    <span className="font-sans text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                      style={{ background: `${STATUS_COLOR[c.status] || "#8A9E8C"}15`, color: STATUS_COLOR[c.status] || "#8A9E8C", border: `1px solid ${STATUS_COLOR[c.status] || "#8A9E8C"}30` }}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="space-y-4">
            <h3 className="font-serif text-[20px] font-bold text-[#1A261D] border-b border-cway-light-border/60 pb-3 mb-5">Payment History</h3>
            {!user.payments?.length ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No payments yet</p>
            ) : (
              user.payments?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-4 border-b border-cway-light-border/50 last:border-0">
                  <div>
                    <p className="font-sans text-[15px] font-bold text-[#1A261D]">{p.course?.title}</p>
                    <p className="font-sans text-[13px] mt-1 text-cway-text-muted font-medium">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-serif font-bold text-[18px] text-cway-gold">₹{p.amount?.toLocaleString()}</span>
                    <span className="font-sans text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                      style={{ background: `${STATUS_COLOR[p.status] || "#8A9E8C"}15`, color: STATUS_COLOR[p.status] || "#8A9E8C", border: `1px solid ${STATUS_COLOR[p.status] || "#8A9E8C"}30` }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Certificates" && (
          <div className="space-y-4">
            <h3 className="font-serif text-[20px] font-bold text-[#1A261D] border-b border-cway-light-border/60 pb-3 mb-5">Certificates Earned</h3>
            {!user.certificates?.length ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No certificates yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {user.certificates?.map((cert: any) => (
                  <div key={cert.id} className="rounded-xl p-5 bg-white border border-cway-light-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-cway-gold/5 rounded-bl-full border-l border-b border-cway-gold/10"></div>
                    <p className="font-serif font-bold text-[18px] text-[#1A261D] mb-3 relative z-10 leading-tight">{cert.course?.title}</p>
                    <p className="font-sans text-[12px] font-medium text-cway-text-muted">Issued: {formatDate(cert.issuedAt)}</p>
                    <p className="font-mono text-[13px] font-bold mt-2 text-cway-gold tracking-widest">{cert.uniqueCode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Dialogs */}
      {confirmState === "ban" && (
        <ConfirmDialog open onOpenChange={() => setConfirmState(null)} title={`Ban ${user.name}?`}
          description="This will immediately invalidate all sessions for this user."
          confirmLabel="Ban User" danger loading={banMut.isPending} onConfirm={() => banMut.mutate()} />
      )}
      {confirmState === "unban" && (
        <ConfirmDialog open onOpenChange={() => setConfirmState(null)} title={`Unban ${user.name}?`}
          description="This user will regain full access to CWAY Academy."
          confirmLabel="Unban" loading={unbanMut.isPending} onConfirm={() => unbanMut.mutate()} />
      )}
    </div>
  );
}
