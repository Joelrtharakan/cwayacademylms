"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { UploadCloud, Image as ImageIcon, Video, Loader2 } from "lucide-react";

export default function ThumbnailPromoSection({ course, onSave }: { course: any, onSave: () => void }) {
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail || "");
  const [promoUrl, setPromoUrl] = useState(course.promoVideoUrl || "");

  const thumbInputRef = React.useRef<HTMLInputElement>(null);
  const promoInputRef = React.useRef<HTMLInputElement>(null);

  const uploadThumbMut = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("thumbnail", file);
      return api.post(`/courses/${course.id}/upload-thumbnail`, formData).then(r => r.data.data);
    },
    onSuccess: (data) => {
      setThumbnailUrl(data.thumbnailUrl);
      toast.success("Thumbnail uploaded");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to upload thumbnail")
  });

  const uploadPromoMut = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("video", file);
      return api.post(`/courses/${course.id}/upload-promo-video`, formData).then(r => r.data.data);
    },
    onSuccess: (data) => {
      setPromoUrl(data.promoVideoUrl);
      toast.success("Promo video uploaded");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to upload promo video")
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => api.put(`/courses/${course.id}`, data).then(r => r.data.data),
    onSuccess: () => {
      toast.success("Settings saved successfully");
      onSave();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to save"),
  });

  return (
    <div style={{ display: "grid", gap: "32px" }}>
      
      {/* Thumbnail */}
      <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ padding: "10px", background: "rgba(184,134,69,0.1)", borderRadius: "8px", color: "#B88645" }}>
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#1A261D", margin: 0 }}>Course Thumbnail</h2>
            <p style={{ fontSize: "13px", color: "#8F9E93", margin: "4px 0 0 0" }}>Appears on the course catalog and dashboard</p>
          </div>
        </div>

        <div 
          onClick={() => thumbInputRef.current?.click()}
          style={{ border: "2px dashed #E2E8F0", borderRadius: "12px", padding: "40px", textAlign: "center", background: "#F8FAFC", cursor: "pointer", position: "relative", overflow: "hidden", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Thumbnail" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : uploadThumbMut.isPending ? (
            <>
              <Loader2 size={32} className="animate-spin" color="#A0AEC0" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ fontSize: "14px", color: "#8F9E93", fontWeight: 600, margin: 0 }}>Uploading...</p>
            </>
          ) : (
            <>
              <UploadCloud size={32} color="#A0AEC0" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ fontSize: "14px", color: "#8F9E93", fontWeight: 600, margin: "0 0 4px 0" }}>Drag & drop an image or click to browse</p>
              <p style={{ fontSize: "12px", color: "#8F9E93", margin: 0 }}>Recommended 1280x720px (16:9), max 2MB</p>
            </>
          )}
          <input 
            type="file" 
            ref={thumbInputRef} 
            style={{ display: "none" }} 
            accept="image/*" 
            onChange={(e) => {
              if (e.target.files?.[0]) uploadThumbMut.mutate(e.target.files[0]);
            }} 
          />
        </div>
      </div>

      {/* Promo Video */}
      <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ padding: "10px", background: "rgba(184,134,69,0.1)", borderRadius: "8px", color: "#B88645" }}>
            <Video size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#1A261D", margin: 0 }}>Promo Video</h2>
            <p style={{ fontSize: "13px", color: "#8F9E93", margin: "4px 0 0 0" }}>A short video to introduce the course</p>
          </div>
        </div>

        <div 
          onClick={() => promoInputRef.current?.click()}
          style={{ border: "2px dashed #E2E8F0", borderRadius: "12px", padding: "40px", textAlign: "center", background: "#F8FAFC", cursor: "pointer", position: "relative", overflow: "hidden", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          {promoUrl ? (
            <video src={promoUrl} controls style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : uploadPromoMut.isPending ? (
            <>
              <Loader2 size={32} className="animate-spin" color="#A0AEC0" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ fontSize: "14px", color: "#8F9E93", fontWeight: 600, margin: 0 }}>Uploading...</p>
            </>
          ) : (
            <>
              <UploadCloud size={32} color="#A0AEC0" style={{ margin: "0 auto 12px auto" }} />
              <p style={{ fontSize: "14px", color: "#8F9E93", fontWeight: 600, margin: "0 0 4px 0" }}>Drag & drop a video or click to browse</p>
              <p style={{ fontSize: "12px", color: "#8F9E93", margin: 0 }}>MP4 format, max 500MB</p>
            </>
          )}
          <input 
            type="file" 
            ref={promoInputRef} 
            style={{ display: "none" }} 
            accept="video/*" 
            onChange={(e) => {
              if (e.target.files?.[0]) uploadPromoMut.mutate(e.target.files[0]);
            }} 
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => updateMut.mutate({ thumbnail: thumbnailUrl, promoVideoUrl: promoUrl })} style={{ padding: "12px 24px", borderRadius: "8px", background: "#FFFFFF", color: "#1A261D", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          {updateMut.isPending ? <Loader2 size={18} className="animate-spin" /> : "Save Media"}
        </button>
      </div>
    </div>
  );
}
