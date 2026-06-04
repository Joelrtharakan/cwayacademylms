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
    <div className="w-full">
      <div className="mb-10 text-center md:text-left">
        <h2 className="font-serif text-4xl font-semibold text-cway-dark-green leading-tight mb-3">
          Reset password
        </h2>
        <p className="font-sans text-sm text-cway-dark-green/60">
          Enter a secure new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group/input">
          <label className="block text-[11px] uppercase tracking-widest font-sans font-bold text-cway-dark-green/70 mb-2 transition-colors group-focus-within/input:text-cway-gold">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cway-dark-green/30 w-5 h-5 transition-colors group-focus-within/input:text-cway-gold" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl pl-12 pr-12 h-[56px] text-sm bg-white/80 border-2 border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-cway-dark-green transition-all duration-300 outline-none focus:border-cway-gold/30 focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,151,58,0.1)] hover:bg-white"
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cway-dark-green/40 hover:text-cway-dark-green transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="group/input">
          <label className="block text-[11px] uppercase tracking-widest font-sans font-bold text-cway-dark-green/70 mb-2 transition-colors group-focus-within/input:text-cway-gold">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cway-dark-green/30 w-5 h-5 transition-colors group-focus-within/input:text-cway-gold" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl pl-12 pr-4 h-[56px] text-sm bg-white/80 border-2 border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-cway-dark-green transition-all duration-300 outline-none focus:border-cway-gold/30 focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,151,58,0.1)] hover:bg-white"
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="group relative w-full h-[56px] bg-cway-gold text-white rounded-2xl font-sans font-bold text-xs tracking-widest uppercase shadow-[0_8px_20px_-6px_rgba(201,151,58,0.4)] transition-all duration-300 hover:shadow-[0_12px_25px_-6px_rgba(201,151,58,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md cursor-pointer flex items-center justify-center overflow-hidden disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={isSubmitting}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10">{isSubmitting ? "Resetting Password..." : "Reset Password"}</span>
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
