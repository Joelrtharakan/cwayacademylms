"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, AlertCircle, Settings2, Database } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { getSettings, updateSettings } from "@/lib/api/admin";

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: settings = {}, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: getSettings });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        siteName: settings.siteName || "",
        tagline: settings.tagline || "",
        contactEmail: settings.contactEmail || "",
        contactWhatsApp: settings.contactWhatsApp || "",
        primaryColor: settings.primaryColor || "",
        smtpConfig: settings.smtpConfig || "",
        stripeConfig: settings.stripeConfig || "",
        storageConfig: settings.storageConfig || "",
      });
    }
  }, [settings]);

  const updateMut = useMutation({
    mutationFn: (data: Record<string, string>) => updateSettings(data),
    onSuccess: () => { toast.success("Settings updated successfully"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
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
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-60">
        <div className="w-10 h-10 border-3 border-[#B88645] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-[13px] font-semibold text-[#8F9E93] uppercase tracking-widest">Loading Settings...</p>
      </div>
    );
  }

  const sections = [
    {
      title: "Platform Fundamentals",
      icon: Settings2,
      description: "Core identity and contact information for the academy.",
      fields: [
        { key: "siteName", label: "Platform Name", type: "TEXT" },
        { key: "tagline", label: "Tagline", type: "TEXT" },
        { key: "contactEmail", label: "Support Email", type: "TEXT" },
        { key: "contactWhatsApp", label: "WhatsApp Number", type: "TEXT" },
        { key: "primaryColor", label: "Primary Brand Color (Hex)", type: "TEXT" },
      ]
    },
    {
      title: "Advanced Configuration",
      icon: Database,
      description: "JSON configuration blocks for external services and integrations.",
      fields: [
        { key: "smtpConfig", label: "SMTP Configuration (JSON)", type: "TEXT_AREA" },
        { key: "stripeConfig", label: "Stripe Configuration (JSON)", type: "TEXT_AREA" },
        { key: "storageConfig", label: "Storage Configuration (JSON)", type: "TEXT_AREA" },
      ]
    }
  ];

  return (
    <div className="max-w-[900px] pb-16">
      <PageHeader 
        title="Platform Settings" 
        subtitle="Configure global platform variables, integrations, and branding preferences" 
      />

      <form onSubmit={handleSubmit} className="mt-8" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl bg-white border border-cway-cream-dark shadow-sm overflow-hidden">
            <div className="border-b border-cway-cream-dark bg-cway-cream" style={{ padding: "24px 32px" }}>
              <h2 className="font-serif font-bold text-xl text-cway-dark-green mb-1 flex items-center gap-3">
                <section.icon size={20} className="text-cway-gold" />
                {section.title}
              </h2>
              <p className="font-sans text-sm text-cway-text-muted mt-1">
                {section.description}
              </p>
            </div>
            
            <div className="bg-white">
              <div className="flex flex-col">
                {section.fields.map((field, index) => (
                  <div 
                    key={field.key} 
                    className={`flex flex-col md:flex-row md:items-start ${index !== section.fields.length - 1 ? 'border-b border-cway-cream-dark' : ''}`}
                    style={{ padding: "28px 32px", gap: "32px" }}
                  >
                    <div className="w-full md:w-1/3" style={{ paddingTop: "8px" }}>
                      <label className="block font-sans text-[15px] font-bold text-cway-dark-green">
                        {field.label}
                      </label>
                      <p className="text-[14px] text-cway-text-muted mt-1 font-medium leading-relaxed" style={{ paddingRight: "16px", marginTop: "6px" }}>
                        {field.type === "TEXT_AREA" ? "Provide a valid JSON configuration block." : `Set your ${field.label.toLowerCase()}.`}
                      </p>
                    </div>
                    
                    <div className="w-full md:w-2/3">
                      {field.type === "TEXT_AREA" ? (
                        <textarea 
                          value={formData[field.key] || ""} 
                          onChange={(e) => handleChange(field.key, e.target.value)} 
                          rows={6}
                          placeholder="{}"
                          className="w-full font-mono text-[14px] leading-relaxed resize-y bg-cway-cream border border-cway-cream-dark text-cway-dark-green outline-none focus:bg-white focus:border-cway-gold" 
                          style={{ padding: "14px 16px", borderRadius: "10px", minHeight: "120px", transition: "all 0.2s" }}
                        />
                      ) : (
                        <div className="relative">
                          <input 
                            value={formData[field.key] || ""} 
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder="Not set"
                            className="w-full font-sans text-[15px] font-medium bg-cway-cream border border-cway-cream-dark text-cway-dark-green outline-none focus:bg-white focus:border-cway-gold" 
                            style={{ padding: "12px 16px", borderRadius: "10px", transition: "all 0.2s" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-start gap-4 rounded-2xl bg-cway-danger/5 border border-cway-danger/20 shadow-sm" style={{ marginTop: "24px", padding: "24px" }}>
          <AlertCircle size={24} className="text-cway-danger flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <h3 className="font-sans font-bold mb-1 text-[15px] text-cway-dark-green">System Configuration Requires Reload</h3>
            <p className="font-sans text-[14px] text-cway-text-muted leading-relaxed">Changes to core financial and platform settings may require the application to be restarted or take up to 5 minutes to propagate across all edge nodes.</p>
          </div>
        </div>

        <div className="flex justify-end border-t border-cway-cream-dark" style={{ paddingTop: "24px", paddingBottom: "32px", marginTop: "16px" }}>
          <button 
            type="submit" 
            disabled={updateMut.isPending} 
            className="flex items-center gap-2 rounded-xl font-sans text-[14px] font-bold uppercase tracking-wider transition-all bg-cway-dark-green text-white hover:bg-cway-forest hover:shadow-lg border border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ padding: "14px 32px" }}
          >
            <Save size={18} strokeWidth={2.5} /> 
            {updateMut.isPending ? "Saving configuration..." : "Save All Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
