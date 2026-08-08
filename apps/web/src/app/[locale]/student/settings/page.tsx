"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Lock, Bell, Wallet, ShieldCheck, Upload, Check, Camera } from "lucide-react";
import { updateMyProfile, uploadAvatar } from "@/lib/api/instructor";
import { api, useAuthStore } from "@/store/auth.store";
import { useTranslations } from "next-intl";

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
      className="w-full sm:w-auto"
      style={{ 
        background: GOLD_GRADIENT, 
        color: "#FFFFFF", 
        borderRadius: 12, 
        padding: "14px 28px", 
        fontWeight: 700, 
        fontSize: 15, 
        border: "none", 
        cursor: "pointer", 
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isHovered ? "0 8px 20px rgba(184,134,69,0.3)" : "0 4px 10px rgba(184,134,69,0.15)",
        transform: isActive ? "scale(0.97)" : isHovered ? "translateY(-2px)" : "none",
        opacity: isPending ? 0.7 : 1,
        boxSizing: "border-box"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {isPending ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div className="spinner-border" style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          {label === "saving" ? "Saving..." : label}
        </div>
      ) : label}
    </button>
  );
}

export default function StudentSettingsPage() {
  const { user, refreshUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const qc = useQueryClient();

  const t = useTranslations("student.settings");
  
  const TABS = [
    { id: "profile", label: t("tabs.profile"), icon: User },
    { id: "password", label: t("tabs.password"), icon: Lock },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
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
    onSuccess: () => { toast.success(t("messages.profileUpdated")); refreshUser(); },
    onError: () => toast.error(t("messages.profileFailed")),
  });

  const passwordMut = useMutation({
    mutationFn: (data: any) => api.put("/auth/update-password", data),
    onSuccess: () => { toast.success(t("messages.passwordUpdated")); passwordForm.reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("messages.passwordFailed")),
  });

  const handleAvatar = async (file: File) => {
    try {
      await uploadAvatar(file);
      toast.success(t("messages.avatarUpdated"));
      refreshUser();
    } catch { toast.error(t("messages.avatarFailed")); }
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-[1100px] mx-auto font-sans px-4 sm:px-6 lg:px-8 py-8" style={{ boxSizing: "border-box" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .tab-content { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .avatar-hover-overlay { opacity: 0; transition: all 0.3s ease; }
        .avatar-container:hover .avatar-hover-overlay { opacity: 1; backdrop-filter: blur(4px); }
        .avatar-container:hover img { transform: scale(1.05); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .toggle-switch:checked { background-color: #B88645 !important; border-color: #B88645 !important; }
        .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background-color: #FFFFFF; border-radius: 50%; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .toggle-switch:checked::after { transform: translateX(20px); }
      `}</style>

      {/* Hero Header Area */}
      <div className="pb-1">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B88645] to-[#8A6433] flex items-center justify-center shadow-md shrink-0">
            <User size={26} color="#FFFFFF" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A261D] tracking-tight leading-tight m-0">{t("title")}</h1>
            <p className="text-xs sm:text-sm text-[#8F9E93] mt-1.5 font-medium m-0">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Settings Navigation Bar */}
      <div className="w-full flex items-center gap-3 p-2.5 sm:p-3 bg-[#F2F4EF] border border-[#E4E8E0] rounded-2xl overflow-x-auto shadow-inner">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all cursor-pointer border-none flex-1 min-w-[140px] ${
                active
                  ? "bg-white text-[#1A261D] shadow-md border border-[#E4E8E0]"
                  : "bg-transparent text-[#6B7A6E] hover:bg-white/60 hover:text-[#1A261D]"
              }`}
            >
              <Icon size={20} className={active ? "text-[#B88645]" : "text-[#8F9E93]"} strokeWidth={active ? 2.5 : 2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Pane Card */}
      <div className="w-full bg-white border border-[#E4E8E0] rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm min-h-[500px]">
        {/* Content Pane */}
        <div 
          className="tab-content w-full bg-white" 
          key={activeTab}
          style={{ padding: "clamp(24px, 5vw, 48px)", background: "#FFFFFF", boxSizing: "border-box" }}
        >
          {activeTab === "profile" && (
            <div>
              <div className="mb-8 pb-6 border-b border-[#E4E8E0]">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A261D] m-0 mb-1">{t("profile.title")}</h2>
                <p className="text-xs sm:text-sm text-[#8F9E93] m-0 leading-relaxed">{t("profile.subtitle")}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10 text-center sm:text-left">
                <div 
                  className="avatar-container relative bg-[#F7F8F5] border-2 border-dashed border-[#E4E8E0] overflow-hidden flex items-center justify-center shadow-md cursor-pointer shrink-0"
                  style={{ width: "96px", height: "96px", minWidth: "96px", minHeight: "96px", borderRadius: "50%" }}
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      style={{ width: "96px", height: "96px", objectFit: "cover", borderRadius: "50%", display: "block" }} 
                      className="transition-transform duration-500" 
                    />
                  ) : (
                    <User size={36} className="text-[#8F9E93]" strokeWidth={1.5} />
                  )}
                  <label className="avatar-hover-overlay absolute inset-0 bg-[#1A261D]/70 flex flex-col items-center justify-center text-white cursor-pointer gap-1" style={{ borderRadius: "50%" }}>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatar(e.target.files[0])} />
                    <Camera size={20} />
                    <span className="text-[11px] font-semibold">{t("profile.change")}</span>
                  </label>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="m-0 mb-1.5 text-base sm:text-lg font-bold text-[#1A261D]">{t("profile.pictureTitle")}</h3>
                  <p className="text-xs sm:text-sm text-[#8F9E93] m-0 max-w-sm leading-relaxed">{t("profile.pictureDesc")}</p>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(d => profileMut.mutate(d))}>
                <Input label={t("profile.fullName")} {...profileForm.register("name", { required: t("profile.nameRequired") })} error={profileForm.formState.errors.name?.message} />
                <Textarea label={t("profile.biography")} {...profileForm.register("bio")} placeholder={t("profile.bioPlaceholder")} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-2">
                  <Input label={t("profile.church")} {...profileForm.register("church")} />
                  <Input label={t("profile.location")} {...profileForm.register("location")} />
                </div>
                <Input label={t("profile.phone")} {...profileForm.register("phone")} />
                
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #E4E8E0", display: "flex", justifyContent: "flex-end", width: "100%" }}>
                  <SaveButton isPending={profileMut.isPending} label={t("profile.saveBtn")} />
                </div>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div>
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-5 border-b border-[#E4E8E0]">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A261D] m-0 mb-1">{t("password.title")}</h2>
                <p className="text-xs sm:text-sm text-[#8F9E93] m-0 leading-relaxed">{t("password.subtitle")}</p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(d => {
                if (d.newPassword !== d.confirmPassword) { passwordForm.setError("confirmPassword", { message: t("messages.passwordsMismatch") }); return; }
                passwordMut.mutate(d);
              })}>
                <Input type="password" label={t("password.current")} {...passwordForm.register("currentPassword", { required: t("password.required") })} error={passwordForm.formState.errors.currentPassword?.message} />
                <div className="mt-2">
                  <Input type="password" label={t("password.new")} {...passwordForm.register("newPassword", { required: t("password.required"), minLength: { value: 8, message: t("password.minChars") } })} error={passwordForm.formState.errors.newPassword?.message} />
                  <Input type="password" label={t("password.confirm")} {...passwordForm.register("confirmPassword", { required: t("password.required") })} error={passwordForm.formState.errors.confirmPassword?.message} />
                </div>
                
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #E4E8E0", display: "flex", justifyContent: "flex-end", width: "100%" }}>
                  <SaveButton isPending={passwordMut.isPending} label={t("password.updateBtn")} />
                </div>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-5 border-b border-[#E4E8E0]">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A261D] m-0 mb-1">{t("notifications.title")}</h2>
                <p className="text-xs sm:text-sm text-[#8F9E93] m-0 leading-relaxed">{t("notifications.subtitle")}</p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: "email_announcements", label: t("notifications.announcements"), desc: t("notifications.announcementsDesc") },
                  { id: "email_grades", label: t("notifications.grades"), desc: t("notifications.gradesDesc") },
                  { id: "email_certificates", label: t("notifications.certificates"), desc: t("notifications.certificatesDesc") },
                  { id: "email_message", label: t("notifications.messages"), desc: t("notifications.messagesDesc") },
                ].map(n => (
                  <label 
                    key={n.id} 
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E4E8E0",
                      borderRadius: "10px",
                      gap: "12px",
                      cursor: "pointer",
                      width: "100%",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s"
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1A261D", lineHeight: 1.3 }}>{n.label}</div>
                      <div style={{ fontSize: "12px", color: "#8F9E93", marginTop: "2px", lineHeight: 1.4 }}>{n.desc}</div>
                    </div>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="toggle-switch"
                        style={{ 
                          appearance: "none", 
                          width: 44, 
                          height: 24, 
                          backgroundColor: "#F7F8F5", 
                          border: "1px solid #E4E8E0",
                          borderRadius: 12,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          position: "relative",
                          outline: "none"
                        }} 
                      />
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #E4E8E0", display: "flex", justifyContent: "flex-end", width: "100%" }}>
                <SaveButton isPending={false} label={t("notifications.saveBtn")} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
