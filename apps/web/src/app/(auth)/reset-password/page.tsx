"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import SplitAuthLayout from "@/components/auth/SplitAuthLayout";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      toast.error("Invalid or missing password reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      toast.success("Password updated successfully!");
      router.push("/login");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to reset password. Link may have expired.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasTokenError) {
    return (
      <div className="text-center py-10 animate-3d-entrance">
        <div className="w-20 h-20 bg-cway-danger/10 text-cway-danger rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-4xl font-semibold text-cway-dark-green leading-tight mb-4 drop-shadow-sm">
          Invalid Link
        </h2>
        <p className="font-sans text-sm text-cway-dark-green/70 mb-10 max-w-sm mx-auto leading-relaxed">
          This password reset link is invalid or has expired. Please request a new link to reset your password.
        </p>

        <Link
          href="/forgot-password"
          className="group relative w-full h-[56px] bg-cway-gold text-white rounded-2xl font-sans font-bold text-xs tracking-widest uppercase shadow-[0_8px_20px_-6px_rgba(201,151,58,0.4)] transition-all duration-300 hover:shadow-[0_12px_25px_-6px_rgba(201,151,58,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md cursor-pointer flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10">Request new reset link</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h2 className="font-serif font-bold text-[#1C2B1E]" style={{ fontSize: 'clamp(28px, 5vw, 36px)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Reset Password
        </h2>
        <p className="font-sans" style={{ fontSize: '14px', color: '#526658' }}>
          Enter a secure new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', height: '44px', paddingLeft: '48px', paddingRight: '40px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
            Confirm New Password
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', height: '44px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
              placeholder="••••••••"
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
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <SplitAuthLayout>
      <Suspense fallback={<div className="text-center text-cway-gold animate-pulse font-serif italic">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </SplitAuthLayout>
  );
}
