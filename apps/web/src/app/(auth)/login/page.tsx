"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, api } from "@/store/auth.store";
import { toast } from "sonner";
import SplitAuthLayout from "@/components/auth/SplitAuthLayout";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified! You can now sign in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);

      // Handle auto-enrollment intent
      const enrollCourseId = searchParams.get("enrollCourseId");
      if (enrollCourseId && user.role === "STUDENT") {
        try {
          await api.post("/student/enrollments", { courseId: enrollCourseId });
          toast.success("Successfully enrolled in the course!");
        } catch (err: any) {
          if (!err.response?.data?.message?.includes("already enrolled")) {
            toast.error("Failed to auto-enroll in the course.");
          }
        }
        window.location.href = "/student/dashboard";
        return;
      }

      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "INSTRUCTOR") {
        router.push("/instructor/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Invalid email or password";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h2 className="font-serif font-bold text-[#1C2B1E]" style={{ fontSize: 'clamp(28px, 5vw, 36px)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Welcome Back
        </h2>
        <p className="font-sans" style={{ fontSize: '14px', color: '#526658' }}>
          Please enter your credentials to access your classroom.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)', marginBottom: '4px' }}>
            Email Address
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

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="font-sans font-bold" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(28,43,30,0.7)' }}>
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-sans font-bold hover:underline"
              style={{ fontSize: '11px', color: '#C9973A' }}
            >
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.3)' }}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', height: '44px', paddingLeft: '48px', paddingRight: '48px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: 'rgba(255,255,255,0.8)', color: '#1C2B1E', fontSize: '14px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,43,30,0.4)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{ paddingTop: '8px' }}>
          <button
            type="submit"
            className="font-sans font-bold"
            style={{ width: '100%', height: '44px', backgroundColor: '#C9973A', color: 'white', borderRadius: '16px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(201,151,58,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>

      <div style={{ position: 'relative', margin: '24px 0' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid rgba(28,43,30,0.1)' }}></div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <span className="font-sans font-bold" style={{ backgroundColor: 'transparent', padding: '0 16px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(82,102,88,0.6)' }}>
            or continue with
          </span>
        </div>
      </div>

      <div>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/google${searchParams.get("enrollCourseId") ? `?state=${searchParams.get("enrollCourseId")}` : ""}`}
          className="font-sans font-semibold"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '2px solid white', backgroundColor: 'rgba(255,255,255,0.6)', height: '44px', borderRadius: '16px', fontSize: '14px', color: '#1C2B1E', textDecoration: 'none' }}
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

      <div className="font-sans" style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#526658' }}>
        Don't have an account?{" "}
        <Link
          href={searchParams.get("enrollCourseId") ? `/register?enrollCourseId=${searchParams.get("enrollCourseId")}` : "/register"}
          className="font-bold hover:underline"
          style={{ color: '#A8792A' }}
        >
          Register →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SplitAuthLayout>
      <Suspense fallback={<div className="text-center text-cway-gold animate-pulse font-serif italic">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </SplitAuthLayout>
  );
}
