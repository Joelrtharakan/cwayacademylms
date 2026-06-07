"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublicationSection({ course }: { course: any }) {
  const router = useRouter();

  const publishMut = useMutation({
    mutationFn: () => api.put(`/courses/${course.id}`, { status: "PUBLISHED" }),
    onSuccess: () => {
      toast.success("Course published successfully!");
      router.push("/instructor/courses");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to publish course"),
  });

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px #E4E8E0" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1A261D", margin: "0 0 8px 0" }}>Publication</h2>
      <p style={{ fontSize: "14px", color: "#8F9E93", marginBottom: "32px" }}>Review your course details before making it available to students.</p>

      {course.status === "PUBLISHED" ? (
        <div style={{ padding: "32px", background: "rgba(46,204,113,0.1)", border: "1px solid #2ECC71", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <CheckCircle2 size={24} color="#2ECC71" />
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1A261D", margin: "0 0 4px 0" }}>Course is Published</h3>
            <p style={{ fontSize: "14px", color: "#8F9E93", margin: 0 }}>This course is live and available for enrollment.</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: "32px", background: "rgba(243,156,18,0.1)", border: "1px solid #F39C12", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "32px" }}>
            <AlertTriangle size={24} color="#F39C12" />
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1A261D", margin: "0 0 4px 0" }}>Ready to Publish?</h3>
              <p style={{ fontSize: "14px", color: "#8F9E93", margin: "0 0 16px 0" }}>Ensure you have completed all sections in the setup checklist.</p>
              <ul style={{ fontSize: "14px", color: "#8F9E93", paddingLeft: "20px", margin: 0 }}>
                <li>Added at least one module</li>
                <li>Uploaded a course thumbnail</li>
                <li>Set the pricing and category</li>
              </ul>
            </div>
          </div>

          <button onClick={() => publishMut.mutate()} disabled={publishMut.isPending} style={{ width: "100%", padding: "16px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Globe size={20} /> {publishMut.isPending ? "Publishing..." : "Publish Course Now"}
          </button>
        </>
      )}
    </div>
  );
}
