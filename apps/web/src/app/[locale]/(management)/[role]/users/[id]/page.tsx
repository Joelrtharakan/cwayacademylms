"use client";

import { useManagementPath } from "@/hooks/useManagementPath";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ban, UserCheck, Mail, MapPin, Church, Globe, Calendar, Shield, MessageCircle, Phone } from "lucide-react";
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
  const basePath = useManagementPath();
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
      <div className="bg-white border border-cway-light-border shadow-sm" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <div className="bg-[#1A261D] text-white shadow-md" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontWeight: 700, fontSize: '32px', textTransform: 'uppercase', flexShrink: 0 }}>
          {user.name?.slice(0, 2) || "U"}
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <h1 className="font-serif font-bold text-[#1A261D]" style={{ fontSize: '28px', lineHeight: 1 }}>{user.name}</h1>
            <span className={`font-sans font-bold uppercase border ${roleBadge}`} style={{ fontSize: '11px', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: '999px' }}>
              {user.role}
            </span>
            {user.isBanned && (
              <span className="font-sans font-bold uppercase bg-cway-danger/10 text-cway-danger border border-cway-danger/20" style={{ fontSize: '11px', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: '999px' }}>
                BANNED
              </span>
            )}
          </div>
          <p className="font-sans font-medium text-cway-text-muted" style={{ fontSize: '15px', marginTop: '8px' }}>{user.email}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email || ''}`} target="_blank" rel="noopener noreferrer" className="font-sans font-bold uppercase transition-all border border-cway-light-border text-cway-text-muted hover:text-[#1A261D] hover:bg-cway-light-alt bg-white" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', fontSize: '12px', letterSpacing: '0.1em' }}>
            <Mail size={16} strokeWidth={2.5} /> Email
          </a>
          
          <button className="font-sans font-bold uppercase transition-all border border-cway-light-border text-cway-text-muted hover:text-[#1A261D] hover:bg-cway-light-alt bg-white" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', fontSize: '12px', letterSpacing: '0.1em' }} onClick={() => router.push(`${basePath}/messages?userId=${user.id}&name=${encodeURIComponent(user.name || '')}`)}>
            <MessageCircle size={16} strokeWidth={2.5} /> Message
          </button>
          
          <a href={`tel:${user.phone || ''}`} className="font-sans font-bold uppercase transition-all border border-cway-light-border text-cway-text-muted hover:text-[#1A261D] hover:bg-cway-light-alt bg-white" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', fontSize: '12px', letterSpacing: '0.1em' }}>
            <Phone size={16} strokeWidth={2.5} /> Call
          </a>

          {user.isBanned ? (
            <button onClick={() => setConfirmState("unban")}
              className="font-sans font-bold uppercase transition-all border border-cway-success/50 text-cway-success hover:bg-cway-success/10 bg-white" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', fontSize: '12px', letterSpacing: '0.1em' }}>
              <UserCheck size={16} strokeWidth={2.5} /> Unban
            </button>
          ) : (
            <button onClick={() => setConfirmState("ban")}
              className="font-sans font-bold uppercase transition-all border border-cway-danger/50 text-cway-danger hover:bg-cway-danger/10 bg-white" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', fontSize: '12px', letterSpacing: '0.1em' }}>
              <Ban size={16} strokeWidth={2.5} /> Ban User
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-cway-light-border [&::-webkit-scrollbar]:hidden" style={{ display: 'flex', gap: '24px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', marginTop: '32px', paddingLeft: '16px' }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="font-sans transition-all"
            style={{ 
              paddingBottom: '16px', 
              fontSize: '15px', 
              fontWeight: 700, 
              color: activeTab === tab ? '#C9973A' : '#8A9E8C', 
              position: 'relative' 
            }}>
            {tab}
            {activeTab === tab && (
              <span style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '3px', backgroundColor: '#C9973A', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-cway-light-border shadow-sm" style={{ borderRadius: '24px', padding: '40px', marginTop: '24px' }}>
        {activeTab === "Overview" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '48px' }}>
            
            {/* Left Col: Profile Details */}
            <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <h3 className="font-serif font-bold text-[#1A261D] border-b border-cway-light-border/60" style={{ fontSize: '22px', paddingBottom: '16px' }}>
                Profile Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { icon: <Mail size={20} strokeWidth={2} />, label: "Email Address", value: user.email },
                { icon: <Church size={20} strokeWidth={2} />, label: "Church", value: user.church || "—" },
                { icon: <MapPin size={20} strokeWidth={2} />, label: "Location", value: user.location || "—" },
                { icon: <Globe size={20} strokeWidth={2} />, label: "Language", value: user.preferredLanguage },
                { icon: <Calendar size={20} strokeWidth={2} />, label: "Joined", value: formatDate(user.createdAt) },
                { icon: <Shield size={20} strokeWidth={2} />, label: "Verified", value: user.isVerified ? "Yes ✓" : "No" },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="bg-[#F7F8F5] border border-cway-light-border text-cway-gold shadow-sm" style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="font-sans font-bold uppercase text-cway-text-muted/80" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>{item.label}</span>
                    <span className="font-sans font-semibold text-[#1A261D]" style={{ fontSize: '16px' }}>{item.value}</span>
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Right Col: Quick Stats */}
            <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <h3 className="font-serif font-bold text-[#1A261D] border-b border-cway-light-border/60" style={{ fontSize: '22px', paddingBottom: '16px' }}>
                Quick Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
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
                <div key={i} className="bg-[#F7F8F5] border border-cway-light-border/80 shadow-sm transition-all hover:shadow-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px', borderRadius: '20px', height: '140px' }}>
                  <span className="font-sans font-bold uppercase text-cway-text-muted" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '12px' }}>{stat.label}</span>
                  <span className="font-serif font-bold text-[#1A261D] leading-none" style={{ fontSize: '40px' }}>{stat.value}</span>
                </div>
              ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === "Enrollments" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="font-serif font-bold text-[#1A261D] border-b border-cway-light-border/60" style={{ fontSize: '22px', paddingBottom: '16px', marginBottom: '16px' }}>
              Course Enrollments
            </h3>
            {user.enrollments?.length === 0 ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No enrollments yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {user.enrollments?.map((e: any) => (
                  <div key={e.id} className="border-b border-cway-light-border/50 last:border-0" style={{ display: 'flex', alignItems: 'center', gap: '32px', paddingBottom: '24px', paddingTop: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="font-sans font-bold truncate text-[#1A261D]" style={{ fontSize: '17px', marginBottom: '4px' }}>{e.course?.title}</p>
                      <p className="font-sans text-cway-text-muted font-medium" style={{ fontSize: '14px' }}>Enrolled {formatDate(e.enrolledAt)}</p>
                    </div>
                    <div style={{ width: '200px', flexShrink: 0 }}>
                      <ProgressBar value={e.progress ?? 0} />
                    </div>
                    <span className="font-sans font-bold flex-shrink-0 uppercase"
                      style={{ fontSize: '12px', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: '999px', background: `${STATUS_COLOR[e.status] || "#8A9E8C"}15`, color: STATUS_COLOR[e.status] || "#8A9E8C", border: `1px solid ${STATUS_COLOR[e.status] || "#8A9E8C"}30` }}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Courses" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="font-serif font-bold text-[#1A261D] border-b border-cway-light-border/60" style={{ fontSize: '22px', paddingBottom: '16px', marginBottom: '16px' }}>
              Courses Created
            </h3>
            {!user.coursesCreated?.length ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No courses created</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {user.coursesCreated?.map((c: any) => (
                  <div key={c.id} className="border-b border-cway-light-border/50 last:border-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', paddingBottom: '24px', paddingTop: '8px' }}>
                    <span className="font-sans font-bold text-[#1A261D]" style={{ fontSize: '17px' }}>{c.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <span className="font-sans font-medium text-cway-text-muted bg-cway-light-bg border border-cway-light-border" style={{ fontSize: '14px', padding: '6px 16px', borderRadius: '999px' }}>{c._count?.enrollments ?? 0} students</span>
                      <span className="font-sans font-bold uppercase"
                        style={{ fontSize: '12px', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: '999px', background: `${STATUS_COLOR[c.status] || "#8A9E8C"}15`, color: STATUS_COLOR[c.status] || "#8A9E8C", border: `1px solid ${STATUS_COLOR[c.status] || "#8A9E8C"}30` }}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Payments" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="font-serif font-bold text-[#1A261D] border-b border-cway-light-border/60" style={{ fontSize: '22px', paddingBottom: '16px', marginBottom: '16px' }}>
              Payment History
            </h3>
            {!user.payments?.length ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No payments yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {user.payments?.map((p: any) => (
                  <div key={p.id} className="border-b border-cway-light-border/50 last:border-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', paddingBottom: '24px', paddingTop: '8px' }}>
                    <div>
                      <p className="font-sans font-bold text-[#1A261D]" style={{ fontSize: '17px', marginBottom: '4px' }}>{p.course?.title}</p>
                      <p className="font-sans text-cway-text-muted font-medium" style={{ fontSize: '14px' }}>{formatDate(p.createdAt)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <span className="font-serif font-bold text-cway-gold" style={{ fontSize: '20px' }}>₹{p.amount?.toLocaleString()}</span>
                      <span className="font-sans font-bold uppercase"
                        style={{ fontSize: '12px', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: '999px', background: `${STATUS_COLOR[p.status] || "#8A9E8C"}15`, color: STATUS_COLOR[p.status] || "#8A9E8C", border: `1px solid ${STATUS_COLOR[p.status] || "#8A9E8C"}30` }}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Certificates" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="font-serif font-bold text-[#1A261D] border-b border-cway-light-border/60" style={{ fontSize: '22px', paddingBottom: '16px', marginBottom: '16px' }}>
              Certificates Earned
            </h3>
            {!user.certificates?.length ? (
              <p className="font-sans text-[15px] text-center py-12 text-cway-text-muted font-medium">No certificates yet</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', paddingTop: '8px' }}>
                {user.certificates?.map((cert: any) => (
                  <div key={cert.id} className="bg-white border border-cway-light-border shadow-sm transition-all hover:shadow-md relative overflow-hidden" style={{ borderRadius: '20px', padding: '32px' }}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cway-gold/5 rounded-bl-full border-l border-b border-cway-gold/10"></div>
                    <p className="font-serif font-bold text-[#1A261D] relative z-10 leading-tight" style={{ fontSize: '20px', marginBottom: '16px' }}>{cert.course?.title}</p>
                    <p className="font-sans font-medium text-cway-text-muted" style={{ fontSize: '14px' }}>Issued: {formatDate(cert.issuedAt)}</p>
                    <p className="font-mono font-bold text-cway-gold tracking-widest" style={{ fontSize: '15px', marginTop: '12px' }}>{cert.uniqueCode}</p>
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
