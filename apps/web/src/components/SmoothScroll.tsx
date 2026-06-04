"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

function RouteScroller() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      // Delay slightly to ensure Next.js has mounted the new route's DOM before scrolling to top
      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true });
      });
    }
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <RouteScroller />
      {children}
    </ReactLenis>
  );
}
