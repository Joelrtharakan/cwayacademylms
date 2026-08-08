"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Lock, Bell, ShieldCheck, Camera, ChevronRight, Check, Eye, EyeOff, Award, MapPin, Phone, Church, FileText } from "lucide-react";
import { updateMyProfile, uploadAvatar } from "@/lib/api/instructor";
import { api, useAuthStore } from "@/store/auth.store";
import { useTranslations } from "next-intl";

/* ─── DESIGN TOKENS ─── */
const C = {
  gold: "#B88645",
  goldHover: "#A3763A",
  goldLight: "rgba(184,134,69,0.10)",
  goldGlow: "rgba(184,134,69,0.25)",
  dark: "#1A261D",
  darkSoft: "#2D3A2F",
  text: "#3D4F41",
  muted: "#7F8E82",
  mutedLight: "#A8B4AB",
  surface: "#FFFFFF",
  bg: "#F5F6F2",
  bgAlt: "#F0F2ED",
  border: "#E2E6DE",
  borderLight: "#EBEEE8",
  red: "#DC4A4A",
  green: "#3A9D5C",
};

/* ─── STYLED INPUT ─── */
function SettingsInput({ label, icon: Icon, error, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "0.03em",
          color: focused ? C.gold : C.muted,
          textTransform: "uppercase" as const,
          transition: "color 0.2s",
        }}>{label}</label>
      )}
      <div style={{ position: "relative" }}>
        {Icon && (
          <div style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: focused ? C.gold : C.mutedLight, transition: "color 0.2s",
            display: "flex", alignItems: "center",
          }}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
        <input
          {...props}
          style={{
            width: "100%", boxSizing: "border-box" as const,
            background: focused ? C.surface : C.bgAlt,
            border: `1.5px solid ${error ? C.red : focused ? C.gold : "transparent"}`,
            borderRadius: 10, padding: Icon ? "13px 16px 13px 40px" : "13px 16px",
            color: C.dark, fontSize: 14, fontWeight: 500,
            outline: "none",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: focused ? `0 0 0 3px ${C.goldLight}` : "none",
            ...props.style,
          }}
          onFocus={(e: any) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e: any) => { setFocused(false); props.onBlur?.(e); }}
        />
      </div>
      {error && (
        <span style={{ fontSize: 12, color: C.red, fontWeight: 500, marginTop: 2 }}>{error}</span>
      )}
    </div>
  );
}

/* ─── STYLED TEXTAREA ─── */
function SettingsTextarea({ label, error, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "0.03em",
          color: focused ? C.gold : C.muted,
          textTransform: "uppercase" as const,
          transition: "color 0.2s",
        }}>{label}</label>
      )}
      <textarea
        {...props}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          background: focused ? C.surface : C.bgAlt,
          border: `1.5px solid ${error ? C.red : focused ? C.gold : "transparent"}`,
          borderRadius: 10, padding: "14px 16px",
          color: C.dark, fontSize: 14, fontWeight: 500, lineHeight: 1.7,
          outline: "none", resize: "vertical" as const, minHeight: 120,
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: focused ? `0 0 0 3px ${C.goldLight}` : "none",
          ...props.style,
        }}
        onFocus={(e: any) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e: any) => { setFocused(false); props.onBlur?.(e); }}
      />
      {error && (
        <span style={{ fontSize: 12, color: C.red, fontWeight: 500, marginTop: 2 }}>{error}</span>
      )}
    </div>
  );
}

/* ─── GOLD SAVE BUTTON ─── */
function GoldButton({ isPending, children, type = "submit" as const, ...props }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      disabled={isPending}
      {...props}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`,
        color: "#fff", border: "none", borderRadius: 10,
        padding: "12px 28px", fontSize: 13, fontWeight: 700,
        letterSpacing: "0.02em",
        cursor: isPending ? "wait" : "pointer",
        opacity: isPending ? 0.7 : 1,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: hovered
          ? `0 8px 24px ${C.goldGlow}`
          : `0 2px 8px rgba(184,134,69,0.15)`,
        transform: hovered ? "translateY(-1px)" : "none",
        ...props.style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isPending ? (
        <>
          <div style={{
            width: 14, height: 14,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "settings-spin 0.8s linear infinite",
          }} />
          Saving…
        </>
      ) : children}
    </button>
  );
}

/* ─── NOTIFICATION TOGGLE ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 48, height: 26, borderRadius: 13, border: "none",
        background: checked
          ? `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`
          : C.border,
        cursor: "pointer",
        transition: "background 0.25s",
        padding: 0,
        boxShadow: checked ? `0 2px 8px ${C.goldLight}` : "none",
      }}
    >
      <div style={{
        position: "absolute",
        top: 3, left: checked ? 25 : 3,
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <Check size={10} color={C.gold} strokeWidth={3} />}
      </div>
    </button>
  );
}

/* ─── SECTION CARD WRAPPER ─── */
function SectionCard({ id, children, style }: { id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section
      id={id}
      style={{
        background: C.surface,
        borderRadius: 16,
        border: `1px solid ${C.borderLight}`,
        padding: "32px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
        transition: "box-shadow 0.3s",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: C.goldLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={C.gold} strokeWidth={2} />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.dark, lineHeight: 1.3 }}>{title}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{description}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*           MAIN SETTINGS PAGE                */
/* ════════════════════════════════════════════ */

export default function InstructorSettingsPage() {
  const { user, refreshUser } = useAuthStore();
  const t = useTranslations("instructor.settings");

  const [activeTab, setActiveTab] = useState("profile");
  const [notifs, setNotifs] = useState({
    email_new_student: true,
    email_new_review: true,
    email_assignment: true,
    email_message: true,
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const TABS = [
    { id: "profile", label: t("tabs.profile"), icon: User },
    { id: "credentials", label: t("tabs.credentials"), icon: ShieldCheck },
    { id: "password", label: t("tabs.password"), icon: Lock },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
  ];

  /* ─── Forms ─── */
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || "", bio: user?.bio || "", church: user?.church || "",
      location: user?.location || "", phone: user?.phone || "",
    },
  });

  const credentialsForm = useForm({
    defaultValues: {
      title: (user as any)?.title || "",
      credentials: (user as any)?.credentials || "",
      yearsExperience: (user as any)?.yearsExperience || "",
    },
  });

  const passwordForm = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "", bio: user.bio || "", church: user.church || "",
        location: user.location || "", phone: user.phone || "",
      });
      credentialsForm.reset({
        title: (user as any).title || "",
        credentials: (user as any).credentials || "",
        yearsExperience: (user as any).yearsExperience || "",
      });
    }
  }, [user, profileForm, credentialsForm]);

  /* ─── Mutations ─── */
  const profileMut = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => { toast.success(t("toastProfileSuccess")); refreshUser(); },
    onError: () => toast.error(t("toastProfileFail")),
  });

  const passwordMut = useMutation({
    mutationFn: (data: any) => api.put("/auth/update-password", data),
    onSuccess: () => { toast.success(t("toastPasswordSuccess")); passwordForm.reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("toastPasswordFail")),
  });

  const handleAvatar = async (file: File) => {
    try {
      await uploadAvatar(file);
      toast.success(t("toastAvatarSuccess"));
      refreshUser();
    } catch { toast.error(t("toastAvatarFail")); }
  };



  return (
    <div style={{
      width: "100%", maxWidth: 780, margin: "0 auto",
      padding: "32px 20px 64px",
      boxSizing: "border-box" as const,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @keyframes settings-spin { 100% { transform: rotate(360deg); } }
        @keyframes settings-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .settings-section { animation: settings-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .settings-section:nth-child(2) { animation-delay: 0.05s; }
        .settings-section:nth-child(3) { animation-delay: 0.1s; }
        .settings-section:nth-child(4) { animation-delay: 0.15s; }
        .settings-avatar-ring:hover { border-color: ${C.gold} !important; }
        .settings-avatar-ring:hover .settings-avatar-overlay { opacity: 1 !important; }
        .settings-nav-pill { scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none; }
        .settings-nav-pill::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ═══════ HERO PROFILE BANNER ═══════ */}
      <div style={{
        background: C.surface,
        borderRadius: 20,
        border: `1px solid ${C.borderLight}`,
        padding: "28px 28px 24px",
        marginBottom: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Avatar with camera overlay */}
          <label
            className="settings-avatar-ring"
            style={{
              position: "relative",
              width: 72, height: 72, minWidth: 72,
              borderRadius: "50%",
              border: `2.5px solid ${C.border}`,
              overflow: "hidden",
              cursor: "pointer",
              transition: "border-color 0.25s",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: C.bgAlt,
              boxShadow: `0 2px 12px rgba(0,0,0,0.06)`,
            }}
          >
            <input
              type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
            />
            {user?.avatar ? (
              <img
                src={user.avatar} alt="Avatar"
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <User size={28} color={C.mutedLight} strokeWidth={1.5} />
            )}
            <div
              className="settings-avatar-overlay"
              style={{
                position: "absolute", inset: 0,
                background: "rgba(26,38,29,0.65)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                opacity: 0, transition: "opacity 0.25s",
                borderRadius: "50%",
              }}
            >
              <Camera size={16} color="#fff" />
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 600, marginTop: 2 }}>
                {t("profileTab.changeAvatar")}
              </span>
            </div>
          </label>

          {/* Name & role info */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 800,
              color: C.dark, letterSpacing: "-0.02em", lineHeight: 1.3,
            }}>
              {user?.name || "Instructor"}
            </h1>
            <p style={{
              margin: "4px 0 0", fontSize: 13, color: C.muted,
              lineHeight: 1.4,
            }}>
              {t("desc")}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ STICKY PILL NAV ═══════ */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(245,246,242,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "12px 0 12px",
        marginBottom: 20,
      }}>
        <nav
          className="settings-nav-pill"
          style={{
            display: "flex", gap: 6,
            overflowX: "auto",
            padding: "4px",
            background: C.surface,
            borderRadius: 14,
            border: `1px solid ${C.borderLight}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, minWidth: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : C.muted,
                  background: active
                    ? `linear-gradient(135deg, ${C.gold} 0%, ${C.goldHover} 100%)`
                    : "transparent",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  whiteSpace: "nowrap" as const,
                  boxShadow: active ? `0 2px 10px ${C.goldGlow}` : "none",
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} color={active ? "#fff" : C.mutedLight} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ═══════ ACTIVE TAB CONTENT ═══════ */}
      <div key={activeTab} className="settings-section">

        {activeTab === "profile" && (
          <SectionCard id="section-profile">
            <SectionHeader icon={User} title={t("profileTab.title")} description={t("profileTab.desc")} />

            <form onSubmit={profileForm.handleSubmit((d) => profileMut.mutate(d))}>
              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                <SettingsInput
                  label={t("profileTab.nameLabel")}
                  icon={User}
                  {...profileForm.register("name", { required: t("profileTab.nameReq") })}
                  error={profileForm.formState.errors.name?.message}
                />
                <SettingsInput
                  label={t("profileTab.phoneLabel")}
                  icon={Phone}
                  {...profileForm.register("phone")}
                />
              </div>

              {/* Church + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                <SettingsInput
                  label={t("profileTab.churchLabel")}
                  icon={Church}
                  {...profileForm.register("church")}
                />
                <SettingsInput
                  label={t("profileTab.locationLabel")}
                  icon={MapPin}
                  {...profileForm.register("location")}
                />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: 0 }}>
                <SettingsTextarea
                  label={t("profileTab.bioLabel")}
                  placeholder={t("profileTab.bioPlaceholder")}
                  {...profileForm.register("bio")}
                />
              </div>

              <div style={{
                display: "flex", justifyContent: "flex-end",
                marginTop: 28, paddingTop: 20,
                borderTop: `1px solid ${C.borderLight}`,
              }}>
                <GoldButton isPending={profileMut.isPending}>
                  <Check size={14} strokeWidth={3} />
                  {t("profileTab.saveBtn")}
                </GoldButton>
              </div>
            </form>
          </SectionCard>
        )}

        {activeTab === "credentials" && (
          <SectionCard id="section-credentials">
            <SectionHeader icon={ShieldCheck} title={t("credentialsTab.title")} description={t("credentialsTab.desc")} />

            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "14px 16px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #FEF9EF 0%, #FDF3E0 100%)",
              border: `1px solid rgba(184,134,69,0.2)`,
              marginBottom: 24,
            }}>
              <Award size={18} color={C.gold} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{
                margin: 0, fontSize: 13, lineHeight: 1.6,
                color: C.darkSoft, fontWeight: 500,
              }}>
                {t("credentialsTab.infoText")}{" "}
                <strong style={{ color: C.gold, fontWeight: 700 }}>{t("credentialsTab.infoBold")}</strong>)
              </p>
            </div>

            <form onSubmit={credentialsForm.handleSubmit((d) =>
              profileMut.mutate({ ...d, yearsExperience: d.yearsExperience ? Number(d.yearsExperience) : null })
            )}>
              {/* Row 1: Title Prefix & Years Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                <SettingsInput
                  label={t("credentialsTab.prefixLabel")}
                  placeholder={t("credentialsTab.prefixPlaceholder")}
                  {...credentialsForm.register("title")}
                />
                <SettingsInput
                  label={t("credentialsTab.yearsLabel")}
                  type="number"
                  {...credentialsForm.register("yearsExperience")}
                />
              </div>

              {/* Row 2: Degree / Credentials full width */}
              <div style={{ marginBottom: 0 }}>
                <SettingsInput
                  label={t("credentialsTab.degreeLabel")}
                  icon={FileText}
                  placeholder={t("credentialsTab.degreePlaceholder")}
                  {...credentialsForm.register("credentials")}
                />
              </div>

              <div style={{
                display: "flex", justifyContent: "flex-end",
                marginTop: 28, paddingTop: 20,
                borderTop: `1px solid ${C.borderLight}`,
              }}>
                <GoldButton isPending={profileMut.isPending}>
                  <Check size={14} strokeWidth={3} />
                  {t("credentialsTab.saveBtn")}
                </GoldButton>
              </div>
            </form>
          </SectionCard>
        )}

        {activeTab === "password" && (
          <SectionCard id="section-password">
            <SectionHeader icon={Lock} title={t("passwordTab.title")} description={t("passwordTab.desc")} />

            <form onSubmit={passwordForm.handleSubmit((d) => {
              if (d.newPassword !== d.confirmPassword) {
                passwordForm.setError("confirmPassword", { message: t("toastPasswordMismatch") });
                return;
              }
              passwordMut.mutate(d);
            })}>
              <div style={{ marginBottom: 20, position: "relative" }}>
                <SettingsInput
                  type={showCurrentPw ? "text" : "password"}
                  label={t("passwordTab.currentLabel")}
                  icon={Lock}
                  {...passwordForm.register("currentPassword", { required: t("passwordTab.reqMsg") })}
                  error={passwordForm.formState.errors.currentPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{
                    position: "absolute", right: 14, bottom: 14,
                    background: "none", border: "none", cursor: "pointer",
                    color: C.mutedLight, padding: 0, display: "flex",
                  }}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
                <div style={{ position: "relative" }}>
                  <SettingsInput
                    type={showNewPw ? "text" : "password"}
                    label={t("passwordTab.newLabel")}
                    {...passwordForm.register("newPassword", {
                      required: t("passwordTab.reqMsg"),
                      minLength: { value: 8, message: t("passwordTab.minMsg") },
                    })}
                    error={passwordForm.formState.errors.newPassword?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{
                      position: "absolute", right: 14, bottom: passwordForm.formState.errors.newPassword ? 32 : 14,
                      background: "none", border: "none", cursor: "pointer",
                      color: C.mutedLight, padding: 0, display: "flex",
                    }}
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <SettingsInput
                  type="password"
                  label={t("passwordTab.confirmLabel")}
                  {...passwordForm.register("confirmPassword", { required: t("passwordTab.reqMsg") })}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
              </div>

              <div style={{
                display: "flex", justifyContent: "flex-end",
                marginTop: 28, paddingTop: 20,
                borderTop: `1px solid ${C.borderLight}`,
              }}>
                <GoldButton isPending={passwordMut.isPending}>
                  <Check size={14} strokeWidth={3} />
                  {t("passwordTab.saveBtn")}
                </GoldButton>
              </div>
            </form>
          </SectionCard>
        )}

        {activeTab === "notifications" && (
          <SectionCard id="section-notifications">
            <SectionHeader icon={Bell} title={t("notificationsTab.title")} description={t("notificationsTab.desc")} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "email_new_student" as const, label: t("notificationsTab.items.enrollmentTitle"), desc: t("notificationsTab.items.enrollmentDesc") },
                { key: "email_new_review" as const, label: t("notificationsTab.items.reviewTitle"), desc: t("notificationsTab.items.reviewDesc") },
                { key: "email_assignment" as const, label: t("notificationsTab.items.assignmentTitle"), desc: t("notificationsTab.items.assignmentDesc") },
                { key: "email_message" as const, label: t("notificationsTab.items.messageTitle"), desc: t("notificationsTab.items.messageDesc") },
              ].map((n) => (
                <div
                  key={n.key}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 18px",
                    borderRadius: 12,
                    background: notifs[n.key] ? "rgba(184,134,69,0.04)" : C.bgAlt,
                    border: `1px solid ${notifs[n.key] ? "rgba(184,134,69,0.15)" : "transparent"}`,
                    transition: "all 0.25s",
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, lineHeight: 1.4 }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{n.desc}</div>
                  </div>
                  <Toggle
                    checked={notifs[n.key]}
                    onChange={(v) => setNotifs((p) => ({ ...p, [n.key]: v }))}
                  />
                </div>
              ))}
            </div>

            <div style={{
              display: "flex", justifyContent: "flex-end",
              marginTop: 28, paddingTop: 20,
              borderTop: `1px solid ${C.borderLight}`,
            }}>
              <GoldButton isPending={false}>
                <Check size={14} strokeWidth={3} />
                {t("notificationsTab.saveBtn")}
              </GoldButton>
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  );
}
