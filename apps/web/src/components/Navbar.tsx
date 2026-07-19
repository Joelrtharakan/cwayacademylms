"use client";

import { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Menu, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./shared/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";



export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("home");
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const locale = useLocale();
  const isEn = locale === 'en';

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.courses"), href: "/courses" },
    { label: t("nav.getInvolved"), href: "/get-involved" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || "home";
      setCurrentHash(hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If the user clicks the link for the page they are ALREADY on, scroll to top instantly
    if (href === pathname) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileOpen(false);
      return;
    }
    
    if (href.startsWith("/#")) {
      const targetId = href.substring(2);
      if (pathname === "/") {
        e.preventDefault();
        window.location.hash = targetId;
      }
    }
  };

  return (
    <nav
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled
          ? "rgba(250, 250, 247, 0.85)"
          : "rgba(250, 250, 247, 0.7)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(44, 74, 59, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        height: scrolled ? "72px" : "84px",
        display: "flex",
        alignItems: "center",
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "/#home")}
            style={{ display: "flex", alignItems: "center", gap: "0.85rem", textDecoration: "none" }}
            aria-label="CWAY Academy Home"
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(44, 74, 59, 0.15)",
                border: "2px solid rgba(212, 163, 91, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "white"
              }}
            >
              <Image 
                src="/logo.png" 
                alt="CWAY Academy Logo" 
                width={44}
                height={44}
                priority
                style={{ objectFit: "contain", display: "block" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.35rem",
                  color: "var(--navy-deep)",
                  lineHeight: 1.1,
                  letterSpacing: "0.02em",
                }}
              >
                <span style={{ fontWeight: 700 }}>CWAY</span> <span style={{ color: "var(--gold-primary)", fontWeight: 400, letterSpacing: "1px" }}>ACADEMY</span>
              </div>
              <div
                style={{
                  fontSize: isEn ? "0.68rem" : "0.78rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                {t("nav.slogan")}
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            className="hidden-mobile"
          >
            {navLinks.map((link) => {
              const hash = link.href.substring(2);
              const isActive = pathname === "/" && currentHash === hash;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  style={{
                    position: "relative",
                    padding: "0.5rem 0.85rem",
                    fontWeight: 600,
                    fontSize: isEn ? "0.92rem" : "1.05rem",
                    color: isActive ? "var(--gold-primary)" : "var(--navy-deep)",
                    textDecoration: "none",
                    transition: "color 0.3s ease",
                    letterSpacing: "0.03em",
                  }}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeUnderline"
                      style={{
                        position: "absolute",
                        bottom: "-4px",
                        left: "0.85rem",
                        right: "0.85rem",
                        height: "2px",
                        background: "linear-gradient(90deg, var(--gold-primary), var(--gold-light))",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons & Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }} className="hidden-mobile">
            <LanguageSwitcher />
            <Link 
              href="/login"
              style={{ 
                padding: "0.6rem 1.35rem", 
                fontSize: isEn ? "0.88rem" : "1rem", 
                borderRadius: "50px",
                background: "#2C4A3B",
                color: "#FFFFFF",
                border: "2px solid #2C4A3B",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all 0.3s",
                letterSpacing: "1px",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(44, 74, 59, 0.15)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#2C4A3B";
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2C4A3B";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(44, 74, 59, 0.15)";
              }}
            >
              {t("nav.login")}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            style={{
              background: "rgba(44, 74, 59, 0.05)",
              border: "none",
              cursor: "pointer",
              padding: "0.55rem",
              borderRadius: "10px",
              color: "var(--navy-deep)",
              display: "none",
              transition: "background 0.3s"
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: scrolled ? "72px" : "84px",
              left: 0,
              right: 0,
              background: "rgba(250, 250, 247, 0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(44, 74, 59, 0.08)",
              padding: "1.5rem",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setMobileOpen(false);
                }}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  fontWeight: 600,
                  color: "var(--navy-deep)",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: isEn ? "0.98rem" : "1.1rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--cream-mid)";
                  e.currentTarget.style.color = "var(--gold-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--navy-deep)";
                }}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="mobile-nav-divider"></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(44, 74, 59, 0.08)" }}>
              <Link 
                href="/login"
                style={{ 
                  textAlign: "center", 
                  padding: "0.75rem", 
                  borderRadius: "50px",
                  background: "#2C4A3B",
                  color: "#FFFFFF",
                  border: "2px solid #2C4A3B",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: isEn ? "0.95rem" : "1.05rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase"
                }}
              >
                {t("nav.login")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-login-btn {
          display: inline-flex;
          align-items: center;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #C9973A;
          background: transparent;
          border: 1.5px solid #C9973A;
          border-radius: 999px;
          padding: 8px 24px;
          text-decoration: none;
          transition: background 200ms ease, color 200ms ease;
          white-space: nowrap;
          margin-right: 8px;
        }

        .nav-login-btn:hover {
          background: #C9973A;
          color: #1C2B1E;
        }

        .nav-login-btn:focus-visible {
          outline: 2px solid #C9973A;
          outline-offset: 3px;
        }

        .mobile-nav-divider {
          height: 1px;
          background: rgba(201, 151, 58, 0.25);
          margin: 8px 0;
          list-style: none;
        }

        .mobile-login-btn {
          display: block;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #C9973A;
          background: rgba(201, 151, 58, 0.08);
          border: 1.5px solid #C9973A;
          border-radius: 999px;
          padding: 10px 24px;
          text-decoration: none;
          text-align: center;
          margin: 4px 0;
          transition: background 200ms ease;
        }

        .mobile-login-btn:hover,
        .mobile-login-btn:active {
          background: #C9973A;
          color: #1C2B1E;
        }

        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
          .nav-login-btn { display: none !important; }
        }
        @media (min-width: 901px) {
          .show-mobile { display: none !important; }
          .mobile-login-btn,
          .mobile-nav-divider { display: none !important; }
        }
        /* Underline animation on hover */
        .hidden-mobile a:hover .nav-underline {
          opacity: 1 !important;
          transform: scaleX(1) !important;
        }
      `}</style>
    </nav>
  );
}

