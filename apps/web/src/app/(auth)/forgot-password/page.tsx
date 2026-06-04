"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import SplitAuthLayout from "@/components/auth/SplitAuthLayout";
import { Mail, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setIsSuccess(true);
      toast.success("Password reset request submitted");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to submit request";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <SplitAuthLayout>
        <div className="text-center py-10 animate-3d-entrance">
          <div className="w-20 h-20 bg-cway-success/10 text-cway-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-4xl font-semibold text-cway-dark-green leading-tight mb-4 drop-shadow-sm">
            Reset Link Sent
          </h2>
          <p className="font-sans text-sm text-cway-dark-green/70 mb-10 max-w-sm mx-auto leading-relaxed">
            If that email is registered with us, a reset link has been sent to your inbox. Please check your spam folder if you do not receive it.
          </p>

          <Link
            href="/login"
            className="group relative w-full h-[56px] bg-cway-gold text-white rounded-2xl font-sans font-bold text-xs tracking-widest uppercase shadow-[0_8px_20px_-6px_rgba(201,151,58,0.4)] transition-all duration-300 hover:shadow-[0_12px_25px_-6px_rgba(201,151,58,0.5)] hover:-translate-y-1 active:translate-y-0 active:shadow-md cursor-pointer flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10">Back to sign in</span>
          </Link>
        </div>
      </SplitAuthLayout>
    );
  }

  return (
    <SplitAuthLayout>
      <div className="mb-10 text-center md:text-left">
        <h2 className="font-serif text-4xl font-semibold text-cway-dark-green leading-tight mb-3">
          Forgot password?
        </h2>
        <p className="font-sans text-sm text-cway-dark-green/60">
          Enter your email and we'll send a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group/input">
          <label className="block text-[11px] uppercase tracking-widest font-sans font-bold text-cway-dark-green/70 mb-2 transition-colors group-focus-within/input:text-cway-gold">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cway-dark-green/30 w-5 h-5 transition-colors group-focus-within/input:text-cway-gold" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl pl-12 pr-4 h-[56px] text-sm bg-white/80 border-2 border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-cway-dark-green transition-all duration-300 outline-none focus:border-cway-gold/30 focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,151,58,0.1)] hover:bg-white"
              placeholder="you@example.com"
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
            <span className="relative z-10">{isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}</span>
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-xs font-sans text-cway-dark-green/60">
        <Link
          href="/login"
          className="font-medium text-cway-gold-muted hover:text-cway-gold hover:underline transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </SplitAuthLayout>
  );
}
