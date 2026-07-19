"use client";

import React, { useEffect, useState, use } from "react";
import { useManagementPath } from "@/hooks/useManagementPath";
import { useRouter } from "next/navigation";
import { api } from "@/store/auth.store";
import { PageHeader } from "@/components/admin/PageHeader";
import { ArrowLeft } from "lucide-react";

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const basePath = useManagementPath();
  const router = useRouter();
  const { slug } = use(params);
  const isNew = slug === "new";

  const [title, setTitle] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [readingTime, setReadingTime] = useState<number | "">("");
  const [isPublished, setIsPublished] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState("");

  useEffect(() => {
    if (isNew) return;
    api.get(`/blog/posts/${slug}`).then((res) => {
      const p = res.data.data;
      setPostId(p.id);
      setTitle(p.title);
      setCustomAuthor(p.customAuthor || "");
      setExcerpt(p.excerpt || "");
      setContent(p.content);
      setReadingTime(p.readingTime || "");
      setIsPublished(p.isPublished);
      setCoverImage(p.coverImage || "");
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [isNew, slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { 
        title, 
        excerpt, 
        content, 
        isPublished, 
        customAuthor: customAuthor || null,
        readingTime: readingTime === "" ? null : Number(readingTime) 
      };
      if (isNew) {
        await api.post("/blog/posts", payload);
        router.push(`${basePath}/blog`);
      } else {
        await api.put(`/blog/posts/${slug}`, payload);
        router.push(`${basePath}/blog`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (isNew) {
      alert("Please save the draft first before uploading a cover image.");
      return;
    }
    const formData = new FormData();
    formData.append("cover", e.target.files[0]);
    try {
      const res = await api.post(`/blog/posts/${postId}/upload-cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setCoverImage(res.data.data.coverImageUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to upload cover image.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "60px", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
      <button 
        onClick={() => router.push(`${basePath}/blog`)}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          fontSize: "13px", 
          fontWeight: 600, 
          color: "#8F9E93", 
          background: "transparent", 
          border: "none", 
          cursor: "pointer",
          marginBottom: "24px",
          transition: "color 0.15s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#1A261D"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#8F9E93"}
      >
        <ArrowLeft size={16} />
        Back to Blog Posts
      </button>
      
      <PageHeader title={isNew ? "New Blog Post" : "Edit Blog Post"} subtitle="Draft your thoughts and publish to the world" />

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E4E8E0",
          padding: "32px",
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8F9E93", marginBottom: "8px" }}>
              Post Title <span style={{ color: "#B03A2E" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Arulappan: A Pioneer of Indigenous Leadership"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "15px",
                fontWeight: 500,
                color: "#1A261D",
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                borderRadius: "10px",
                outline: "none",
                transition: "all 0.15s"
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Custom Author */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8F9E93", marginBottom: "8px" }}>
              Author Name <span style={{ textTransform: "none", color: "#B88645", fontWeight: 600 }}>(Leave blank for yourself)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. John Doe"
              value={customAuthor}
              onChange={(e) => setCustomAuthor(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "15px",
                fontWeight: 500,
                color: "#1A261D",
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                borderRadius: "10px",
                outline: "none",
                transition: "all 0.15s"
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8F9E93", marginBottom: "8px" }}>
            Excerpt / Summary
          </label>
          <textarea
            placeholder="A short summary that appears on the blog index page..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            data-lenis-prevent="true"
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "12px 16px",
              fontSize: "14px",
              lineHeight: 1.5,
              fontWeight: 500,
              color: "#1A261D",
              background: "#F7F8F5",
              border: "1px solid #E4E8E0",
              borderRadius: "10px",
              outline: "none",
              resize: "vertical",
              overflowY: "auto",
              transition: "all 0.15s"
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Reading Time */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8F9E93", marginBottom: "8px" }}>
              Reading Time (mins)
            </label>
            <input
              type="number"
              placeholder="e.g. 6"
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value ? Number(e.target.value) : "")}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "15px",
                fontWeight: 500,
                color: "#1A261D",
                background: "#F7F8F5",
                border: "1px solid #E4E8E0",
                borderRadius: "10px",
                outline: "none",
                transition: "all 0.15s"
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Cover Image Upload */}
          {!isNew && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8F9E93", marginBottom: "8px" }}>
                Cover Image
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {coverImage && (
                  <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                    <img src={coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                      width: "100%"
                    }}
                  />
                  <div style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "#F7F8F5",
                    border: "1px dashed #B88645",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#B88645"
                  }}>
                    {coverImage ? "Replace Image" : "Upload Image"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content (Markdown) */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8F9E93" }}>
              Post Content <span style={{ textTransform: "none", color: "#B88645", fontWeight: 600 }}>(Markdown supported)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                // 1. Normalize Windows line endings to standard line endings
                let text = content.replace(/\r\n/g, '\n');
                
                // 2. Smart Paragraph Detection:
                // If a line ends with punctuation (. ? ! " ” ') and the next line starts with a Capital letter,
                // it's almost certainly a new paragraph in a PDF. Convert to a double newline.
                text = text.replace(/([.?!]["”']?)\n([A-Z“"'])/g, '$1\n\n$2');
                
                // 3. Replace all remaining single line breaks with spaces (fixing ragged sentences)
                text = text.replace(/([^\n])\n([^\n])/g, '$1 $2');
                
                // 4. Clean up any accidental triple newlines
                text = text.replace(/\n{3,}/g, '\n\n');
                
                setContent(text);
              }}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#B88645",
                background: "rgba(184,134,69,0.1)",
                border: "none",
                borderRadius: "6px",
                padding: "4px 8px",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(184,134,69,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(184,134,69,0.1)"}
            >
              ✨ Clean Pasted Text
            </button>
          </div>
          <textarea
            placeholder="# Introduction&#10;&#10;Write your post content here using Markdown formatting..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            data-lenis-prevent="true"
            style={{
              width: "100%",
              minHeight: "400px",
              padding: "20px",
              fontFamily: "inherit",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#1A261D",
              background: "#FAFBF9",
              border: "1px solid #E4E8E0",
              borderRadius: "10px",
              outline: "none",
              resize: "vertical",
              overflowY: "auto",
              transition: "all 0.15s"
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#B88645"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#E4E8E0"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ height: "1px", background: "#E4E8E0", margin: "8px 0" }} />

        {/* Publish & Save */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{
                appearance: "none",
                width: "20px",
                height: "20px",
                border: "2px solid",
                borderColor: isPublished ? "#B88645" : "#E4E8E0",
                borderRadius: "6px",
                background: isPublished ? "#B88645" : "#FFFFFF",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.15s"
              }}
            />
            {isPublished && (
              <svg style={{ position: "absolute", left: "3px", top: "4px", width: "14px", height: "14px", fill: "none", stroke: "#FFFFFF", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", pointerEvents: "none" }} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <span style={{ fontSize: "14px", fontWeight: 600, color: isPublished ? "#1A261D" : "#8F9E93" }}>
              Publish Post Instantly
            </span>
          </label>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push(`${basePath}/blog`)}
              disabled={saving}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: "transparent",
                border: "1px solid #E4E8E0",
                color: "#4A5B4D",
                fontSize: "14px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#F7F8F5"; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "transparent"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                background: "#B88645",
                border: "none",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                boxShadow: "0 2px 10px rgba(184,134,69,0.2)"
              }}
              onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = "#A3753A"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = "#B88645"; e.currentTarget.style.transform = "translateY(0)"; } }}
            >
              {saving ? "Saving..." : "Save Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
