"use client";

import React from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

export default function AdminBlogPage() {
  return (
    <div>
      <PageHeader title="Blog Posts" subtitle="Manage editorial content published on CWAY Academy" />
      <div
        className="flex flex-col items-center justify-center py-24 rounded-2xl"
        style={{ background: "#FFFFFF", border: "1px solid #E8EBE4", boxShadow: "0 1px 4px rgba(26,38,29,0.04)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(184,134,69,0.08)" }}
        >
          <FileText size={26} style={{ color: "#B88645" }} />
        </div>
        <p className="text-[16px] font-semibold mb-1" style={{ color: "#1A261D" }}>Blog Management</p>
        <p className="text-[14px] font-medium" style={{ color: "#8F9E93" }}>
          Blog management will be available in a future update.
        </p>
      </div>
    </div>
  );
}
