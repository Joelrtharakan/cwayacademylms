"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/store/auth.store";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const isNew = slug === "new";

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
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
      setExcerpt(p.excerpt || "");
      setContent(p.content);
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
      const payload = { title, excerpt, content, isPublished };
      if (isNew) {
        await api.post("/blog/posts", payload);
        router.push("/admin/blog");
      } else {
        await api.put(`/blog/posts/${slug}`, payload);
        router.push("/admin/blog");
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
    <div className="max-w-4xl">
      <PageHeader title={isNew ? "New Blog Post" : "Edit Blog Post"} />

      <div className="bg-white rounded-2xl border border-[#E8EBE4] p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1A261D] mb-1">Title</label>
          <input
            type="text"
            className="w-full border border-[#E8EBE4] rounded-lg p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {!isNew && (
          <div>
            <label className="block text-sm font-medium text-[#1A261D] mb-1">Cover Image</label>
            {coverImage && (
              <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleCoverUpload} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#1A261D] mb-1">Excerpt</label>
          <textarea
            className="w-full border border-[#E8EBE4] rounded-lg p-2 h-20"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A261D] mb-1">Content (Markdown supported)</label>
          <textarea
            className="w-full border border-[#E8EBE4] rounded-lg p-2 h-64 font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="published" className="text-sm font-medium text-[#1A261D]">Published</label>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/blog")} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#B88645] hover:bg-[#A3753A] text-white">
            {saving ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
