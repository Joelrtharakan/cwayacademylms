"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Lock, Bell, Wallet, ShieldCheck, Upload, Check, Camera } from "lucide-react";
import { updateMyProfile, uploadAvatar } from "@/lib/api/instructor";
import { api, useAuthStore } from "@/store/auth.store";

const GOLD = "#B88645";
const GOLD_LIGHT = "rgba(184,134,69,0.15)";
const GOLD_GRADIENT = "linear-gradient(135deg, #C9973A 0%, #A3763A 100%)";
const SURFACE = "#FFFFFF";
const DARK = "#1A261D";
const MUTED = "#8F9E93";
const BORDER = "#E4E8E0";
const BG_ALT = "#F7F8F5";

function Input({ label, error, ...props }: any) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: focused ? GOLD : DARK, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input 
          {...props} 
          style={{ 
            width: "100%", 
            background: SURFACE, 
            border: `1px solid ${error ? "#EF4444" : focused ? GOLD : BORDER}`, 
            borderRadius: 10, 
            padding: "14px 16px", 
            color: DARK, 
            fontSize: 15, 
            outline: "none", 
            boxSizing: "border-box", 
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: focused ? `0 0 0 4px ${GOLD_LIGHT}` : "0 2px 4px rgba(0,0,0,0.01)",
            ...props.style 
          }}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }} 
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }} 
        />
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: "#EF4444", fontSize: 13, fontWeight: 500 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#EF4444" }}/>
          {error}
        </div>
      )}
    </div>
  );
}

function Textarea({ label, error, ...props }: any) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: focused ? GOLD : DARK, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <textarea 
          {...props} 
          style={{ 
            width: "100%", 
            background: SURFACE, 
            border: `1px solid ${error ? "#EF4444" : focused ? GOLD : BORDER}`, 
            borderRadius: 10, 
            padding: "16px", 
            color: DARK, 
            fontSize: 15, 
            outline: "none", 
            boxSizing: "border-box", 
            resize: "vertical", 
            minHeight: 140, 
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", 
            overflowY: "auto", 
            boxShadow: focused ? `0 0 0 4px ${GOLD_LIGHT}` : "0 2px 4px rgba(0,0,0,0.01)",
            lineHeight: 1.6,
            ...props.style 
          }}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }} 
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }} 
          onWheel={(e) => {
            const target = e.currentTarget;
            const isScrollingDown = e.deltaY > 0;
            const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
            const isAtTop = target.scrollTop <= 0;
            
            if ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop)) {
              e.stopPropagation();
            }
          }}
        />
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: "#EF4444", fontSize: 13, fontWeight: 500 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#EF4444" }}/>
          {error}
        </div>
      )}
    </div>
  );
}

function SaveButton({ isPending, label }: { isPending: boolean, label: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <button 
      type="submit" 
      disabled={isPending} 
      style={{ 
        background: GOLD_GRADIENT, 
        color: "#FFFFFF", 
        borderRadius: 10, 
        padding: "14px 32px", 
        fontWeight: 700, 
        fontSize: 15, 
        border: "none", 
        cursor: "pointer", 
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isHovered ? "0 8px 20px rgba(184,134,69,0.3)" : "0 4px 10px rgba(184,134,69,0.15)",
        transform: isActive ? "scale(0.97)" : isHovered ? "translateY(-2px)" : "none",
        opacity: isPending ? 0.7 : 1
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {isPending ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="spinner-border" style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          Saving...
        </div>
      ) : label}
    </button>
  );
}

export default function StudentSettingsPage() {
  const { user, refreshUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const qc = useQueryClient();

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  // Forms
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || "", bio: user?.bio || "", church: user?.church || "",
      location: user?.location || "", phone: user?.phone || ""
    }
  });



  const passwordForm = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  // Sync state when user updates
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "", bio: user.bio || "", church: user.church || "",
        location: user.location || "", phone: user.phone || ""
      });
    }
  }, [user, profileForm]);

  const profileMut = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => { toast.success("Profile updated"); refreshUser(); },
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
      refreshUser();
    } catch { toast.error("Failed to upload avatar"); }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 24,
      maxWidth: 1000,
      margin: "0 auto",
      width: "100%"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .tab-content { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .avatar-hover-overlay { opacity: 0; transition: all 0.3s ease; }
        .avatar-container:hover .avatar-hover-overlay { opacity: 1; backdrop-filter: blur(4px); }
        .avatar-container:hover img { transform: scale(1.05); }
      `}</style>

      {/* Hero Header Area */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #B88645 0%, #8A6433 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(184,134,69,0.25)" }}>
            <User size={24} color="#FFFFFF" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: DARK, margin: 0, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Account Settings</h1>
            <p style={{ color: MUTED, fontSize: 14, margin: "4px 0 0 0", fontWeight: 500 }}>Manage your personal information and preferences.</p>
          </div>
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        background: SURFACE, 
        border: `1px solid ${BORDER}`, 
        borderRadius: 24, 
        overflow: "hidden", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        minHeight: 500
      }}>
        {/* Unified Sidebar */}
        <div style={{ 
          width: 260, 
          flexShrink: 0, 
          display: "flex", 
          flexDirection: "column", 
          gap: 6,
          background: "#FAFAFA",
          borderRight: `1px solid ${BORDER}`,
          padding: "32px 20px"
        }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px 16px" }}>Settings Menu</h3>
          {TABS.map(t => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 14, 
                  padding: "14px 16px", 
                  borderRadius: 10, 
                  background: active ? SURFACE : "transparent", 
                  border: "none", 
                  cursor: "pointer", 
                  color: active ? DARK : MUTED, 
                  fontWeight: active ? 700 : 500, 
                  fontSize: 15, 
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", 
                  textAlign: "left",
                  boxShadow: active ? "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                    e.currentTarget.style.color = DARK;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = MUTED;
                  }
                }}
              >
                <Icon size={18} color={active ? GOLD : MUTED} strokeWidth={active ? 2.5 : 2} style={{ transition: "all 0.2s" }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="tab-content" key={activeTab} style={{ flex: 1, padding: 32, background: SURFACE }}>
          {activeTab === "profile" && (
            <div>
              <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: `1px solid ${BORDER}` }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: DARK, margin: "0 0 8px 0", fontWeight: 700 }}>Public Profile</h2>
                <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>This information will be displayed publicly so be careful what you share.</p>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 48 }}>
                <div className="avatar-container" style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", background: user?.avatar ? "transparent" : BG_ALT, border: user?.avatar ? `2px solid ${SURFACE}` : `2px dashed ${BORDER}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", cursor: "pointer" }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                  ) : (
                    <User size={48} color={MUTED} strokeWidth={1.5} />
                  )}
                  <label className="avatar-hover-overlay" style={{ position: "absolute", inset: 0, background: "rgba(26, 38, 29, 0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFF", cursor: "pointer", gap: 6 }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleAvatar(e.target.files[0])} />
                    <Camera size={24} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Change</span>
                  </label>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 700, color: DARK }}>Profile Picture</h3>
                  <p style={{ fontSize: 14, color: MUTED, margin: 0, maxWidth: 300, lineHeight: 1.5 }}>We recommend a square image, at least 400x400px. JPG, PNG or WebP formats up to 2MB.</p>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(d => profileMut.mutate(d))}>
                <Input label="Full Name *" {...profileForm.register("name", { required: "Name is required" })} error={profileForm.formState.errors.name?.message} />
                <Textarea label="Biography" {...profileForm.register("bio")} placeholder="Write a brief professional summary about yourself..." />
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 8 }}>
                  <Input label="Church Affiliation" {...profileForm.register("church")} />
                  <Input label="Location" {...profileForm.register("location")} />
                </div>
                <Input label="Phone Number" {...profileForm.register("phone")} />
                
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                  <SaveButton isPending={profileMut.isPending} label="Save Profile Updates" />
                </div>
              </form>
            </div>
          )}



          {activeTab === "password" && (
            <div>
              <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: `1px solid ${BORDER}` }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: DARK, margin: "0 0 8px 0", fontWeight: 700 }}>Change Password</h2>
                <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Ensure your account is using a long, random password to stay secure.</p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(d => {
                if (d.newPassword !== d.confirmPassword) { passwordForm.setError("confirmPassword", { message: "Passwords don't match" }); return; }
                passwordMut.mutate(d);
              })}>
                <Input type="password" label="Current Password *" {...passwordForm.register("currentPassword", { required: "Required" })} error={passwordForm.formState.errors.currentPassword?.message} />
                <div style={{ marginTop: 8 }}>
                  <Input type="password" label="New Password *" {...passwordForm.register("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })} error={passwordForm.formState.errors.newPassword?.message} />
                  <Input type="password" label="Confirm New Password *" {...passwordForm.register("confirmPassword", { required: "Required" })} error={passwordForm.formState.errors.confirmPassword?.message} />
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                  <SaveButton isPending={passwordMut.isPending} label="Update Password" />
                </div>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: `1px solid ${BORDER}` }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: DARK, margin: "0 0 8px 0", fontWeight: 700 }}>Notification Preferences</h2>
                <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Choose what we email you about. You'll always receive critical account updates.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { id: "email_announcements", label: "Course announcements", desc: "Get notified when an instructor posts an announcement" },
                  { id: "email_grades", label: "Assignment grades", desc: "Get notified when your assignment is graded" },
                  { id: "email_certificates", label: "New certificates", desc: "Get notified when you earn a new certificate" },
                  { id: "email_message", label: "Direct messages", desc: "Get notified when an instructor messages you" },
                ].map(n => (
                  <label key={n.id} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    padding: "20px 24px", 
                    background: SURFACE, 
                    border: `1px solid ${BORDER}`, 
                    borderRadius: 12, 
                    cursor: "pointer", 
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = "rgba(184,134,69,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.01)";
                      e.currentTarget.style.borderColor = BORDER;
                    }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{n.label}</div>
                      <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>{n.desc}</div>
                    </div>
                    {/* Modern Toggle Switch Style */}
                    <div style={{ position: "relative" }}>
                      <input type="checkbox" defaultChecked style={{ 
                        appearance: "none", 
                        width: 44, 
                        height: 24, 
                        background: BG_ALT, 
                        border: `1px solid ${BORDER}`,
                        borderRadius: 12,
                        cursor: "pointer",
                        transition: "all 0.3s",
                        position: "relative"
                      }}
                      className="premium-toggle"
                      />
                      <style>{`
                        .premium-toggle:checked {
                          background: ${GOLD} !important;
                          border-color: ${GOLD} !important;
                        }
                        .premium-toggle::after {
                          content: '';
                          position: absolute;
                          top: 2px;
                          left: 2px;
                          width: 18px;
                          height: 18px;
                          background: white;
                          border-radius: 50%;
                          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        .premium-toggle:checked::after {
                          transform: translateX(20px);
                        }
                      `}</style>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                <SaveButton isPending={false} label="Save Preferences" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
