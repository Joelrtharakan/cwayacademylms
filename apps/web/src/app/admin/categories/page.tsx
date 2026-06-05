"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, ChevronRight, Layers } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from "@/lib/api/admin";

const ICON_OPTIONS = ["📖", "🙏", "✝️", "🎵", "🌍", "👨‍👩‍👧", "📜", "🕊️", "🏛️", "🌱", "⚡", "💡", "🧠", "🔥", "⛪"];

interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string;
}

const inputStyle: React.CSSProperties = {
  background: "#F9FAF8",
  border: "1.5px solid #E4E8E0",
  borderRadius: "10px",
  padding: "14px 16px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#1A261D",
  outline: "none",
  width: "100%",
  transition: "all 0.2s ease-in-out",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#5C7360",
  marginBottom: "8px",
};

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<CategoryFormData>({ name: "", slug: "", parentId: "" });
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
  });

  const createMut = useMutation({
    mutationFn: (d: CategoryFormData) => createCategory(d),
    onSuccess: () => { toast.success("Category created successfully"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create category"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) => updateCategory(id, data),
    onSuccess: () => { toast.success("Category updated successfully"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); resetForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to update category"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => { toast.success("Category deleted successfully"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete category"),
  });

  const reorderMut = useMutation({
    mutationFn: (ids: string[]) => reorderCategories(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ name: "", slug: "", parentId: "" }); };

  const openEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || "" });
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div style={{ flex: 1 }}>
          <PageHeader
            title="Course Categories"
            subtitle="Structure your theological curriculum intuitively with nested categories"
          />
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              background: "#B88645",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 15px rgba(184, 134, 69, 0.3)",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(184, 134, 69, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(184, 134, 69, 0.3)";
            }}
          >
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      {/* Modern Glassmorphic Form */}
      {showForm && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(228, 232, 224, 0.8)",
            borderRadius: "16px",
            padding: "40px",
            marginBottom: "40px",
            boxShadow: "0 10px 40px rgba(26, 38, 29, 0.05)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Subtle Decorative Gradient */}
          <div style={{
            position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px",
            background: "radial-gradient(circle, rgba(184,134,69,0.1) 0%, rgba(255,255,255,0) 70%)",
            borderRadius: "50%", pointerEvents: "none"
          }} />

          <h2 style={{ 
            fontFamily: "'Cormorant Garamond', Georgia, serif", 
            fontSize: "28px", 
            fontWeight: 700, 
            color: "#1A261D", 
            margin: "0 0 8px 0" 
          }}>
            {editId ? "Edit Category Details" : "Create New Category"}
          </h2>
          <p style={{ color: "#8F9E93", fontSize: "14px", marginBottom: "32px" }}>
            {editId ? "Update the information below to modify this category." : "Fill out the details below to add a new category to your catalog."}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
              <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                <div>
                  <label style={labelStyle}>Category Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Apologetics & Philosophy"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "#B88645"; e.target.style.boxShadow = "0 0 0 4px rgba(184,134,69,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E4E8E0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>URL Slug (Optional)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="Auto-generated if left blank"
                    style={{ ...inputStyle, fontFamily: "monospace", fontSize: "13px" }}
                    onFocus={(e) => { e.target.style.borderColor = "#B88645"; e.target.style.boxShadow = "0 0 0 4px rgba(184,134,69,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E4E8E0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Parent Category Hierarchy</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238F9E93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(184,134,69,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <option value="">— Top Level Category (No Parent) —</option>
                  {(categories as any[]).filter((c: any) => c.id !== editId).map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", paddingTop: "16px", borderTop: "1px solid #F0F2ED" }}>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "14px 28px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: "1.5px solid #E4E8E0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#5C7360",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAF8"; e.currentTarget.style.color = "#1A261D"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5C7360"; }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                style={{
                  padding: "14px 32px",
                  borderRadius: "10px",
                  background: "#1A261D",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  cursor: (createMut.isPending || updateMut.isPending) ? "not-allowed" : "pointer",
                  opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(26, 38, 29, 0.2)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!(createMut.isPending || updateMut.isPending)) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(26, 38, 29, 0.3)";
                    e.currentTarget.style.background = "#2C4A3B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(createMut.isPending || updateMut.isPending)) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 38, 29, 0.2)";
                    e.currentTarget.style.background = "#1A261D";
                  }
                }}
              >
                {createMut.isPending || updateMut.isPending ? "Saving..." : editId ? "Save Changes" : "Publish Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modern Category Tree List */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E4E8E0",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            background: "#FAFBFA",
            borderBottom: "1px solid #E4E8E0",
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={18} color="#8F9E93" />
            <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5C7360" }}>
              Curriculum Hierarchy
            </span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#8F9E93", background: "#F0F2ED", padding: "4px 12px", borderRadius: "999px" }}>
            Drag handle to reorder · {(categories as any[]).length} Total
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: "80px 24px", textAlign: "center" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #E4E8E0", borderTopColor: "#B88645", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#8F9E93", fontSize: "14px", fontWeight: 500, margin: 0 }}>Loading categories...</p>
          </div>
        ) : (categories as any[]).length === 0 ? (
          <div style={{ padding: "100px 24px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "#F9FAF8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Layers size={32} color="#C8D0C6" />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#1A261D" }}>No Categories Found</h3>
            <p style={{ color: "#8F9E93", fontSize: "14px", maxWidth: "300px", margin: "0 auto" }}>Get started by creating your first theological category above.</p>
          </div>
        ) : (
          <div style={{ padding: "16px" }}>
            {(categories as any[]).map((cat: any, idx: number) => (
              <div key={cat.id} style={{ marginBottom: "8px" }}>
                <div
                  draggable
                  onDragStart={() => (dragItem.current = idx)}
                  onDragEnter={() => { dragOverItem.current = idx; setDragOver(cat.id); }}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "20px 24px",
                    borderRadius: "12px",
                    cursor: "grab",
                    transition: "all 0.2s",
                    background: dragOver === cat.id ? "#F9FAF8" : "#FFFFFF",
                    border: dragOver === cat.id ? "1px dashed #B88645" : "1px solid #F0F2ED",
                    boxShadow: dragOver === cat.id ? "0 4px 12px rgba(184,134,69,0.1)" : "none"
                  }}
                  onMouseEnter={(e) => { if (dragOver !== cat.id) { (e.currentTarget as HTMLDivElement).style.background = "#FAFBFA"; (e.currentTarget as HTMLDivElement).style.borderColor = "#E4E8E0"; } }}
                  onMouseLeave={(e) => { if (dragOver !== cat.id) { (e.currentTarget as HTMLDivElement).style.background = "#FFFFFF"; (e.currentTarget as HTMLDivElement).style.borderColor = "#F0F2ED"; } }}
                >
                  <div style={{ padding: "8px", background: "#F0F2ED", borderRadius: "8px", color: "#8F9E93" }}>
                    <GripVertical size={16} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "18px", fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, color: "#1A261D", lineHeight: "1" }}>
                        {cat.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "rgba(184, 134, 69, 0.08)",
                          color: "#B88645",
                          border: "1px solid rgba(184, 134, 69, 0.2)",
                          lineHeight: "1"
                        }}
                      >
                        /{cat.slug}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8F9E93" }} />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#5C7360" }}>
                          {cat._count?.courses ?? 0} Associated Courses
                        </span>
                      </div>
                      
                      {cat.children?.length > 0 && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: "#E4E8E0",
                            color: "#5C7360",
                          }}
                        >
                          {cat.children.length} Subcategories
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.8 }}>
                    <button
                      onClick={() => openEdit(cat)}
                      title="Edit Category"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        background: "#F9FAF8",
                        border: "1px solid #E4E8E0",
                        color: "#5C7360",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.1)"; e.currentTarget.style.color = "#B88645"; e.currentTarget.style.borderColor = "rgba(184,134,69,0.3)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#F9FAF8"; e.currentTarget.style.color = "#5C7360"; e.currentTarget.style.borderColor = "#E4E8E0"; }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                      title="Delete Category"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        background: "#F9FAF8",
                        border: "1px solid #E4E8E0",
                        color: "#5C7360",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.1)"; e.currentTarget.style.color = "#B03A2E"; e.currentTarget.style.borderColor = "rgba(176,58,46,0.3)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#F9FAF8"; e.currentTarget.style.color = "#5C7360"; e.currentTarget.style.borderColor = "#E4E8E0"; }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {cat.children?.length > 0 && (
                  <div style={{ marginLeft: "48px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                    {/* Connecting Line */}
                    <div style={{ position: "absolute", left: "-24px", top: 0, bottom: "24px", width: "2px", background: "#E4E8E0", borderRadius: "2px" }} />
                    
                    {cat.children.map((child: any) => (
                      <div
                        key={child.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "16px 20px",
                          borderRadius: "10px",
                          background: "#FAFBFA",
                          border: "1px solid #F0F2ED",
                          position: "relative",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#FFFFFF"; (e.currentTarget as HTMLDivElement).style.borderColor = "#E4E8E0"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#FAFBFA"; (e.currentTarget as HTMLDivElement).style.borderColor = "#F0F2ED"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                      >
                        {/* Horizontal Line connector */}
                        <div style={{ position: "absolute", left: "-24px", top: "50%", width: "24px", height: "2px", background: "#E4E8E0" }} />
                        
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "15px", fontWeight: 600, color: "#1A261D", lineHeight: "1" }}>{child.name}</span>
                            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#8F9E93", background: "#F0F2ED", padding: "2px 6px", borderRadius: "4px", lineHeight: "1" }}>
                              /{child.slug}
                            </span>
                            <span style={{ fontSize: "12px", fontWeight: 500, color: "#5C7360", marginLeft: "auto" }}>
                              {child._count?.courses ?? 0} courses
                            </span>
                          </div>
                        </div>

                        {/* Child Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button
                            onClick={() => openEdit(child)}
                            style={{
                              width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                              background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.1)"; e.currentTarget.style.color = "#B88645"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: child.id, name: child.name })}
                            style={{
                              width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                              background: "transparent", border: "none", color: "#8F9E93", cursor: "pointer", transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.1)"; e.currentTarget.style.color = "#B03A2E"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9E93"; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
          confirmLabel="Delete Category"
          danger
          loading={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        />
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
