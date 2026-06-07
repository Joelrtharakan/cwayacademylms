"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Lock, Bell, Wallet, ShieldCheck, Upload, Check } from "lucide-react";
import { updateMyProfile, uploadAvatar } from "@/lib/api/instructor";
import { api, useAuthStore } from "@/store/auth.store";

const GOLD = "#C9973A";
const SURFACE = "#243825";
const DARK = "#1C2B1E";
const MUTED = "#8A9E8C";

function Input({ label, error, ...props }: any) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <input {...props} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#F87171" : "rgba(201,151,58,0.25)"}`, borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", ...props.style }}
        onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = error ? "#F87171" : "rgba(201,151,58,0.25)"} />
      {error && <p style={{ color: "#F87171", fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function Textarea({ label, error, ...props }: any) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <textarea {...props} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#F87171" : "rgba(201,151,58,0.25)"}`, borderRadius: 8, padding: "10px 14px", color: "#F5F0E8", fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 120, ...props.style }}
        onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = error ? "#F87171" : "rgba(201,151,58,0.25)"} />
      {error && <p style={{ color: "#F87171", fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function InstructorSettingsPage() {
  const { user, initAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const qc = useQueryClient();

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "credentials", label: "Credentials", icon: ShieldCheck },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  // Profile Form
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || "", bio: user?.bio || "", church: user?.church || "",
      location: user?.location || "", phone: user?.phone || ""
    }
  });

  const credentialsForm = useForm({
    defaultValues: {
      title: (user as any)?.title || "",
      credentials: (user as any)?.credentials || "",
      yearsExperience: (user as any)?.yearsExperience || "",
    }
  });

  const passwordForm = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  const profileMut = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => { toast.success("Profile updated"); initAuth(); },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordMut = useMutation({
    mutationFn: (data: any) => api.put("/auth/update-password", data),
    onSuccess: () => { toast.success("Password updated"); passwordForm.reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to update password"),
  });

  const handleAvatar = async (file: File) => {
    try {
      await uploadAvatar(file);
      toast.success("Avatar updated");
      initAuth();
    } catch { toast.error("Failed to upload avatar"); }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 28, color: "#F5F0E8", marginBottom: 32 }}>Account Settings</h1>

      <div style={{ display: "flex", gap: 32 }}>
        {/* Sidebar */}
        <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {TABS.map(t => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: active ? "rgba(201,151,58,0.1)" : "transparent", border: "none", cursor: "pointer", color: active ? GOLD : MUTED, fontWeight: active ? 700 : 500, fontSize: 14, transition: "all 0.15s", textAlign: "left" }}>
                <Icon size={18} color={active ? GOLD : MUTED} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: SURFACE, border: "1px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 32 }}>
          {activeTab === "profile" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Public Profile</h2>
              
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `2px dashed rgba(201,151,58,0.4)`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={32} color={MUTED} />}
                </div>
                <div>
                  <label style={{ display: "inline-block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#F5F0E8", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleAvatar(e.target.files[0])} />
                    <Upload size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} /> Change Avatar
                  </label>
                  <p style={{ fontSize: 11, color: MUTED }}>JPG, PNG or WebP. Max 2MB.</p>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(d => profileMut.mutate(d))}>
                <Input label="Full Name *" {...profileForm.register("name", { required: "Name is required" })} error={profileForm.formState.errors.name?.message} />
                <Textarea label="Bio" {...profileForm.register("bio")} placeholder="Tell students about yourself..." />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Input label="Church Affiliation" {...profileForm.register("church")} />
                  <Input label="Location" {...profileForm.register("location")} />
                </div>
                <Input label="Phone Number" {...profileForm.register("phone")} />
                <button type="submit" disabled={profileMut.isPending} style={{ background: "#1A261D", color: "#FFFFFF", borderRadius: 100, padding: "12px 24px", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginTop: 8 }}>
                  {profileMut.isPending ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "credentials" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Academic Credentials</h2>
              <div style={{ marginBottom: 24, padding: "16px", background: "rgba(201,151,58,0.06)", borderRadius: 8, borderLeft: `3px solid ${GOLD}` }}>
                <p style={{ fontSize: 13, color: MUTED }}>These credentials will be displayed next to your name on your courses and blog posts (e.g. <strong style={{ color: "#F5F0E8" }}>Dr. John Doe, M.Th., Ph.D.</strong>)</p>
              </div>
              <form onSubmit={credentialsForm.handleSubmit(d => profileMut.mutate({ ...d, yearsExperience: d.yearsExperience ? Number(d.yearsExperience) : null }))}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                  <Input label="Title" {...credentialsForm.register("title")} placeholder="e.g. Rev., Dr., Pr." />
                  <Input label="Credentials" {...credentialsForm.register("credentials")} placeholder="e.g. M.Th., Ph.D." />
                </div>
                <Input label="Years of Experience" type="number" {...credentialsForm.register("yearsExperience")} />
                <button type="submit" disabled={profileMut.isPending} style={{ background: "#1A261D", color: "#FFFFFF", borderRadius: 100, padding: "12px 24px", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginTop: 8 }}>
                  Save Credentials
                </button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Change Password</h2>
              <form onSubmit={passwordForm.handleSubmit(d => {
                if (d.newPassword !== d.confirmPassword) { passwordForm.setError("confirmPassword", { message: "Passwords don't match" }); return; }
                passwordMut.mutate(d);
              })}>
                <Input type="password" label="Current Password *" {...passwordForm.register("currentPassword", { required: "Required" })} error={passwordForm.formState.errors.currentPassword?.message} />
                <Input type="password" label="New Password *" {...passwordForm.register("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })} error={passwordForm.formState.errors.newPassword?.message} />
                <Input type="password" label="Confirm New Password *" {...passwordForm.register("confirmPassword", { required: "Required" })} error={passwordForm.formState.errors.confirmPassword?.message} />
                <button type="submit" disabled={passwordMut.isPending} style={{ background: "#1A261D", color: "#FFFFFF", borderRadius: 100, padding: "12px 24px", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginTop: 8 }}>
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, color: "#F5F0E8", marginBottom: 24 }}>Notification Preferences</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { id: "email_new_student", label: "New student enrollment", desc: "Get an email when someone buys your course" },
                  { id: "email_new_review", label: "New course review", desc: "Get notified when a student leaves a review" },
                  { id: "email_assignment", label: "Assignment submitted", desc: "Get notified when a student submits an assignment" },
                  { id: "email_message", label: "Direct messages", desc: "Get notified when a student messages you" },
                ].map(n => (
                  <label key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F5F0E8" }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{n.desc}</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: GOLD, width: 18, height: 18 }} />
                  </label>
                ))}
              </div>
              <button style={{ background: "#1A261D", color: "#FFFFFF", borderRadius: 100, padding: "12px 24px", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginTop: 24 }}>
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
