"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function GlobalReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Delay initialization slightly to allow DOM to settle
    const timeout = setTimeout(() => {
      const els = document.querySelectorAll(".reveal:not(.in)");
      
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });

      els.forEach((el) => {
        obs.observe(el);
      });
      
      return () => {
        obs.disconnect();
      };
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
