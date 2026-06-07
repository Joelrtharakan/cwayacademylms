"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Check, ChevronRight, ChevronLeft, Plus, X, Upload, Gift, CreditCard, Heart } from "lucide-react";
import {
  createCourse, updateCourse, uploadThumbnail, submitForReview,
  getCategories, createSection, createLesson, updateLesson, deleteSection, deleteLesson,
  reorderSections, reorderLessons, createQuiz, addQuestion, createAssignment
} from "@/lib/api/instructor";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

// ── Step Indicator ─────────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Media", "Pricing", "Curriculum", "Settings & Submit"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 40 }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: done ? GOLD : active ? GOLD : "rgba(255,255,255,0.08)",
                border: `2px solid ${(done || active) ? GOLD : "rgba(255,255,255,0.2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: (done || active) ? "#1C2B1E" : MUTED, fontWeight: 700, fontSize: 13,
                transition: "all 0.25s",
              }}>
                {done ? <Check size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? GOLD : done ? GOLD : MUTED, whiteSpace: "nowrap", letterSpacing: "0.04em" }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 2, flex: 1, background: i < current ? GOLD : "rgba(255,255,255,0.1)", margin: "0 6px", marginBottom: 18, transition: "background 0.25s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
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

// ── Step 1: Basic Info ─────────────────────────────────────────────────────────
function Step1({ form, onNext, categories }: any) {
  const { register, handleSubmit, watch, formState: { errors } } = form;
  const title = watch("title") || "";
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const LANGUAGES = ["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MALAYALAM"];

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Course Basics</h2>

      <Input label="Course Title *" {...register("title", { required: "Title is required", minLength: { value: 5, message: "Min 5 chars" }, maxLength: { value: 120, message: "Max 120 chars" } })} error={errors.title?.message} placeholder="e.g. Introduction to Old Testament" />

      {title && (
        <div style={{ marginTop: -12, marginBottom: 18, padding: "10px 14px", background: "rgba(201,151,58,0.06)", borderRadius: 8, borderLeft: `3px solid ${GOLD}` }}>
          <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 20, color: "#F5F0E8" }}>{title}</span>
        </div>
      )}

      <Input label="Subtitle" {...register("subtitle")} placeholder="A short tagline for your course" />

      <Textarea label="Description *" {...register("description", { required: "Description is required", minLength: { value: 50, message: "Min 50 characters" } })} error={errors.description?.message} rows={5} placeholder="Tell students what they will learn..." />

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</label>
        <select {...register("categoryId")} style={{ width: "100%", background: DARK, border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: 14, outline: "none" }}>
          <option value="">Select a category</option>
          {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Level *</label>
        <div style={{ display: "flex", gap: 8 }}>
          {LEVELS.map(l => {
            const active = watch("level") === l;
            return <label key={l} style={{ flex: 1, display: "block", cursor: "pointer" }}>
              <input type="radio" {...register("level", { required: true })} value={l} style={{ display: "none" }} />
              <div style={{ textAlign: "center", padding: "8px 0", borderRadius: 8, border: `1px solid ${active ? GOLD : "rgba(201,151,58,0.25)"}`, background: active ? GOLD : "transparent", color: active ? DARK : MUTED, fontSize: 12, fontWeight: 700, transition: "all 0.15s" }}>{l}</div>
            </label>;
          })}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Language *</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LANGUAGES.map(l => {
            const active = watch("language") === l;
            return <label key={l} style={{ cursor: "pointer" }}>
              <input type="radio" {...register("language", { required: true })} value={l} style={{ display: "none" }} />
              <div style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${active ? GOLD : "rgba(201,151,58,0.25)"}`, background: active ? GOLD : "transparent", color: active ? DARK : MUTED, fontSize: 12, fontWeight: 700 }}>{l}</div>
            </label>;
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Input label="Module No. (1-9)" type="number" min={1} max={9} {...register("moduleNumber")} />
        <Input label="Weeks *" type="number" min={1} {...register("weeksDuration", { required: true })} />
        <Input label="Lectures *" type="number" min={0} {...register("totalLectures")} />
      </div>

      <Input label="Scripture Reference" {...register("scriptureRef")} placeholder="e.g. 2 Timothy 2:15" />
      <p style={{ fontSize: 11, color: MUTED, marginTop: -12, marginBottom: 18 }}>This verse will appear on the course detail page and certificate</p>

      <button type="submit" style={{ width: "100%", background: "#1A261D", color: "#FFFFFF", borderRadius: 100, padding: "14px 0", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Continue <ChevronRight size={16} />
      </button>
    </form>
  );
}

// ── Step 2: Media ──────────────────────────────────────────────────────────────
function Step2({ courseId, onNext, onBack }: any) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [promoUrl, setPromoUrl] = useState("");

  const handleThumbnail = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return; }
    setUploading(true);
    try {
      const result = await uploadThumbnail(courseId, file);
      setThumbnail(result.thumbnailUrl);
      toast.success("Thumbnail uploaded!");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Course Media</h2>

      {/* Thumbnail Upload */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Course Thumbnail</label>
        <label style={{ display: "block", cursor: "pointer" }}>
          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />
          <div style={{ border: "2px dashed rgba(201,151,58,0.35)", borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 32, textAlign: "center", transition: "all 0.15s" }}>
            {thumbnail ? (
              <div>
                <img src={thumbnail} alt="Thumbnail" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} />
                <p style={{ color: GOLD, marginTop: 8, fontSize: 12 }}>✓ Uploaded! Click to change</p>
              </div>
            ) : uploading ? (
              <div style={{ color: MUTED }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }} />
                Uploading...
              </div>
            ) : (
              <>
                <Upload size={36} color={MUTED} style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "#F5F0E8", fontSize: 14, fontWeight: 600 }}>Drag & drop or click to upload</p>
                <p style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>JPG, PNG or WebP • Max 5MB • Recommended: 1280×720px</p>
              </>
            )}
          </div>
        </label>
        <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(201,151,58,0.06)", borderRadius: 8, borderLeft: `3px solid ${GOLD}` }}>
          <p style={{ fontSize: 12, color: MUTED }}>💡 <strong style={{ color: GOLD }}>Tip:</strong> CWAY course thumbnails look best with a dark green overlay and gold serif title text.</p>
        </div>
      </div>

      {/* Promo Video URL */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Promo Video URL (Optional)</label>
        <input value={promoUrl} onChange={(e) => setPromoUrl(e.target.value)} placeholder="Paste YouTube or Vimeo URL"
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack} style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "12px 0", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={() => onNext({ promoVideoUrl: promoUrl })} style={{ flex: 2, background: GOLD, color: DARK, borderRadius: 100, padding: "12px 0", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Continue <ChevronRight size={16} />
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Step 3: Pricing ────────────────────────────────────────────────────────────
function Step3({ form, onNext, onBack }: any) {
  const { register, watch, handleSubmit } = form;
  const [type, setType] = useState<"FREE" | "PAID" | "SPONSORED">("FREE");
  const price = watch("price") || 0;
  const earnings = (Number(price) * 0.7).toFixed(0);

  const TYPES = [
    { key: "FREE", icon: Gift, label: "Free", desc: "Anyone can enroll at no cost" },
    { key: "PAID", icon: CreditCard, label: "Paid", desc: "Students pay to enroll" },
    { key: "SPONSORED", icon: Heart, label: "Scholarship Eligible", desc: "Partners can sponsor students" },
  ];

  return (
    <form onSubmit={handleSubmit((d: any) => onNext({ ...d, isFree: type === "FREE" || type === "SPONSORED" }))}>
      <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Course Pricing</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {TYPES.map(({ key, icon: Icon, label, desc }) => {
          const active = type === key;
          return (
            <button key={key} type="button" onClick={() => setType(key as any)}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: `2px solid ${active ? GOLD : "rgba(201,151,58,0.2)"}`, borderRadius: 12, background: active ? "rgba(201,151,58,0.08)" : "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: active ? `${GOLD}30` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={active ? GOLD : MUTED} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: active ? GOLD : "#F5F0E8" }}>{label}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{desc}</div>
              </div>
              {active && <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color={DARK} /></div>}
            </button>
          );
        })}
      </div>

      {type === "PAID" && (
        <div style={{ padding: "20px", background: SURFACE, borderRadius: 12, border: "1px solid rgba(201,151,58,0.2)", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <select {...register("currency")} style={{ background: DARK, border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontSize: 14, outline: "none" }}>
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
            </select>
            <input type="number" min={0} {...register("price")} placeholder="0" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.25)", borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontSize: 20, fontWeight: 700, outline: "none" }} />
          </div>
          <p style={{ fontSize: 13, color: MUTED }}>Platform fee: 30% | <span style={{ color: GOLD, fontWeight: 700 }}>You earn: ₹{earnings}</span></p>
        </div>
      )}

      {type === "SPONSORED" && (
        <div style={{ padding: "16px 20px", background: "rgba(201,151,58,0.06)", borderRadius: 10, borderLeft: `3px solid ${GOLD}`, marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: MUTED }}>Students without funds can be sponsored by CWAY partners. You'll receive payment when admin links a sponsor to a student.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={onBack} style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "12px 0", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ChevronLeft size={16} /> Back
        </button>
        <button type="submit" style={{ flex: 2, background: "#1A261D", color: "#FFFFFF", borderRadius: 100, padding: "12px 0", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
}

// ── Step 4: Curriculum Builder ────────────────────────────────────────────────
function Step4({ courseId, onNext, onBack }: any) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const handleAddSection = async () => {
    try {
      const s = await createSection(courseId, { title: `Section ${sections.length + 1}` });
      setSections([...sections, { ...s, lessons: [] }]);
    } catch { toast.error("Failed to add section"); }
  };

  const handleAddLesson = async (sectionId: string, type: string) => {
    try {
      const l = await createLesson(sectionId, { title: "New Lesson", type });
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, l] } : s));
    } catch { toast.error("Failed to add lesson"); }
  };

  const LESSON_TYPES = [
    { key: "VIDEO", label: "Video", color: GOLD },
    { key: "TEXT", label: "Text", color: "#60A5FA" },
    { key: "QUIZ", label: "Quiz", color: "#FBBF24" },
    { key: "ASSIGNMENT", label: "Assignment", color: "#4ADE80" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 8 }}>Course Curriculum</h2>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 24 }}>{sections.length} sections • {sections.reduce((a, s) => a + s.lessons.length, 0)} lessons</p>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {sections.map((section, si) => (
          <div key={section.id} style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 10 }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>Section {si + 1}:</span>
              <input defaultValue={section.title} onBlur={async (e) => { try { await updateLesson(section.id, { title: e.target.value }); } catch {} }}
                style={{ flex: 1, background: "transparent", border: "none", color: "#F5F0E8", fontSize: 13, fontWeight: 600, outline: "none" }} />
              <span style={{ background: "rgba(201,151,58,0.15)", color: GOLD, borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{section.lessons.length}</span>
              <button onClick={async () => { await deleteSection(courseId, section.id); setSections(prev => prev.filter(s => s.id !== section.id)); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#F87171", padding: 4 }}>
                <X size={14} />
              </button>
            </div>
            {/* Lessons */}
            <div style={{ padding: "0 16px 12px" }}>
              {section.lessons.map((lesson: any, li: number) => (
                <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, marginBottom: 4, background: "rgba(255,255,255,0.03)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: LESSON_TYPES.find(t => t.key === lesson.type)?.color || MUTED, background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>{lesson.type}</span>
                  <input defaultValue={lesson.title} onBlur={async (e) => { try { await updateLesson(lesson.id, { title: e.target.value }); } catch {} }}
                    style={{ flex: 1, background: "transparent", border: "none", color: "#F5F0E8", fontSize: 13, outline: "none" }} />
                  <button onClick={async () => { await deleteLesson(lesson.id); setSections(prev => prev.map(s => s.id === section.id ? { ...s, lessons: s.lessons.filter((l: any) => l.id !== lesson.id) } : s)); }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {LESSON_TYPES.map(lt => (
                  <button key={lt.key} onClick={() => handleAddLesson(section.id, lt.key)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", color: lt.color, borderRadius: 6, padding: "6px 4px", fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                    + {lt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleAddSection} style={{ width: "100%", background: "transparent", border: "2px dashed rgba(201,151,58,0.3)", borderRadius: 10, padding: "14px 0", color: GOLD, fontWeight: 700, cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Plus size={16} /> Add Section
      </button>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack} style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "12px 0", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} style={{ flex: 2, background: "#1A261D", color: "#FFFFFF", borderRadius: 100, padding: "12px 0", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 5: Settings & Submit ──────────────────────────────────────────────────
function Step5({ courseId, onBack, onSubmit }: any) {
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [audience, setAudience] = useState<string[]>([""]);
  const [welcome, setWelcome] = useState("");
  const [congrats, setCongrats] = useState("");

  const ListInput = ({ label, items, setItems, placeholder }: any) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>{label}</label>
      {items.map((item: string, i: number) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <span style={{ color: GOLD, marginTop: 10, fontSize: 16 }}>•</span>
          <input value={item} onChange={e => setItems(items.map((v: string, j: number) => j === i ? e.target.value : v))} placeholder={placeholder}
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,151,58,0.2)", borderRadius: 8, padding: "10px 12px", color: "#F5F0E8", fontSize: 13, outline: "none" }} />
          {items.length > 1 && <button onClick={() => setItems(items.filter((_: any, j: number) => j !== i))} style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer" }}><X size={14} /></button>}
        </div>
      ))}
      <button onClick={() => setItems([...items, ""])} style={{ background: "transparent", border: "1px dashed rgba(201,151,58,0.3)", color: GOLD, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
        + Add item
      </button>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Final Settings</h2>

      <ListInput label="Learning Outcomes (min 3) *" items={outcomes} setItems={setOutcomes} placeholder="Students will be able to..." />
      <ListInput label="Requirements" items={requirements} setItems={setRequirements} placeholder="Basic understanding of..." />
      <ListInput label="Target Audience" items={audience} setItems={setAudience} placeholder="This course is for..." />

      <Textarea label="Welcome Message" value={welcome} onChange={(e: any) => setWelcome(e.target.value)} placeholder="Welcome to the course! We're thrilled to have you on this journey..." />
      <Textarea label="Congratulations Message" value={congrats} onChange={(e: any) => setCongrats(e.target.value)} placeholder="Congratulations on completing..." />

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button onClick={onBack} style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "12px 0", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={() => onSubmit({ outcomes: outcomes.filter(Boolean), requirements: requirements.filter(Boolean), targetAudience: audience.filter(Boolean), welcomeMessage: welcome, congratsMessage: congrats })}
          style={{ flex: 2, background: GOLD, color: DARK, borderRadius: 100, padding: "14px 0", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Check size={16} /> Submit Course for Review
        </button>
      </div>
    </div>
  );
}

// ── Main Wizard Page ──────────────────────────────────────────────────────────
export default function NewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const form = useForm({ defaultValues: { title: "", subtitle: "", description: "", categoryId: "", level: "BEGINNER", language: "ENGLISH", moduleNumber: "", weeksDuration: 6, totalLectures: 0, scriptureRef: "", price: 0, currency: "INR" } });

  const handleStep1 = async (data: any) => {
    try {
      if (!courseId) {
        const course = await createCourse(data);
        setCourseId(course.id);
      } else {
        await updateCourse(courseId, data);
      }
      setStep(1);
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save"); }
  };

  const handleStep2 = async (data: any) => {
    if (courseId && data.promoVideoUrl) await updateCourse(courseId, data);
    setStep(2);
  };

  const handleStep3 = async (data: any) => {
    if (courseId) await updateCourse(courseId, data);
    setStep(3);
  };

  const handleSubmitReview = async (data: any) => {
    if (!courseId) return;
    try {
      await updateCourse(courseId, data);
      await submitForReview(courseId);
      toast.success("Course submitted! You'll be notified once it's reviewed.");
      router.push("/instructor/courses");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to submit"); }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 28, color: "#F5F0E8", marginBottom: 32 }}>Create New Course</h1>
      <StepIndicator current={step} />

      <div style={{ background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: "32px 36px" }}>
        {step === 0 && <Step1 form={form} onNext={handleStep1} categories={categories} />}
        {step === 1 && <Step2 courseId={courseId} onNext={handleStep2} onBack={() => setStep(0)} />}
        {step === 2 && <Step3 form={form} onNext={handleStep3} onBack={() => setStep(1)} />}
        {step === 3 && <Step4 courseId={courseId} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step5 courseId={courseId} onBack={() => setStep(3)} onSubmit={handleSubmitReview} />}
      </div>
    </div>
  );
}
