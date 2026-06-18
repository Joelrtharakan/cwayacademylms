"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/store/auth.store";
import { useConfirm } from "@/components/shared/ConfirmContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { useRouter } from "next/navigation";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      const res = await api.get("/blog/posts");
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (slug: string) => {
    if (!(await confirm("Are you sure you want to delete this post?"))) return;
    try {
      await api.delete(`/blog/posts/${slug}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D" }}>
          {row.title}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        row.isPublished ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(61,122,75,0.08)",
              color: "#3D7A4B",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <CheckCircle size={14} /> Published
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(143,158,147,0.1)",
              color: "#8F9E93",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <XCircle size={14} /> Draft
          </span>
        ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span style={{ color: "#8F9E93", fontSize: "13px", fontWeight: 500 }}>
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageHeader title="Blog Posts" subtitle="Manage editorial content published on CWAY Academy" />
        <button
          onClick={() => router.push("/admin/blog/new")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#B88645",
            color: "#FFFFFF",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#A3753A";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#B88645";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Plus size={16} />
          <span>New Post</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
        rowKey={(row) => row.id}
        emptyMessage="No blog posts found. Create your first post!"
        actions={(row) => (
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={() => router.push(`/admin/blog/${row.slug}`)}
              title="Edit Post"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                color: "#8F9E93",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(184,134,69,0.08)";
                e.currentTarget.style.color = "#B88645";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#8F9E93";
              }}
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => deletePost(row.slug)}
              title="Delete Post"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                color: "#8F9E93",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(176,58,46,0.08)";
                e.currentTarget.style.color = "#B03A2E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#8F9E93";
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />
    </div>
  );
}
