import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-80">
      <Loader2 className="w-12 h-12 text-[#B88645] animate-spin mb-6" />
      <p className="font-sans text-[14px] font-semibold text-[#5C7360] uppercase tracking-[0.15em]">
        Loading Interface...
      </p>
    </div>
  );
}
