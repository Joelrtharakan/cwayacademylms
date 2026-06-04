"use client";

import { Mail, Phone, Clock, ArrowRight } from "lucide-react";

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block" }}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.863-9.856.002-2.634-1.02-5.11-2.879-6.97C16.39 1.97 13.916 1.94 11.282 1.94c-5.439 0-9.863 4.418-9.865 9.858-.002 1.995.525 3.943 1.529 5.672L1.879 21.84l4.768-1.252zM17.526 14.3c-.3-.149-1.772-.875-2.046-.975-.276-.101-.476-.149-.676.15-.199.299-.772.975-.946 1.173-.174.199-.349.224-.649.075-.3-.149-1.266-.467-2.41-1.485-.89-.793-1.49-1.773-1.665-2.072-.174-.3-.019-.462.13-.611.135-.134.3-.349.45-.523.149-.174.199-.299.299-.498.1-.199.05-.374-.025-.524-.075-.15-.676-1.627-.925-2.226-.243-.584-.488-.507-.676-.517-.174-.01-.375-.01-.575-.01-.2 0-.525.075-.8.374-.276.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.199 2.113 3.227 5.125 4.527.717.31 1.276.495 1.713.634.72.228 1.375.196 1.893.118.578-.088 1.772-.724 2.022-1.388.249-.664.249-1.233.174-1.353-.075-.12-.275-.199-.575-.349z" />
  </svg>
);

export function ContactContent() {
  return (
    <div style={{ width: "100%", position: "relative", zIndex: 2 }}>
      
      {/* 3-Card Deck Grid */}
      <div className="contact-deck-grid">
        {/* WhatsApp Card */}
        <a 
          href="https://wa.me/919663831220" 
          target="_blank" 
          rel="noopener noreferrer"
          className="contact-redesign-card whatsapp"
        >
          {/* Circular Backdrop Icon */}
          <div 
            style={{ 
              width: "64px", 
              height: "64px", 
              borderRadius: "50%", 
              background: "rgba(37, 211, 102, 0.08)", 
              color: "#25D366",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginBottom: "24px",
              flexShrink: 0
            }}
          >
            <WhatsAppIcon size={32} />
          </div>

          <span className="label" style={{ color: "var(--text-muted)", letterSpacing: "1.5px", fontSize: "11px", marginBottom: "8px" }}>
            WhatsApp Chat
          </span>

          <h3 className="contact-card-title">
            +91 96638 31220
          </h3>

          <p 
            className="body-text" 
            style={{ 
              fontSize: "14px", 
              lineHeight: 1.6, 
              color: "#5A6B5D", 
              marginBottom: "28px",
              flexGrow: 1
            }}
          >
            Connect instantly with our support team for course details, admission help, and general chat support.
          </p>

          <div 
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "#25D366",
              color: "#FFFFFF",
              borderRadius: "30px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "background 0.3s"
            }}
          >
            Chat Now <ArrowRight size={14} />
          </div>
        </a>

        {/* Email Card */}
        <a 
          href="https://mail.google.com/mail/?view=cm&fs=1&to=support@cwayacademy.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="contact-redesign-card email"
        >
          {/* Circular Backdrop Icon */}
          <div 
            style={{ 
              width: "64px", 
              height: "64px", 
              borderRadius: "50%", 
              background: "rgba(184, 134, 69, 0.08)", 
              color: "var(--accent-gold)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginBottom: "24px",
              flexShrink: 0
            }}
          >
            <Mail size={28} />
          </div>

          <span className="label" style={{ color: "var(--text-muted)", letterSpacing: "1.5px", fontSize: "11px", marginBottom: "8px" }}>
            Email Inquiries
          </span>

          <h3 className="contact-card-title">
            support@cwayacademy.com
          </h3>

          <p 
            className="body-text" 
            style={{ 
              fontSize: "14px", 
              lineHeight: 1.6, 
              color: "#5A6B5D", 
              marginBottom: "28px",
              flexGrow: 1
            }}
          >
            Send us formal inquiries, partnership proposals, and your required documents.
          </p>

          <div 
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "var(--accent-gold)",
              color: "#FFFFFF",
              borderRadius: "30px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "background 0.3s"
            }}
          >
            Send Email <ArrowRight size={14} />
          </div>
        </a>

        {/* Phone Card */}
        <a 
          href="tel:+919663831220" 
          className="contact-redesign-card phone"
        >
          {/* Circular Backdrop Icon */}
          <div 
            style={{ 
              width: "64px", 
              height: "64px", 
              borderRadius: "50%", 
              background: "rgba(44, 74, 59, 0.08)", 
              color: "var(--accent-green)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginBottom: "24px",
              flexShrink: 0
            }}
          >
            <Phone size={26} />
          </div>

          <span className="label" style={{ color: "var(--text-muted)", letterSpacing: "1.5px", fontSize: "11px", marginBottom: "8px" }}>
            Phone Inquiries
          </span>

          <h3 className="contact-card-title">
            +91 96638 31220
          </h3>

          <p 
            className="body-text" 
            style={{ 
              fontSize: "14px", 
              lineHeight: 1.6, 
              color: "#5A6B5D", 
              marginBottom: "28px",
              flexGrow: 1
            }}
          >
            Call our Bangalore office to talk directly with an admissions coordinator during office hours.
          </p>

          <div 
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "var(--accent-green)",
              color: "#FFFFFF",
              borderRadius: "30px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "background 0.3s"
            }}
          >
            Call Office <ArrowRight size={14} />
          </div>
        </a>
      </div>

      {/* Clean Bottom working Hours block to match home page style */}
      <div className="reveal contact-hours-block">
        <div className="contact-hours-info">
          <div 
            style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "10px", 
              background: "rgba(44, 74, 59, 0.06)", 
              color: "var(--accent-green)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Clock size={22} />
          </div>
          <div style={{ textAlign: "left" }}>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--accent-green)", fontFamily: "var(--font-serif, Georgia, serif)" }}>
              Office Working Hours
            </h4>
            <p className="body-text" style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Monday – Friday: 9am – 5pm IST | Saturday: 9am – 1pm IST (Sunday Closed)
            </p>
          </div>
        </div>

        <div className="contact-hours-quote">
          <p style={{ margin: 0, fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontSize: "14px", color: "var(--accent-green)", lineHeight: 1.5 }}>
            "Commit your work to the Lord, and your plans will be established."
          </p>
          <span style={{ display: "block", marginTop: "4px", fontSize: "11px", color: "var(--accent-gold)", fontWeight: 700, letterSpacing: "1px" }}>
            — Proverbs 16:3
          </span>
        </div>
      </div>

    </div>
  );
}
