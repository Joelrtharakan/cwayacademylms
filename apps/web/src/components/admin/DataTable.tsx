"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Inbox, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowKey: (row: T) => string;
  emptyMessage?: string;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (key: string, dir: "asc" | "desc") => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  rowKey,
  emptyMessage = "No data found",
  pagination,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  actions,
}: DataTableProps<T>) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4E8E0",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
        fontFamily: "var(--font-plus-jakarta), sans-serif",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  style={{
                    background: "#F7F8F5",
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#9AAE9B",
                    borderBottom: "1px solid #E4E8E0",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      if (sortKey === col.key) {
                        onSort(col.key, sortDir === "asc" ? "desc" : "asc");
                      } else {
                        onSort(col.key, "asc");
                      }
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th
                  style={{
                    background: "#F7F8F5",
                    padding: "16px 24px",
                    textAlign: "right",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#9AAE9B",
                    borderBottom: "1px solid #E4E8E0",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: "1px solid #F0F2ED" }}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} style={{ padding: "20px 24px" }}>
                      <div
                        style={{
                          height: "18px",
                          width: cIdx === 0 ? "40%" : cIdx === columns.length - 1 ? "60px" : "80%",
                          background: "#F0F2ED",
                          borderRadius: "4px",
                          animation: "pulse 1.5s ease-in-out infinite",
                          opacity: 0.7 + (rIdx * 0.05),
                        }}
                      />
                    </td>
                  ))}
                  {actions && <td style={{ padding: "20px 24px" }}></td>}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: "64px 24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "20px",
                        background: "#F7F8F5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9AAE9B",
                      }}
                    >
                      <Inbox size={28} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#9AAE9B", margin: 0 }}>
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  style={{ borderBottom: "1px solid #F0F2ED", transition: "background 0.15s" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "#FAFBF9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "18px 24px",
                        fontSize: "14px",
                        color: "#1A261D",
                        verticalAlign: "middle",
                      }}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {actions && (
                    <td
                      style={{
                        padding: "18px 24px",
                        verticalAlign: "middle",
                        textAlign: "right",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div
          style={{
            padding: "16px 24px",
            background: "#FFFFFF",
            borderTop: "1px solid #E4E8E0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#9AAE9B" }}>
            Showing page <span style={{ fontWeight: 700, color: "#1A261D" }}>{pagination.page}</span> of{" "}
            <span style={{ fontWeight: 700, color: "#1A261D" }}>{pagination.pages}</span> ({pagination.total} total)
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                opacity: pagination.page <= 1 ? 0.5 : 1,
                color: "#1A261D",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (pagination.page > 1) {
                  e.currentTarget.style.borderColor = "#B88645";
                  e.currentTarget.style.color = "#B88645";
                }
              }}
              onMouseLeave={(e) => {
                if (pagination.page > 1) {
                  e.currentTarget.style.borderColor = "#E4E8E0";
                  e.currentTarget.style.color = "#1A261D";
                }
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer",
                opacity: pagination.page >= pagination.pages ? 0.5 : 1,
                color: "#1A261D",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (pagination.page < pagination.pages) {
                  e.currentTarget.style.borderColor = "#B88645";
                  e.currentTarget.style.color = "#B88645";
                }
              }}
              onMouseLeave={(e) => {
                if (pagination.page < pagination.pages) {
                  e.currentTarget.style.borderColor = "#E4E8E0";
                  e.currentTarget.style.color = "#1A261D";
                }
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
