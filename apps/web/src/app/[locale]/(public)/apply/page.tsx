"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplyPage() {
  const router = useRouter();

  useEffect(() => {
    // BUG-004 FIX: The generic /apply page was a dead-end mock form.
    // Real applications require selecting a specific program first at /programs/[id]/apply.
    router.replace("/programs");
  }, [router]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-secondary)" }}>Redirecting to Programs page to choose an application track...</p>
    </div>
  );
}
