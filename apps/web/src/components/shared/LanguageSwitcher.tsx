"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useTransition } from "react";

const locales = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "kn", name: "ಕನ್ನಡ" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(44, 74, 59, 0.05)', padding: '4px 12px', borderRadius: '50px' }}>
      <Globe size={16} color="var(--navy-deep)" />
      <select
        disabled={isPending}
        value={locale}
        onChange={handleLanguageChange}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--navy-deep)',
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}
