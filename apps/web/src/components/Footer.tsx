"use client";
import NextLink from "next/link";
import { BookOpen, Mail, Phone, MapPin, Globe, Share2, Rss, Link as LinkIcon } from "lucide-react";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("common.footer");

  const footerLinks = {
    [t("categories.ministry")]: [
      { label: t("links.about"), href: "/about" },
      { label: t("links.mission"), href: "/about#mission" },
      { label: t("links.leadership"), href: "/leadership" },
      { label: t("links.trust"), href: "/about#trust" },
      { label: t("links.blog"), href: "/blog" },
    ],
    [t("categories.academics")]: [
      { label: t("links.allCourses"), href: "/courses" },
      { label: t("links.certPrograms"), href: "/courses?level=CERTIFICATE" },
      { label: t("links.dipPrograms"), href: "/courses?level=DIPLOMA" },
      { label: t("links.overview"), href: "/courses/overview" },
      { label: t("links.apply"), href: "/apply" },
    ],
    [t("categories.getInvolved")]: [
      { label: t("links.donate"), href: "/donate" },
      { label: t("links.partner"), href: "/get-involved#partner" },
      { label: t("links.scholarship"), href: "/donate#scholarship" },
      { label: t("links.prayer"), href: "/prayer" },
      { label: t("links.volunteer"), href: "/get-involved#volunteer" },
    ],
    [t("categories.support")]: [
      { label: t("links.contact"), href: "/contact" },
      { label: t("links.faq"), href: "/admissions#faq" },
      { label: t("links.portal"), href: "/login" },
      { label: t("links.privacy"), href: "/privacy" },
      { label: t("links.terms"), href: "/terms" },
    ],
  };

  return (
    <footer className="footer" role="contentinfo">
      {/* Main Footer */}
      <div className="container" style={{ padding: "5rem 1.5rem 3rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr repeat(4, 1fr)",
            gap: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(201, 168, 76, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={22} color="var(--gold-light)" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "white",
                    lineHeight: 1.1,
                  }}
                >
                  CWAY Academy
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--gold-light)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                  Coach · Challenge · Commission
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", lineHeight: 1.8, marginBottom: "1.5rem", color: "rgba(255,255,255,0.6)" }}>
              {t("info")}
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <MapPin size={14} color="var(--gold-primary)" />
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                  {t("address")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Mail size={14} color="var(--gold-primary)" />
                <a href="mailto:support@cwayacademy.com" className="footer-link" style={{ fontSize: "0.8rem" }}>
                  support@cwayacademy.com
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Phone size={14} color="var(--gold-primary)" />
                <a href="tel:+919663831220" className="footer-link" style={{ fontSize: "0.8rem" }}>
                  +91 96638 31220
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { Icon: Globe, href: "#", label: "Facebook" },
                { Icon: Share2, href: "#", label: "Twitter" },
                { Icon: Rss, href: "#", label: "Instagram" },
                { Icon: LinkIcon, href: "#", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,168,76,0.2)";
                    e.currentTarget.style.borderColor = "var(--gold-primary)";
                    e.currentTarget.style.color = "var(--gold-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--gold-light)",
                  marginBottom: "1.25rem",
                }}
              >
                {category}
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <NextLink href={link.href} className="footer-link">
                      {link.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Scripture Quote */}
        <div
          style={{
            margin: "3rem 0",
            padding: "1.5rem 2rem",
            background: "rgba(201, 168, 76, 0.08)",
            borderLeft: "3px solid var(--gold-primary)",
            borderRadius: "0 12px 12px 0",
          }}
        >
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: 0 }}>
            {t("scripture.verse")}
          </p>
          <span style={{ display: "block", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 600, letterSpacing: "0.08em" }}>
            {t("scripture.ref")}
          </span>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {t("rights")}
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <NextLink href="/privacy" className="footer-link" style={{ fontSize: "0.8rem" }}>{t("links.privacy")}</NextLink>
            <NextLink href="/terms" className="footer-link" style={{ fontSize: "0.8rem" }}>{t("links.terms")}</NextLink>
            <NextLink href="/sitemap.xml" className="footer-link" style={{ fontSize: "0.8rem" }}>{t("links.sitemap")}</NextLink>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
