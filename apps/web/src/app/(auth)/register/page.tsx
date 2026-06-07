"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/store/auth.store";
import { toast } from "sonner";
import SplitAuthLayout from "@/components/auth/SplitAuthLayout";
import { Eye, EyeOff, User, Mail, Lock, Building, MapPin, Globe, Check } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [church, setChurch] = useState("");
  const [location, setLocation] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("ENGLISH");
  const [role, setRole] = useState("STUDENT");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        church: church || undefined,
        location: location || undefined,
        preferredLanguage,
      });

      setIsSuccess(true);
      setCountdown(60);
      toast.success("Account created successfully!");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    try {
      await api.post("/auth/forgot-password", { email });
      setCountdown(60);
      toast.success("Verification email resent!");
    } catch (err) {
      toast.error("Failed to resend email. Please try again later.");
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
            Check your email
          </h2>
          <p className="font-sans text-sm text-cway-dark-green/70 mb-10 max-w-sm mx-auto leading-relaxed">
            We have sent a verification link to <strong className="text-cway-dark-green font-semibold">{email}</strong>. Please verify your address to log in.
          </p>

          <button
            onClick={handleResendEmail}
            disabled={countdown > 0}
            className={`w-full font-sans font-semibold text-xs tracking-widest uppercase rounded-2xl h-[56px] transition-all duration-300 flex items-center justify-center shadow-sm ${
              countdown > 0
                ? "bg-white/50 text-cway-text-muted cursor-not-allowed border-2 border-white/20"
                : "bg-cway-gold text-white hover:bg-cway-gold-light hover:-translate-y-1 hover:shadow-md active:translate-y-0"
            }`}
          >
            {countdown > 0 ? `Resend email in ${countdown}s` : "Resend email"}
          </button>

          <div className="mt-8 text-center text-xs font-sans">
            <Link href="/login" className="font-semibold text-cway-gold-muted hover:text-cway-gold hover:underline transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </SplitAuthLayout>
    );
  }

  return (
    <SplitAuthLayout>
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
          <h2 className="font-serif font-bold text-[#1C2B1E]" style={{ fontSize: 'clamp(24px, 4vw, 28px)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Join Academy
          </h2>
          <p className="font-sans" style={{ fontSize: '13px', color: '#526658' }}>
            Create your account to begin your journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
                <User size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', height: '40px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                placeholder="Rahul Sharma"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', height: '40px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', height: '40px', paddingLeft: '48px', paddingRight: '40px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.4)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', height: '40px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
                Church <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 'normal' }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
                  <Building size={20} />
                </div>
                <input
                  type="text"
                  value={church}
                  onChange={(e) => setChurch(e.target.value)}
                  style={{ width: '100%', height: '40px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                  placeholder="Church name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div>
              <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
                Location <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 'normal' }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ width: '100%', height: '40px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                  placeholder="City, State"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
              Preferred Language
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)', zIndex: 10 }}>
                <Globe size={20} />
              </div>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                style={{ width: '100%', height: '42px', paddingLeft: '48px', paddingRight: '40px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', appearance: 'none', position: 'relative', zIndex: 0 }}
                disabled={isSubmitting}
              >
                <option value="ENGLISH">English</option>
                <option value="HINDI">Hindi</option>
                <option value="TAMIL">Tamil</option>
                <option value="TELUGU">Telugu</option>
                <option value="KANNADA">Kannada</option>
                <option value="MALAYALAM">Malayalam</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(28,43,30,0.4)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <button
              type="submit"
              className="font-sans font-bold"
              style={{ width: '100%', height: '40px', backgroundColor: '#C9973A', color: 'white', borderRadius: '16px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(201,151,58,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div style={{ position: 'relative', margin: '12px 0' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid rgba(28,43,30,0.1)' }}></div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <span className="font-sans font-bold" style={{ backgroundColor: 'transparent', padding: '0 16px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(82,102,88,0.6)' }}>
              or continue with
            </span>
          </div>
        </div>

        <div>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/google`}
            className="font-sans font-semibold"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '2px solid white', backgroundColor: 'rgba(255,255,255,0.6)', height: '40px', borderRadius: '16px', fontSize: '14px', color: '#1C2B1E', textDecoration: 'none' }}
          >
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.85 2.99C6.27 7.02 8.92 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.12 2.73-2.38 3.56l3.7 2.87c2.16-1.98 3.69-4.89 3.69-8.59z" />
              <path fill="#FBBC05" d="M5.35 10.49c-.25-.75-.39-1.56-.39-2.39s.14-1.64.39-2.39L1.5 2.72C.54 4.61 0 6.74 0 9s.54 4.39 1.5 6.28l3.85-2.99C5.1 12.13 5.1 11.24 5.35 10.49z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.08 0-5.73-1.98-6.65-4.96L1.5 16.35C3.39 20.35 7.35 23 12 23z" />
            </svg>
            Continue with Google
          </a>
        </div>

        <div className="font-sans" style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#526658' }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold hover:underline"
            style={{ color: '#A8792A' }}
          >
            Sign in →
          </Link>
        </div>
      </div>
    </SplitAuthLayout>
  );
}
