"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { BookOpen, Gift, CreditCard, Heart, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [moduleNumber, setModuleNumber] = useState("");
  const [language, setLanguage] = useState("ENGLISH");
  const [level, setLevel] = useState("BEGINNER");
  
  const [pricingType, setPricingType] = useState<"FREE" | "PAID" | "SCHOLARSHIP">("FREE");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("INR");

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.post("/courses", data).then((r) => r.data.data),
    onSuccess: (data) => {
      toast.success("Course draft created successfully");
      router.push(`/instructor/courses/${data.id}`);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Failed to create course");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId) {
      toast.error("Please fill all required fields");
      return;
    }

    createMut.mutate({
      title,
      subtitle,
      categoryId,
      moduleNumber: moduleNumber || undefined,
      language,
      level,
      isFree: pricingType === "FREE" || pricingType === "SCHOLARSHIP",
      price: pricingType === "PAID" ? Number(price) : 0,
      currency,
      tags: pricingType === "SCHOLARSHIP" ? ["Scholarship Eligible"] : [],
    });
  };

  const LANGUAGES = ["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MALAYALAM"];
  const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8F5", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "#FFFFFF",
          border: "1px solid rgba(184,134,69,0.3)",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(26,38,29,0.04)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "32px 40px", borderBottom: "1px solid rgba(184,134,69,0.15)", position: "relative" }}>
          <Link href="/instructor/courses" style={{ position: "absolute", left: "40px", top: "38px", color: "#8F9E93", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#F5F0E8"} onMouseLeave={(e) => e.currentTarget.style.color = "#8A9E8C"}>
            <ArrowLeft size={20} />
          </Link>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(184,134,69,0.1)", color: "#B88645", marginBottom: "16px" }}>
              <BookOpen size={24} />
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>Create a New Course</h1>
            <p style={{ fontSize: "15px", color: "#8F9E93", margin: 0 }}>Let's start with the basics. You can fill in the rest later.</p>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ padding: "40px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Title & Subtitle */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Course Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Hermeneutics"
                  style={{
                    width: "100%", padding: "16px", fontSize: "16px", background: "#F7F8F5", border: "1px solid rgba(184,134,69,0.3)", borderRadius: "12px", color: "#1A261D", outline: "none", transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#B88645"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(184,134,69,0.3)"}
                  required
                />
                {title && (
                  <div style={{ marginTop: "12px", padding: "16px", background: "#F7F8F5", borderRadius: "12px", border: "1px dashed rgba(184,134,69,0.2)" }}>
                    <p style={{ fontSize: "12px", color: "#8F9E93", margin: "0 0 8px 0", textTransform: "uppercase" }}>Live Preview</p>
                    <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontStyle: "italic", color: "#B88645", margin: 0 }}>{title}</h2>
                  </div>
                )}
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{
                      width: "100%", padding: "16px", fontSize: "15px", background: "#F7F8F5", border: "1px solid rgba(184,134,69,0.3)", borderRadius: "12px", color: "#1A261D", outline: "none", appearance: "none"
                    }}
                    required
                  >
                    <option value="" disabled style={{ color: "#000" }}>Select category...</option>
                    {catData?.map((cat: any) => (
                      <option key={cat.id} value={cat.id} style={{ color: "#000" }}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Module Number</label>
                  <input
                    type="number"
                    value={moduleNumber}
                    onChange={(e) => setModuleNumber(e.target.value)}
                    placeholder="e.g. 1"
                    min="1"
                    max="99"
                    style={{
                      width: "100%", padding: "16px", fontSize: "15px", background: "#F7F8F5", border: "1px solid rgba(184,134,69,0.3)", borderRadius: "12px", color: "#1A261D", outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Language & Level */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Language *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      style={{
                        padding: "10px 20px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                        ...(language === lang
                          ? { background: "rgba(184,134,69,0.15)", color: "#B88645", border: "1px solid #B88645" }
                          : { background: "transparent", color: "#8F9E93", border: "1px solid rgba(184,134,69,0.3)" })
                      }}
                    >
                      {lang === "ENGLISH" ? "EN" : lang === "HINDI" ? "HI" : lang === "TAMIL" ? "TA" : lang === "TELUGU" ? "TE" : lang === "KANNADA" ? "KN" : "ML"} - {lang.charAt(0) + lang.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Level *</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      style={{
                        flex: 1, padding: "12px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                        ...(level === lvl
                          ? { background: "rgba(184,134,69,0.15)", color: "#B88645", border: "1px solid #B88645" }
                          : { background: "transparent", color: "#8F9E93", border: "1px solid rgba(184,134,69,0.3)" })
                      }}
                    >
                      {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing / Access */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Pricing & Access *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                
                {/* Free */}
                <div
                  onClick={() => setPricingType("FREE")}
                  style={{
                    padding: "24px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", border: pricingType === "FREE" ? "2px solid #B88645" : "1px solid #E4E8E0", background: pricingType === "FREE" ? "rgba(184,134,69,0.08)" : "#FFFFFF",
                  }}
                >
                  <Gift size={32} color={pricingType === "FREE" ? "#B88645" : "#8F9E93"} style={{ marginBottom: "16px" }} />
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: pricingType === "FREE" ? "#B88645" : "#1A261D", margin: "0 0 8px 0" }}>Free</h3>
                  <p style={{ fontSize: "13px", color: "#8F9E93", margin: 0, lineHeight: 1.5 }}>Open to all — anyone can enroll at no cost</p>
                </div>

                {/* Paid */}
                <div
                  onClick={() => setPricingType("PAID")}
                  style={{
                    padding: "24px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", border: pricingType === "PAID" ? "2px solid #B88645" : "1px solid #E4E8E0", background: pricingType === "PAID" ? "rgba(184,134,69,0.08)" : "#FFFFFF",
                  }}
                >
                  <CreditCard size={32} color={pricingType === "PAID" ? "#B88645" : "#8F9E93"} style={{ marginBottom: "16px" }} />
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: pricingType === "PAID" ? "#B88645" : "#1A261D", margin: "0 0 8px 0" }}>Paid</h3>
                  <p style={{ fontSize: "13px", color: "#8F9E93", margin: 0, lineHeight: 1.5 }}>Students pay once to unlock all content</p>
                </div>

                {/* Scholarship */}
                <div
                  onClick={() => setPricingType("SCHOLARSHIP")}
                  style={{
                    padding: "24px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", border: pricingType === "SCHOLARSHIP" ? "2px solid #B88645" : "1px solid #E4E8E0", background: pricingType === "SCHOLARSHIP" ? "rgba(184,134,69,0.08)" : "#FFFFFF",
                  }}
                >
                  <Heart size={32} color={pricingType === "SCHOLARSHIP" ? "#B88645" : "#8F9E93"} style={{ marginBottom: "16px" }} />
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: pricingType === "SCHOLARSHIP" ? "#B88645" : "#1A261D", margin: "0 0 8px 0" }}>Scholarship</h3>
                  <p style={{ fontSize: "13px", color: "#8F9E93", margin: 0, lineHeight: 1.5 }}>CWAY partners can sponsor candidates</p>
                </div>
              </div>

              {/* Price Input expansion */}
              {pricingType === "PAID" && (
                <div style={{ marginTop: "16px", padding: "20px", background: "#F7F8F5", borderRadius: "16px", border: "1px solid rgba(184,134,69,0.2)", animation: "fadeIn 0.2s ease-out" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Course Price *</label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ padding: "16px", fontSize: "15px", background: "#F7F8F5", border: "1px solid rgba(184,134,69,0.3)", borderRadius: "12px", color: "#1A261D", outline: "none", width: "100px" }}
                    >
                      <option value="INR" style={{ color: "#000" }}>INR (₹)</option>
                      <option value="USD" style={{ color: "#000" }}>USD ($)</option>
                    </select>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 1500"
                      min="1"
                      style={{ flex: 1, padding: "16px", fontSize: "15px", background: "#F7F8F5", border: "1px solid rgba(184,134,69,0.3)", borderRadius: "12px", color: "#1A261D", outline: "none" }}
                      required={pricingType === "PAID"}
                    />
                  </div>
                  {price && (
                    <div style={{ marginTop: "16px", padding: "16px", background: "rgba(184,134,69,0.08)", borderRadius: "8px", border: "1px dashed rgba(184,134,69,0.2)" }}>
                      <p style={{ fontSize: "13px", color: "#8F9E93", margin: "0 0 4px 0", display: "flex", justifyContent: "space-between" }}><span>Sale price:</span> <span>{currency === "INR" ? "₹" : "$"}{price}</span></p>
                      <p style={{ fontSize: "13px", color: "#8F9E93", margin: "0 0 8px 0", display: "flex", justifyContent: "space-between" }}><span>Platform fee (30%):</span> <span style={{ color: "#B03A2E" }}>-{currency === "INR" ? "₹" : "$"}{(Number(price) * 0.3).toFixed(2)}</span></p>
                      <div style={{ height: "1px", background: "rgba(184,134,69,0.2)", margin: "8px 0" }}></div>
                      <p style={{ fontSize: "15px", color: "#B88645", margin: 0, fontWeight: 700, display: "flex", justifyContent: "space-between" }}><span>You earn:</span> <span>{currency === "INR" ? "₹" : "$"}{(Number(price) * 0.7).toFixed(2)}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(184,134,69,0.15)", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
              <Link href="/instructor/courses" style={{ padding: "14px 28px", borderRadius: "999px", fontSize: "15px", fontWeight: 600, color: "#8F9E93", textDecoration: "none", display: "flex", alignItems: "center" }}>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMut.isPending || !title || !categoryId || (pricingType === "PAID" && !price)}
                style={{
                  padding: "14px 32px", borderRadius: "999px", fontSize: "15px", fontWeight: 600, background: "#B88645", color: "#FFFFFF", border: "none", cursor: createMut.isPending ? "not-allowed" : "pointer", opacity: createMut.isPending ? 0.7 : 1, transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px"
                }}
                onMouseEnter={(e) => !createMut.isPending && (e.currentTarget.style.background = "#E8B85A")}
                onMouseLeave={(e) => !createMut.isPending && (e.currentTarget.style.background = "#B88645")}
              >
                {createMut.isPending ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {createMut.isPending ? "Creating Draft..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
