"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { saveLocale } from "./LocaleGuard";

const locales = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "kn", name: "ಕನ್ನಡ" },
];

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = locales.find((l) => l.code === locale) || locales[0];

  const handleLanguageChange = (newLocale: string) => {
    setLocaleCookie(newLocale);
    saveLocale(newLocale);
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(44, 74, 59, 0.05)",
          padding: "6px 14px",
          borderRadius: "50px",
          border: isOpen ? "2px solid #C9973A" : "2px solid transparent",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "var(--navy-deep)",
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        }}
      >
        <Globe size={16} />
        <span>{current.name}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "0",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            border: "1px solid rgba(44,74,59,0.1)",
            minWidth: "160px",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: l.code === locale ? "rgba(44,74,59,0.06)" : "transparent",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "var(--navy-deep)",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(44,74,59,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = l.code === locale ? "rgba(44,74,59,0.06)" : "transparent"}
            >
              <span style={{ flex: 1 }}>{l.name}</span>
              {l.code === locale && <Check size={16} color="#C9973A" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
