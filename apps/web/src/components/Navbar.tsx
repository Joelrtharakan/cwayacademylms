"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("home");
  const pathname = usePathname();
  const router = useRouter();

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
            prefetch={false}
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
              <img 
                src="/logo.png?v=3" 
                alt="CWAY Academy Logo" 
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
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
                  fontSize: "0.68rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                Coach · Challenge · Commission
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
                  prefetch={false}
                  style={{
                    position: "relative",
                    padding: "0.5rem 0.85rem",
                    fontWeight: 600,
                    fontSize: "0.92rem",
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

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }} className="hidden-mobile">
            <Link href="/login" className="nav-login-btn">
              LOGIN
            </Link>
            <Link 
              href="/apply" 
              className="btn-outline-gold" 
              prefetch={false}
              style={{ 
                padding: "0.6rem 1.35rem", 
                fontSize: "0.88rem", 
                borderRadius: "50px",
                border: "2px solid var(--gold-primary)",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all 0.3s"
              }}
            >
              Apply Now
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
                prefetch={false}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  fontWeight: 600,
                  color: "var(--navy-deep)",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: "0.98rem",
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
            <Link href="/login" className="mobile-login-btn">
              Login to Academy
            </Link>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(44, 74, 59, 0.08)" }}>
              <Link 
                href="/apply" 
                className="btn-outline-gold" 
                prefetch={false}
                style={{ 
                  textAlign: "center", 
                  padding: "0.75rem", 
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem"
                }}
              >
                Apply Now
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

