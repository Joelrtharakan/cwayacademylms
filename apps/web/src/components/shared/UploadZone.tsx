"use client";

import React, { useRef, useState } from "react";
import { Upload, X, FileImage, CheckCircle } from "lucide-react";

interface UploadZoneProps {
  accept?: string;
  label?: string;
  hint?: string;
  value?: File | null;
  previewUrl?: string;
  progress?: number;
  onFile: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function UploadZone({
  accept = "image/*",
  label = "Upload file",
  hint = "Drag & drop or click to browse",
  value,
  previewUrl,
  progress,
  onFile,
  onClear,
  disabled,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const hasFile = value || previewUrl;

  return (
    <div
      onClick={() => !disabled && !hasFile && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        width: "100%",
        borderRadius: 12,
        border: `2px dashed ${dragging ? "#C9973A" : hasFile ? "#4A8C5C" : "#D1D9CC"}`,
        background: dragging ? "rgba(201,151,58,0.04)" : hasFile ? "rgba(74,140,92,0.04)" : "#FAFAF8",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : hasFile ? "default" : "pointer",
        transition: "border-color 0.2s, background 0.2s",
        minHeight: 130,
        position: "relative",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        disabled={disabled}
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          style={{ maxHeight: 100, maxWidth: "100%", objectFit: "contain", borderRadius: 8 }}
        />
      ) : hasFile ? (
        <CheckCircle size={32} color="#4A8C5C" />
      ) : (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(201,151,58,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Upload size={22} color="#C9973A" />
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: hasFile ? "#4A8C5C" : "#1C2B1E", margin: 0 }}>
          {hasFile ? (value?.name || "File uploaded") : label}
        </p>
        {!hasFile && (
          <p style={{ fontSize: 12, color: "#8A9E8C", margin: "4px 0 0 0" }}>{hint}</p>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && progress > 0 && progress < 100 && (
        <div style={{ width: "100%", height: 4, background: "#E4E8E0", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#C9973A",
              borderRadius: 999,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Clear button */}
      {hasFile && onClear && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "rgba(140,58,58,0.1)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#8C3A3A",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
