"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  danger,
  loading,
}: ConfirmDialogProps) {
  // Prevent scrolling when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(26,38,29,0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onOpenChange(false);
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 24px 48px rgba(26,38,29,0.15)",
          overflow: "hidden",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ padding: "32px", position: "relative" }}>
          {/* Close button */}
          <button
            onClick={() => !loading && onOpenChange(false)}
            disabled={loading}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#F7F8F5",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading ? "not-allowed" : "pointer",
              color: "#9AAE9B",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#E4E8E0";
                e.currentTarget.style.color = "#1A261D";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#F7F8F5";
                e.currentTarget.style.color = "#9AAE9B";
              }
            }}
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: danger ? "rgba(176,58,46,0.1)" : "rgba(184,134,69,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {danger ? (
              <AlertTriangle size={28} style={{ color: "#B03A2E" }} />
            ) : (
              <Info size={28} style={{ color: "#B88645" }} />
            )}
          </div>

          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "24px",
              fontWeight: 700,
              color: "#1A261D",
              margin: "0 0 12px 0",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>

          <div
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "#677E6A",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {description}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "24px 32px",
            background: "#F7F8F5",
            borderTop: "1px solid #E4E8E0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "1px solid #E4E8E0",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1A261D",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = "#B88645";
                e.currentTarget.style.color = "#B88645";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = "#E4E8E0";
                e.currentTarget.style.color = "#1A261D";
              }
            }}
          >
            {cancelLabel}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              background: danger ? "#B03A2E" : "#B88645",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: danger ? "0 4px 12px rgba(176,58,46,0.25)" : "0 4px 12px rgba(184,134,69,0.25)",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = danger ? "0 6px 16px rgba(176,58,46,0.3)" : "0 6px 16px rgba(184,134,69,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = danger ? "0 4px 12px rgba(176,58,46,0.25)" : "0 4px 12px rgba(184,134,69,0.25)";
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#FFFFFF",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Loading...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
