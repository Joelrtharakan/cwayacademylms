"use client";
import NextLink from "next/link";
import { BookOpen, Mail, Phone, MapPin, Globe, Share2, Rss, Link as LinkIcon } from "lucide-react";

const footerLinks = {
  "Ministry": [
    { label: "About CWAY", href: "/about" },
    { label: "Our Mission", href: "/about#mission" },
    { label: "Leadership Team", href: "/leadership" },
    { label: "CWAY Missions Trust", href: "/about#trust" },
    { label: "Blog & Insights", href: "/blog" },
  ],
  "Academics": [
    { label: "All Courses", href: "/courses" },
    { label: "Certificate Programs", href: "/courses?level=CERTIFICATE" },
    { label: "Diploma Programs", href: "/courses?level=DIPLOMA" },
    { label: "Course Overview", href: "/courses/overview" },
    { label: "Apply Now", href: "/apply" },
  ],
  "Get Involved": [
    { label: "Donate", href: "/donate" },
    { label: "Partnership", href: "/get-involved#partner" },
    { label: "Scholarship Fund", href: "/donate#scholarship" },
    { label: "Prayer Requests", href: "/prayer" },
    { label: "Volunteer", href: "/get-involved#volunteer" },
  ],
  "Support": [
    { label: "Contact Us", href: "/contact" },
    { label: "Admissions FAQ", href: "/admissions#faq" },
    { label: "Student Portal", href: "/login" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
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
              Equipping rural pastors, lay leaders, and Christian disciples through Bible-based theological education and leadership training in local Indian languages.
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <MapPin size={14} color="var(--gold-primary)" />
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                  Bangalore, Karnataka, India
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
                    <NextLink href={link.href} className="footer-link" prefetch={false}>
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
            "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you."
          </p>
          <span style={{ display: "block", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 600, letterSpacing: "0.08em" }}>
            — Matthew 28:19–20 (ESV)
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
            © 2026 CWAY Academy — A Ministry of CWAY Missions, Bangalore, India. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <NextLink href="/privacy" className="footer-link" style={{ fontSize: "0.8rem" }} prefetch={false}>Privacy Policy</NextLink>
            <NextLink href="/terms" className="footer-link" style={{ fontSize: "0.8rem" }} prefetch={false}>Terms of Service</NextLink>
            <NextLink href="/sitemap.xml" className="footer-link" style={{ fontSize: "0.8rem" }} prefetch={false}>Sitemap</NextLink>
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
