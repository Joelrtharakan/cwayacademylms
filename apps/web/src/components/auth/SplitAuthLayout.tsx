import React from "react";
import Image from "next/image";
import Link from "next/link";

interface SplitAuthLayoutProps {
  children: React.ReactNode;
}

export default function SplitAuthLayout({ children }: SplitAuthLayoutProps) {
  return (
    <div className="min-h-screen flex w-full font-sans bg-cway-cream overflow-hidden">
      {/* Background ambient lighting for entire page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-40">
        <div className="absolute w-[800px] h-[800px] bg-cway-gold/20 rounded-full blur-[150px] mix-blend-multiply animate-3d-float" />
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-[#4A8C5C]/20 rounded-full blur-[150px] mix-blend-multiply" />
      </div>

      {/* LEFT PANEL: Branding & Visuals (Hidden on mobile) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] relative z-10">
        {/* Dynamic dark gradient background scoped only to the left panel */}
        <div className="absolute inset-0 rounded-r-[3rem] shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)] bg-gradient-to-br from-[#0f1a11] via-[#1c2b1e] to-[#293d2c] overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[300px] h-[300px] rounded-full blur-[120px] bg-cway-gold/15" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] bg-[#4A8C5C]/20" />
          <span className="absolute bottom-12 right-12 text-[300px] font-serif font-bold select-none leading-none opacity-[0.02] text-white">
            †
          </span>
        </div>

        {/* Content container inside left panel - Explicitly padded */}
        <div className="relative z-10 flex flex-col w-full h-full justify-center" style={{ padding: 'clamp(24px, 5vw, 64px)' }}>
          
          {/* Top Logo (Absolute positioned so it doesn't mess up center alignment) */}
          <div style={{ position: 'absolute', top: 'clamp(16px, 3vh, 32px)', left: 'clamp(24px, 5vw, 48px)' }}>
            <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
              <Image
                src="/logo.png"
                alt="CWAY Academy"
                width={120}
                height={36}
                className="w-[clamp(80px,10vw,120px)] h-auto object-contain drop-shadow-md"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </Link>
          </div>

          {/* Center Content */}
          <div className="flex flex-col justify-center animate-3d-entrance" style={{ animationDelay: '0.1s' }}>
            
            {/* Small Gold Header */}
            <h3 className="font-sans font-bold" style={{ color: '#C9973A', textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: 'clamp(10px, 1vw, 13px)', marginBottom: 'clamp(16px, 3vh, 32px)' }}>
              CWAY MISSIONS PRESENTS
            </h3>

            {/* Main Headline */}
            <h1 className="font-serif text-white drop-shadow-xl" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: '1.1', fontWeight: 400, letterSpacing: '-0.01em' }}>
              Coach. Challenge.
            </h1>
            <h1 className="font-serif italic drop-shadow-xl" style={{ color: '#C9973A', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: '1.1', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: 'clamp(24px, 4vh, 40px)' }}>
              Commission.
            </h1>
            
            {/* Paragraph Text */}
            <p className="font-sans text-white" style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', maxWidth: '500px', letterSpacing: '0.01em', lineHeight: '1.6', fontWeight: 300, opacity: 0.9 }}>
              Experience the unique blend of coaching, challenging, and commissioning to shape or enhance your leadership potential.
            </p>
            
          </div>

          {/* Bottom Link (Absolute positioned so it doesn't mess up center alignment) */}
          <div style={{ position: 'absolute', bottom: 'clamp(24px, 5vh, 64px)', left: 'clamp(24px, 5vw, 64px)' }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans font-bold hover:text-white transition-all duration-300 hover:translate-x-1"
              style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8BCA9' }}
            >
              <span>←</span> Back to Website
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen overflow-y-auto relative z-10 w-full" style={{ padding: 'clamp(12px, 3vw, 16px)' }}>
        {/* Mobile Logo fallback */}
        <div className="md:hidden animate-3d-entrance" style={{ marginBottom: '24px', marginTop: '16px' }}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="CWAY Academy"
              width={160}
              height={50}
              className="h-10 w-auto object-contain"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>
        </div>

        {/* 3D Glassmorphic Form Card */}
        <div className="w-full max-w-[500px] glass-card animate-3d-entrance relative group perspective-1000">
          <div className="absolute inset-0 rounded-[clamp(1rem,3vw,2rem)] bg-gradient-to-b from-white/60 to-white/20 pointer-events-none" />
          <div className="absolute inset-0 rounded-[clamp(1rem,3vw,2rem)] border-2 border-white/40 group-hover:border-white/60 transition-colors duration-500 pointer-events-none" />
          
          {/* Explicit padded inner wrapper to fix content overflowing the border */}
          <div className="relative z-10" style={{ padding: 'clamp(20px, 4vw, 24px) clamp(20px, 5vw, 32px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
