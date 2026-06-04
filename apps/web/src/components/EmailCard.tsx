"use client";

import { useState } from "react";
import { Mail, Copy, Check, ArrowUpRight } from "lucide-react";

export function EmailCard() {
  const [copied, setCopied] = useState(false);
  const email = "support@cwayacademy.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGmailCompose = () => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank");
  };

  return (
    <div
      className="card-cream"
      style={{
        padding: "1.75rem 1.5rem",
        width: "100%",
        maxWidth: "380px",
        textAlign: "left",
        margin: "0 auto",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Header section with Icon & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="feature-icon" style={{ width: "44px", height: "44px", borderRadius: "10px" }}>
          <Mail size={18} />
        </div>
        <div>
          <h3 
            style={{ 
              fontSize: "1.25rem", 
              fontWeight: 600, 
              margin: 0, 
              color: "var(--navy-deep)",
              fontFamily: "var(--font-serif)"
            }}
          >
            Email Us
          </h3>
          <p 
            style={{ 
              color: "var(--text-secondary)", 
              margin: "0.15rem 0 0 0", 
              fontSize: "0.85rem",
              fontFamily: "var(--font-sans)"
            }}
          >
            Response within 24 hours
          </p>
        </div>
      </div>

      {/* Email copy block */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--cream-base)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem 1rem",
          marginBottom: "1.25rem",
        }}
      >
        <code 
          style={{ 
            fontSize: "0.875rem", 
            fontFamily: "var(--font-mono), monospace", 
            color: "var(--navy-deep)",
            wordBreak: "break-all",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            paddingRight: "0.5rem"
          }}
        >
          {email}
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            color: copied ? "var(--success)" : "var(--text-muted)",
            cursor: "pointer",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
            flexShrink: 0,
          }}
          aria-label="Copy email address"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {/* Action Buttons (styled as flex row/col to prevent Tailwind SVG block resets from wrapping the icons) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        <button
          onClick={handleGmailCompose}
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            width: "100%",
            fontSize: "0.8rem",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "none",
            cursor: "pointer"
          }}
        >
          Compose in Gmail <ArrowUpRight size={16} style={{ display: "inline-block", flexShrink: 0 }} />
        </button>

        <a
          href={`mailto:${email}`}
          className="btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            width: "100%",
            fontSize: "0.8rem",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            textAlign: "center",
            cursor: "pointer",
            textDecoration: "none"
          }}
        >
          Open Default Mail App
        </a>
      </div>
    </div>
  );
}
