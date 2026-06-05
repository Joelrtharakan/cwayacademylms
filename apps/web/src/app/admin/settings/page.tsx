"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { getSettings, updateSettings } from "@/lib/api/admin";

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: getSettings });

  useEffect(() => {
    if (settings.length) {
      const initial: Record<string, string> = {};
      settings.forEach((s: any) => initial[s.key] = s.value);
      setFormData(initial);
    }
  }, [settings]);

  const updateMut = useMutation({
    mutationFn: (data: Record<string, string>) => updateSettings(data),
    onSuccess: () => { toast.success("Settings updated"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to update settings"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMut.mutate(formData);
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-cway-gold border-t-transparent rounded-full animate-spin" /></div>;
  }

  const sections = [
    {
      title: "Platform Fundamentals",
      keys: ["PLATFORM_NAME", "SUPPORT_EMAIL", "CONTACT_PHONE", "WHATSAPP_NUMBER"]
    },
    {
      title: "Financial Settings",
      keys: ["CURRENCY_CODE", "CURRENCY_SYMBOL", "DEFAULT_INSTRUCTOR_PAYOUT_PERCENTAGE"]
    },
    {
      title: "Content & SEO",
      keys: ["DEFAULT_SEO_DESCRIPTION", "HOME_PAGE_HERO_TEXT"]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Platform Settings" subtitle="Configure global platform variables and preferences" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="rounded-[20px] p-7 bg-white border border-cway-light-border shadow-sm">
            <h2 className="font-serif font-bold mb-6 pb-4 text-[20px] text-[#1A261D] border-b border-cway-light-border/60">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.keys.map((key) => {
                const settingDef = settings.find((s: any) => s.key === key);
                if (!settingDef) return null;
                return (
                  <div key={key} className={settingDef.type === "TEXT" ? "col-span-full" : ""}>
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider block mb-2 text-cway-text-muted">
                      {settingDef.description || key.replace(/_/g, " ")}
                    </label>
                    {settingDef.type === "BOOLEAN" ? (
                      <select value={formData[key] || "false"} onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none cursor-pointer">
                        <option value="true">Enabled / Yes</option>
                        <option value="false">Disabled / No</option>
                      </select>
                    ) : settingDef.type === "TEXT" ? (
                      <textarea value={formData[key] || ""} onChange={(e) => handleChange(key, e.target.value)} rows={3}
                        className="w-full px-4 py-3 rounded-xl font-sans text-[14px] resize-none bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none" />
                    ) : (
                      <input value={formData[key] || ""} onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl font-sans text-[14px] bg-cway-light-bg border border-cway-light-border focus:border-cway-gold focus:ring-1 focus:ring-cway-gold text-[#1A261D] transition-all outline-none" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-start gap-4 rounded-[20px] p-6 bg-cway-danger/5 border border-cway-danger/20 shadow-sm">
          <AlertCircle size={22} className="text-cway-danger flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-sans font-bold mb-1.5 text-[15px] text-[#1A261D]">System Configuration Requires Reload</h3>
            <p className="font-sans text-[13px] text-cway-text-muted leading-relaxed">Changes to some core settings may require the application to be restarted or take up to 5 minutes to propagate across all edge nodes.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" disabled={updateMut.isPending} className="flex items-center gap-2 px-6 py-3 rounded-full font-sans text-[13px] font-bold uppercase tracking-wider transition-all bg-cway-gold text-white hover:bg-cway-gold-light hover:shadow-md border border-transparent disabled:opacity-60 disabled:cursor-not-allowed">
            <Save size={16} strokeWidth={2.5} /> {updateMut.isPending ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
