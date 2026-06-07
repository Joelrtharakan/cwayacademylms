"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Save, Upload, BookOpen } from "lucide-react";
import Link from "next/link";
import { getCourseById, updateCourse, uploadThumbnail } from "@/lib/api/instructor";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

// ── Shared UI Components ───────────────────────────────────────────────────
function Input({ label, error, ...props }: any) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <input {...props} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#F87171" : "rgba(201,151,58,0.25)"}`, borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", ...props.style }}
        onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = error ? "#F87171" : "rgba(201,151,58,0.25)"} />
      {error && <p style={{ color: "#F87171", fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function Textarea({ label, error, ...props }: any) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <textarea {...props} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#F87171" : "rgba(201,151,58,0.25)"}`, borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 120, ...props.style }}
        onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = error ? "#F87171" : "rgba(201,151,58,0.25)"} />
      {error && <p style={{ color: "#F87171", fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function EditCoursePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id),
  });

  const form = useForm({
    defaultValues: {
      title: "", subtitle: "", description: "", categoryId: "", level: "", language: "",
      moduleNumber: "", weeksDuration: "", totalLectures: "", scriptureRef: "", price: "", currency: "INR"
    }
  });

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title || "",
        subtitle: course.subtitle || "",
        description: course.description || "",
        categoryId: course.categoryId || "",
        level: course.level || "",
        language: course.language || "",
        moduleNumber: course.moduleNumber || "",
        weeksDuration: course.weeksDuration || "",
        totalLectures: course.totalLectures || "",
        scriptureRef: course.scriptureRef || "",
        price: course.price || "",
        currency: course.currency || "INR"
      });
      setThumbnail(course.thumbnail);
    }
  }, [course, form]);

  const updateMut = useMutation({
    mutationFn: (data: any) => updateCourse(id, data),
    onSuccess: () => {
      toast.success("Course updated successfully");
      qc.invalidateQueries({ queryKey: ["course", id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update course"),
  });

  const handleThumbnail = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return; }
    setUploading(true);
    try {
      const result = await uploadThumbnail(id, file);
      setThumbnail(result.thumbnailUrl);
      toast.success("Thumbnail updated!");
      qc.invalidateQueries({ queryKey: ["course", id] });
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  const onSubmit = (data: any) => {
    // Basic formatting
    const formattedData = {
      ...data,
      moduleNumber: data.moduleNumber ? Number(data.moduleNumber) : null,
      weeksDuration: data.weeksDuration ? Number(data.weeksDuration) : null,
      totalLectures: data.totalLectures ? Number(data.totalLectures) : null,
      price: data.price ? Number(data.price) : 0,
    };
    updateMut.mutate(formattedData);
  };

  if (isLoading) return <div style={{ color: MUTED }}>Loading course details...</div>;
  if (!course) return <div style={{ color: "#F87171" }}>Course not found</div>;

  const TABS = [
    { id: "basic", label: "Basic Info" },
    { id: "media", label: "Media" },
    { id: "pricing", label: "Pricing" },
  ];

  const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const LANGUAGES = ["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MALAYALAM"];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", cursor: "pointer", transition: "all 0.15s" }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: "#F5F0E8", margin: 0 }}>Edit Course</h1>
            <p style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{course.title}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {course.status === "PUBLISHED" && (
            <button onClick={() => updateMut.mutate({ status: "DRAFT" })} style={{ background: "transparent", color: MUTED, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Unpublish to Draft
            </button>
          )}
          <button onClick={form.handleSubmit(onSubmit)} disabled={updateMut.isPending} style={{ display: "flex", alignItems: "center", gap: 8, background: GOLD, color: DARK, borderRadius: 100, padding: "8px 20px", fontWeight: 700, fontSize: 13, border: "none", cursor: updateMut.isPending ? "not-allowed" : "pointer", opacity: updateMut.isPending ? 0.7 : 1 }}>
            <Save size={14} /> {updateMut.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: "12px 16px", background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === t.id ? GOLD : "transparent"}`, color: activeTab === t.id ? GOLD : MUTED, fontWeight: activeTab === t.id ? 700 : 500, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 12, padding: 32 }}>
        {activeTab === "basic" && (
          <form id="edit-form">
            <Input label="Course Title *" {...form.register("title", { required: "Title is required" })} error={form.formState.errors.title?.message} />
            <Input label="Subtitle" {...form.register("subtitle")} />
            <Textarea label="Description *" {...form.register("description", { required: "Description is required" })} error={form.formState.errors.description?.message} />
            
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Level</label>
              <div style={{ display: "flex", gap: 8 }}>
                {LEVELS.map(l => (
                  <label key={l} style={{ flex: 1, display: "block", cursor: "pointer" }}>
                    <input type="radio" {...form.register("level")} value={l} style={{ display: "none" }} />
                    <div style={{ textAlign: "center", padding: "8px 0", borderRadius: 8, border: `1px solid ${form.watch("level") === l ? GOLD : "rgba(201,151,58,0.25)"}`, background: form.watch("level") === l ? GOLD : "transparent", color: form.watch("level") === l ? DARK : MUTED, fontSize: 12, fontWeight: 700 }}>{l}</div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Language</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LANGUAGES.map(l => (
                  <label key={l} style={{ cursor: "pointer" }}>
                    <input type="radio" {...form.register("language")} value={l} style={{ display: "none" }} />
                    <div style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${form.watch("language") === l ? GOLD : "rgba(201,151,58,0.25)"}`, background: form.watch("language") === l ? GOLD : "transparent", color: form.watch("language") === l ? DARK : MUTED, fontSize: 12, fontWeight: 700 }}>{l}</div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
              <Input label="Module No." type="number" {...form.register("moduleNumber")} />
              <Input label="Weeks" type="number" {...form.register("weeksDuration")} />
              <Input label="Lectures" type="number" {...form.register("totalLectures")} />
            </div>
            <Input label="Scripture Reference" {...form.register("scriptureRef")} />
          </form>
        )}

        {activeTab === "media" && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Course Thumbnail</label>
            <label style={{ display: "block", cursor: "pointer", marginBottom: 24 }}>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />
              <div style={{ border: "2px dashed rgba(201,151,58,0.35)", borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 32, textAlign: "center" }}>
                {thumbnail ? (
                  <div>
                    <img src={thumbnail} alt="Thumbnail" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} />
                    <p style={{ color: GOLD, marginTop: 8, fontSize: 12 }}>Click to replace</p>
                  </div>
                ) : uploading ? (
                  <div style={{ color: MUTED }}>Uploading...</div>
                ) : (
                  <>
                    <Upload size={36} color={MUTED} style={{ margin: "0 auto 12px" }} />
                    <p style={{ color: "#F5F0E8", fontSize: 14 }}>Upload Thumbnail</p>
                  </>
                )}
              </div>
            </label>
          </div>
        )}

        {activeTab === "pricing" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Currency</label>
                <select {...form.register("currency")} style={{ width: "100%", background: DARK, border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontSize: 14, outline: "none" }}>
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <Input label="Price (Set 0 for Free)" type="number" {...form.register("price")} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
