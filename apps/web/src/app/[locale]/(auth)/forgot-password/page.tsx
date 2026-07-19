"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import SplitAuthLayout from "@/components/auth/SplitAuthLayout";
import { Mail, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot_password");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t("enter_email"));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setIsSuccess(true);
      toast.success(t("submit_success"));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || t("submit_fail");
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <SplitAuthLayout>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(44, 74, 59, 0.08)', color: '#2C4A3B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <Check size={40} />
          </div>
          <h2 className="font-serif font-bold text-[#1C2B1E]" style={{ fontSize: 'clamp(28px, 5vw, 36px)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {t("success_title")}
          </h2>
          <p className="font-sans" style={{ fontSize: '14px', color: '#526658', maxWidth: '380px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            {t("success_desc")}
          </p>

          <Link
            href="/login"
            className="font-sans font-bold"
            style={{ width: '100%', height: '44px', backgroundColor: '#C9973A', color: 'white', borderRadius: '16px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(201,151,58,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {t("back_button")}
          </Link>
        </div>
      </SplitAuthLayout>
    );
  }

  return (
    <SplitAuthLayout>
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h2 className="font-serif font-bold text-[#1C2B1E]" style={{ fontSize: 'clamp(28px, 5vw, 36px)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          {t("title")}
        </h2>
        <p className="font-sans" style={{ fontSize: '14px', color: '#526658' }}>
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
            {t("email")}
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', height: '44px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div style={{ paddingTop: '8px' }}>
          <button
            type="submit"
            className="font-sans font-bold"
            style={{ width: '100%', height: '44px', backgroundColor: '#C9973A', color: 'white', borderRadius: '16px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(201,151,58,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("sending") : t("send")}
          </button>
        </div>
      </form>

      <div className="font-sans" style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#526658' }}>
        <Link
          href="/login"
          className="font-bold hover:underline"
          style={{ color: '#A8792A' }}
        >
          {t("back_to_login")}
        </Link>
      </div>
    </SplitAuthLayout>
  );
}
