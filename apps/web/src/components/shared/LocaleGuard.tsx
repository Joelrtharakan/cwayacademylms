"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";

const LOCALE_KEY = "cway-locale";

export function saveLocale(locale: string) {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {}
}

export function getStoredLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_KEY);
  } catch {
    return null;
  }
}

export function LocaleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = getStoredLocale();
    if (!stored) return;

    const actual = window.location.pathname.split("/")[1];
    const known = ["en", "hi", "ta", "te", "ml", "kn"];

    if (known.includes(actual) && actual !== stored) {
      router.replace(pathname, { locale: stored });
    } else if (!known.includes(actual)) {
      router.replace(pathname, { locale: stored });
    }
  }, [router, pathname]);

  return <>{children}</>;
}
