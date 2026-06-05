"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from "@/lib/api/admin";

const ICON_OPTIONS = ["📖", "🙏", "✝️", "🎵", "🌍", "👨‍👩‍👧", "📜", "🕊️", "🏛️", "🌱", "⚡", "💡"];

interface CategoryFormData {
  name: string;
  slug: string;
  icon: string;
  parentId: string;
}

const inputStyle: React.CSSProperties = {
  background: "#F7F8F5",
  border: "1px solid #E4E8E0",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#1A261D",
  outline: "none",
  width: "100%",
  transition: "all 0.15s",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "#9AAE9B",
  marginBottom: "8px",
};

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<CategoryFormData>({ name: "", slug: "", icon: "📖", parentId: "" });
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
  });

  const createMut = useMutation({
    mutationFn: (d: CategoryFormData) => createCategory(d),
    onSuccess: () => { toast.success("Category created"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) => updateCategory(id, data),
    onSuccess: () => { toast.success("Category updated"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => { toast.success("Category deleted"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const reorderMut = useMutation({
    mutationFn: (ids: string[]) => reorderCategories(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ name: "", slug: "", icon: "📖", parentId: "" }); };

  const openEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || "📖", parentId: cat.parentId || "" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    const autoSlug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const data: any = { ...form, slug: autoSlug };
    if (!data.parentId) delete data.parentId;
    editId ? updateMut.mutate({ id: editId, data }) : createMut.mutate(data);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...(categories as any[])];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOver(null);
    reorderMut.mutate(reordered.map((c: any) => c.id));
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organize courses into theological and ministry-focused categories"
        actions={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "12px",
              background: "#B88645",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: "0 4px 12px rgba(184,134,69,0.25)",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(184,134,69,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(184,134,69,0.25)";
            }}
          >
            <Plus size={15} /> New Category
          </button>
        }
      />

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E4E8E0",
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "32px",
            boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
          }}
        >
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#1A261D", margin: "0 0 24px 0" }}>
            {editId ? "Edit Category" : "New Category"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. New Testament Studies"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#B88645"; e.target.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E4E8E0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated-if-empty"
                  style={{ ...inputStyle, fontFamily: "monospace" }}
                  onFocus={(e) => { e.target.style.borderColor = "#B88645"; e.target.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E4E8E0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Icon</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                        cursor: "pointer",
                        background: form.icon === icon ? "rgba(184,134,69,0.1)" : "#F7F8F5",
                        border: `1.5px solid ${form.icon === icon ? "#B88645" : "#E4E8E0"}`,
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer", WebkitAppearance: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <option value="">None (Top-level)</option>
                  {(categories as any[]).filter((c: any) => c.id !== editId).map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: "1px solid #E4E8E0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1A261D",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.color = "#B88645"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.color = "#1A261D"; }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#B88645",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  cursor: (createMut.isPending || updateMut.isPending) ? "not-allowed" : "pointer",
                  opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(184,134,69,0.25)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!(createMut.isPending || updateMut.isPending)) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(184,134,69,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(createMut.isPending || updateMut.isPending)) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(184,134,69,0.25)";
                  }
                }}
              >
                {createMut.isPending || updateMut.isPending ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Tree */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E4E8E0",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
        }}
      >
        <div
          style={{
            background: "#F7F8F5",
            borderBottom: "1px solid #E4E8E0",
            padding: "16px 24px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#9AAE9B",
          }}
        >
          Drag to reorder · {(categories as any[]).length} categories
        </div>

        {isLoading ? (
          <div style={{ padding: "64px 24px", textAlign: "center", color: "#9AAE9B", fontSize: "14px", fontWeight: 500 }}>
            Loading...
          </div>
        ) : (categories as any[]).length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center", color: "#9AAE9B", fontSize: "14px", fontWeight: 500 }}>
            No categories yet. Create your first one.
          </div>
        ) : (
          <div>
            {(categories as any[]).map((cat: any, idx: number) => (
              <div key={cat.id}>
                <div
                  draggable
                  onDragStart={() => (dragItem.current = idx)}
                  onDragEnter={() => { dragOverItem.current = idx; setDragOver(cat.id); }}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 24px",
                    borderBottom: "1px solid #F0F2ED",
                    cursor: "grab",
                    transition: "background 0.15s",
                    background: dragOver === cat.id ? "#FAFBF9" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (dragOver !== cat.id) (e.currentTarget as HTMLDivElement).style.background = "#FAFBF9"; }}
                  onMouseLeave={(e) => { if (dragOver !== cat.id) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <GripVertical size={16} style={{ color: "#C8D0C6", flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: "20px",
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      background: "#F7F8F5",
                      border: "1px solid #E4E8E0",
                      flexShrink: 0,
                    }}
                  >
                    {cat.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#1A261D" }}>{cat.name}</span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "#F7F8F5",
                          color: "#8F9E93",
                          border: "1px solid #E4E8E0",
                        }}
                      >
                        /{cat.slug}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#8F9E93" }}>
                        {cat._count?.courses ?? 0} courses
                      </span>
                      {cat.children?.length > 0 && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: "rgba(184,134,69,0.08)",
                            color: "#B88645",
                          }}
                        >
                          {cat.children.length} subcategories
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      onClick={() => openEdit(cat)}
                      title="Edit"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                        background: "transparent",
                        border: "none",
                        color: "#8F9E93",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.08)"; e.currentTarget.style.color = "#B88645"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                      title="Delete"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                        background: "transparent",
                        border: "none",
                        color: "#8F9E93",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.08)"; e.currentTarget.style.color = "#B03A2E"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {cat.children?.map((child: any) => (
                  <div
                    key={child.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "12px 24px 12px 64px",
                      borderBottom: "1px solid #F0F2ED",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#FAFBF9"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <ChevronRight size={14} style={{ color: "#C8D0C6", flexShrink: 0 }} />
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{child.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D" }}>{child.name}</span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "11px",
                            fontWeight: 500,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "#F7F8F5",
                            color: "#8F9E93",
                            border: "1px solid #E4E8E0",
                          }}
                        >
                          /{child.slug}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#8F9E93", marginLeft: "4px" }}>
                          {child._count?.courses ?? 0} courses
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <button
                        onClick={() => openEdit(child)}
                        title="Edit"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                          background: "transparent",
                          border: "none",
                          color: "#8F9E93",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.08)"; e.currentTarget.style.color = "#B88645"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: child.id, name: child.name })}
                        title="Delete"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                          background: "transparent",
                          border: "none",
                          color: "#8F9E93",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.08)"; e.currentTarget.style.color = "#B03A2E"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          open
          onOpenChange={() => setDeleteTarget(null)}
          title={`Delete "${deleteTarget.name}"?`}
          description="Courses will not be deleted but will be unlinked from this category."
          confirmLabel="Delete"
          danger
          loading={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        />
      )}
    </div>
  );
}
