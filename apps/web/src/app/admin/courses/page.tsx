"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle, XCircle, Star, StarOff, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getCourses, approveCourse, rejectCourse, featureCourse, deleteCourse } from "@/lib/api/admin";

const STATUS_TABS = ["All", "PENDING", "PUBLISHED", "DRAFT", "ARCHIVED"];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PUBLISHED: { bg: "rgba(61,122,75,0.08)", color: "#3D7A4B" },
  PENDING:   { bg: "rgba(184,134,69,0.08)", color: "#B88645" },
  DRAFT:     { bg: "rgba(143,158,147,0.08)", color: "#8F9E93" },
  ARCHIVED:  { bg: "rgba(176,58,46,0.08)", color: "#B03A2E" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: "11px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {status}
    </span>
  );
}

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusTab, setStatusTab] = useState("All");
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses", debouncedSearch, statusTab, page],
    queryFn: () => getCourses({
      search: debouncedSearch,
      status: statusTab === "All" ? undefined : statusTab,
      page,
      limit: 20,
    }),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveCourse(id),
    onSuccess: () => { toast.success("Course approved and published"); qc.invalidateQueries({ queryKey: ["admin-courses"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectCourse(id, reason),
    onSuccess: () => { toast.success("Course rejected"); qc.invalidateQueries({ queryKey: ["admin-courses"] }); setRejectModal(null); setRejectReason(""); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const featureMut = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => featureCourse(id, featured),
    onSuccess: (_, vars) => { toast.success(vars.featured ? "Course featured" : "Course unfeatured"); qc.invalidateQueries({ queryKey: ["admin-courses"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: ({ id, confirm }: { id: string; confirm?: boolean }) => deleteCourse(id, confirm),
    onSuccess: (data: any) => {
      if (data.status === "warning") { toast.warning(data.message); }
      else { toast.success("Course deleted"); qc.invalidateQueries({ queryKey: ["admin-courses"] }); setDeleteConfirm(null); }
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any).__ct);
    (window as any).__ct = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 350);
  };

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Course",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {row.thumbnail ? (
            <img src={row.thumbnail} alt="" style={{ width: "48px", height: "32px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div
              style={{
                width: "48px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "13px",
                background: "rgba(184,134,69,0.1)",
                color: "#B88645",
                flexShrink: 0,
              }}
            >
              {row.moduleNumber || "?"}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
              {row.title}
            </p>
            {row.moduleNumber && (
              <span
                style={{
                  display: "inline-block",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(184,134,69,0.08)",
                  color: "#B88645",
                  marginTop: "4px",
                }}
              >
                Module {row.moduleNumber}
              </span>
            )}
          </div>
        </div>
      ),
    },
    { key: "instructor", header: "Instructor", render: (row) => <span style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93" }}>{row.instructor?.name}</span> },
    { key: "category", header: "Category", render: (row) => <span style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93" }}>{row.category?.name || "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "enrollments", header: "Students", render: (row) => <span style={{ fontSize: "13px", fontWeight: 700, color: "#1A261D" }}>{row._count?.enrollments ?? 0}</span> },
    { key: "price", header: "Price", render: (row) => <span style={{ fontSize: "13px", fontWeight: 700, color: row.isFree ? "#3D7A4B" : "#1A261D" }}>{row.isFree ? "Free" : `₹${row.price}`}</span> },
  ];

  const actions = (row: any) => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <a
        href={`/courses/${row.slug}`}
        target="_blank"
        rel="noreferrer"
        title="Preview"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          color: "#8F9E93",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F7F8F5"; e.currentTarget.style.color = "#1A261D"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
      >
        <ExternalLink size={14} />
      </a>
      <button
        onClick={() => featureMut.mutate({ id: row.id, featured: !row.isFeatured })}
        title={row.isFeatured ? "Unfeature" : "Feature"}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          color: row.isFeatured ? "#B88645" : "#8F9E93",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.08)"; e.currentTarget.style.color = "#B88645"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = row.isFeatured ? "#B88645" : "#8F9E93"; }}
      >
        {row.isFeatured ? <Star size={14} fill="#B88645" /> : <StarOff size={14} />}
      </button>
      {row.status === "PENDING" && (
        <>
          <button
            onClick={() => approveMut.mutate(row.id)}
            title="Approve"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              color: "#8F9E93",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(61,122,75,0.08)"; e.currentTarget.style.color = "#3D7A4B"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
          >
            <CheckCircle size={14} />
          </button>
          <button
            onClick={() => { setRejectModal({ id: row.id, title: row.title }); setRejectReason(""); }}
            title="Reject"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              color: "#8F9E93",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.08)"; e.currentTarget.style.color = "#B03A2E"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
          >
            <XCircle size={14} />
          </button>
        </>
      )}
      <button
        onClick={() => setDeleteConfirm({ id: row.id, title: row.title })}
        title="Delete"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          color: "#8F9E93",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.08)"; e.currentTarget.style.color = "#B03A2E"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Courses" subtitle={`${data?.total ?? 0} courses on the platform`} />

      {/* Toolbar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E4E8E0",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", overflowX: "auto" }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusTab(tab); setPage(1); }}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                ...(statusTab === tab
                  ? { background: "#1A261D", color: "#FFFFFF" }
                  : { background: "transparent", color: "#8F9E93" }
                ),
              }}
              onMouseEnter={(e) => {
                if (statusTab !== tab) {
                  e.currentTarget.style.background = "#F7F8F5";
                  e.currentTarget.style.color = "#1A261D";
                }
              }}
              onMouseLeave={(e) => {
                if (statusTab !== tab) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#8F9E93";
                }
              }}
            >
              {tab === "All" ? "All Courses" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search
            size={14}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9AAE9B" }}
          />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              fontSize: "13.5px",
              fontWeight: 500,
              borderRadius: "10px",
              border: "1px solid #E4E8E0",
              background: "#F7F8F5",
              color: "#1A261D",
              outline: "none",
              transition: "all 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#B88645";
              e.target.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E4E8E0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.courses ?? []}
        loading={isLoading}
        pagination={data ? { page: data.page, pages: data.pages, total: data.total } : undefined}
        onPageChange={setPage}
        actions={actions}
        rowKey={(r) => r.id}
        emptyMessage="No courses found"
      />

      {/* Reject Modal */}
      {rejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(26,38,29,0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "#FFFFFF",
              borderRadius: "24px",
              boxShadow: "0 24px 48px rgba(26,38,29,0.15)",
              padding: "32px",
            }}
          >
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>
              Reject Course
            </h2>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#677E6A", margin: "0 0 24px 0" }}>
              "{rejectModal.title}"
            </p>
            
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9AAE9B", marginBottom: "8px" }}>
              Reason for rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Explain what needs to be revised..."
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "14px",
                fontWeight: 500,
                borderRadius: "12px",
                border: "1px solid #E4E8E0",
                background: "#F7F8F5",
                color: "#1A261D",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#B88645";
                e.target.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E4E8E0";
                e.target.style.boxShadow = "none";
              }}
            />
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setRejectModal(null)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: "1px solid #E4E8E0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1A261D",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => rejectModal && rejectReason && rejectMut.mutate({ id: rejectModal.id, reason: rejectReason })}
                disabled={!rejectReason || rejectMut.isPending}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#B03A2E",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  cursor: (!rejectReason || rejectMut.isPending) ? "not-allowed" : "pointer",
                  opacity: (!rejectReason || rejectMut.isPending) ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(176,58,46,0.25)",
                }}
              >
                {rejectMut.isPending ? "Rejecting..." : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmDialog
          open
          onOpenChange={() => setDeleteConfirm(null)}
          title={`Delete "${deleteConfirm.title}"?`}
          description="This will permanently delete the course, all its sections and lessons."
          confirmLabel="Delete Course"
          danger
          loading={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate({ id: deleteConfirm.id, confirm: true })}
        />
      )}
    </div>
  );
}
