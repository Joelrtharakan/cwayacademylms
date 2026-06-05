"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search, Download, MoreVertical, Shield, Trash2, Eye, Ban, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getUsers, banUser, unbanUser, deleteUser, impersonateUser, exportUsersCSV } from "@/lib/api/admin";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:      { bg: "rgba(60,52,137,0.08)", color: "#3c3489" },
  INSTRUCTOR: { bg: "rgba(61,122,75,0.08)", color: "#3D7A4B" },
  STUDENT:    { bg: "rgba(184,134,69,0.08)", color: "#B88645" },
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_COLORS[role] || { bg: "rgba(143,158,147,0.1)", color: "#8F9E93" };
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: "10px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {role}
    </span>
  );
}

function StatusBadge({ user }: { user: any }) {
  if (user.isBanned)
    return (
      <span
        style={{
          background: "rgba(176,58,46,0.08)",
          color: "#B03A2E",
          fontSize: "11px",
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: "999px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Banned
      </span>
    );
  if (!user.isVerified)
    return (
      <span
        style={{
          background: "rgba(196,125,17,0.08)",
          color: "#C47D11",
          fontSize: "11px",
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: "999px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Unverified
      </span>
    );
  return (
    <span
      style={{
        background: "rgba(61,122,75,0.08)",
        color: "#3D7A4B",
        fontSize: "11px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      Active
    </span>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

export default function AdminUsersPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [confirmState, setConfirmState] = useState<{
    type: "ban" | "unban" | "delete";
    user: any;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch, roleFilter, statusFilter, page, sortBy, sortOrder],
    queryFn: () => getUsers({ search: debouncedSearch, role: roleFilter, status: statusFilter, page, limit: 20, sortBy, sortOrder }),
  });

  const banMut = useMutation({
    mutationFn: (id: string) => banUser(id),
    onSuccess: () => { toast.success("User banned"); qc.invalidateQueries({ queryKey: ["admin-users"] }); setConfirmState(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to ban user"),
  });

  const unbanMut = useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: () => { toast.success("User unbanned"); qc.invalidateQueries({ queryKey: ["admin-users"] }); setConfirmState(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to unban user"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); setConfirmState(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete user"),
  });

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 350);
  }, []);

  const handleSort = (key: string, dir: "asc" | "desc") => { setSortBy(key); setSortOrder(dir); setPage(1); };

  const columns: Column<any>[] = [
    {
      key: "user",
      header: "User",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#1A261D",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {row.name?.slice(0, 2) || "U"}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0 }}>{row.name}</p>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0" }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", sortable: true, render: (row) => <RoleBadge role={row.role} /> },
    { key: "church", header: "Church", render: (row) => <span style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93" }}>{row.church || "—"}</span> },
    { key: "location", header: "Location", render: (row) => <span style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93" }}>{row.location || "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge user={row} /> },
    { key: "createdAt", header: "Joined", sortable: true, render: (row) => <span style={{ fontSize: "13px", fontWeight: 500, color: "#8F9E93" }}>{formatDate(row.createdAt)}</span> },
  ];

  const actions = (row: any) => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            color: "#8F9E93",
            border: "1px solid transparent",
            background: "transparent",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F7F8F5";
            e.currentTarget.style.borderColor = "#E8EBE4";
            e.currentTarget.style.color = "#1A261D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.color = "#8F9E93";
          }}
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8EBE4",
            borderRadius: "12px",
            padding: "8px",
            boxShadow: "0 10px 40px rgba(26,38,29,0.12)",
            minWidth: "200px",
            zIndex: 50,
          }}
        >
          {[
            { label: "View Profile", icon: <Eye size={14} />, onClick: () => router.push(`/admin/users/${row.id}`) },
            {
              label: row.isBanned ? "Unban User" : "Ban User",
              icon: row.isBanned ? <UserCheck size={14} /> : <Ban size={14} />,
              onClick: () => setConfirmState({ type: row.isBanned ? "unban" : "ban", user: row }),
              danger: !row.isBanned,
            },
            {
              label: "Impersonate",
              icon: <Shield size={14} />,
              onClick: async () => {
                try {
                  const { impersonateToken } = await impersonateUser(row.id);
                  window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/impersonate/${impersonateToken}`, "_blank");
                } catch { toast.error("Impersonation failed"); }
              },
            },
            { label: "Delete User", icon: <Trash2 size={14} />, onClick: () => setConfirmState({ type: "delete", user: row }), danger: true },
          ].map((item, i) => (
            <DropdownMenu.Item key={i} asChild>
              <button
                onClick={item.onClick}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  transition: "background 0.15s",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: item.danger ? "#B03A2E" : "#1A261D",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = item.danger ? "rgba(176,58,46,0.06)" : "#F7F8F5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.icon}
                {item.label}
              </button>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${data?.total ?? 0} total registered users`}
        actions={
          <button
            onClick={() => exportUsersCSV({ search: debouncedSearch, role: roleFilter, status: statusFilter })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "1px solid #E8EBE4",
              color: "#526658",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: "0 1px 3px rgba(26,38,29,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#B88645";
              e.currentTarget.style.color = "#B88645";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E8EBE4";
              e.currentTarget.style.color = "#526658";
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        }
      />

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
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search
            size={15}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9AAE9B" }}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
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
        {[
          {
            value: roleFilter,
            setter: (v: string) => { setRoleFilter(v); setPage(1); },
            options: [["", "All Roles"], ["ADMIN", "Admin"], ["INSTRUCTOR", "Instructor"], ["STUDENT", "Student"]],
          },
          {
            value: statusFilter,
            setter: (v: string) => { setStatusFilter(v); setPage(1); },
            options: [["", "All Status"], ["active", "Active"], ["banned", "Banned"], ["unverified", "Unverified"]],
          },
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.value}
            onChange={(e) => sel.setter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 500,
              border: "1px solid #E4E8E0",
              background: "#F7F8F5",
              color: "#1A261D",
              outline: "none",
              cursor: "pointer",
              minWidth: "140px",
              transition: "all 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#B88645";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E4E8E0";
            }}
          >
            {sel.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.users ?? []}
        loading={isLoading}
        pagination={data ? { page: data.page, pages: data.pages, total: data.total } : undefined}
        onPageChange={setPage}
        onSort={handleSort}
        sortKey={sortBy}
        sortDir={sortOrder}
        actions={actions}
        rowKey={(row) => row.id}
        emptyMessage="No users found matching your filters"
      />

      {/* Confirm Dialogs */}
      {confirmState?.type === "ban" && (
        <ConfirmDialog
          open={true}
          onOpenChange={() => setConfirmState(null)}
          title={`Ban ${confirmState.user.name}?`}
          description="This will immediately terminate all active sessions for this user. They will not be able to log in until unbanned."
          confirmLabel="Ban User"
          danger
          loading={banMut.isPending}
          onConfirm={() => banMut.mutate(confirmState.user.id)}
        />
      )}
      {confirmState?.type === "unban" && (
        <ConfirmDialog
          open={true}
          onOpenChange={() => setConfirmState(null)}
          title={`Unban ${confirmState.user.name}?`}
          description="This user will regain full access to CWAY Academy."
          confirmLabel="Unban User"
          loading={unbanMut.isPending}
          onConfirm={() => unbanMut.mutate(confirmState.user.id)}
        />
      )}
      {confirmState?.type === "delete" && (
        <ConfirmDialog
          open={true}
          onOpenChange={() => setConfirmState(null)}
          title={`Delete ${confirmState.user.name}?`}
          description="This action is permanent and cannot be undone. The user's account, messages, and notifications will be deleted."
          confirmLabel="Permanently Delete"
          danger
          loading={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(confirmState.user.id)}
        />
      )}
    </div>
  );
}
