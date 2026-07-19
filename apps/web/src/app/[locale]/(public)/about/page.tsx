"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Globe, BookOpen, Users, Award, Shield, Compass, Calendar, CheckCircle2, GraduationCap, DollarSign } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

// 3D Tilt Card Wrapper Component using Framer Motion
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltMax?: number;
  depth?: number;
}

function TiltCard({ children, className = "", tiltMax = 12, depth = 25 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.4 };
  const rotateX = useSpring(useTransform(y, [0, 1], [tiltMax, -tiltMax]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-tiltMax, tiltMax]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative transition-all duration-300 ${className}`}
    >
      <div style={{ transform: `translateZ(${depth}px)`, transformStyle: "preserve-3d" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } }
} as const;

export default function AboutPage() {
  const t = useTranslations("public.about");
  
  const values = [
    { icon: BookOpen, title: "Scripture Authority", desc: "The Bible is our supreme authority and foundation for all theological education and ministry training." },
    { icon: Heart, title: "Pastoral Compassion", desc: "We serve with deep pastoral care, understanding the sacrifices made by rural church workers across India." },
    { icon: Globe, title: "Missional Vision", desc: "We are driven by the Great Commission — discipling all nations, beginning with India's unreached communities." },
    { icon: Users, title: "Community of Learners", desc: "We foster a family-like learning community where students grow together in faith, knowledge, and calling." },
  ];

  const objectives = [
    {
      id: 0,
      title: "Nurturing Local Leaders",
      icon: Users,
      desc: "To focus on developing leadership within the churches in India by identifying, preparing, and nurturing leaders for local missions and ministries."
    },
    {
      id: 1,
      title: "Bilingual Training",
      icon: BookOpen,
      desc: "We aim to provide theological education and hands-on leadership training in local languages, at their place, pace, and time."
    },
    {
      id: 2,
      title: "Program Format",
      icon: Shield,
      desc: "This training program is an accredited certificate program lasting six to fifteen months. Participants can attend this training while continuing to be involved in their ministries or work. We will provide theological education and training in local languages. After completing the training, graduates can receive a globally recognized certificate."
    }
  ];

  const [activeObjective, setActiveObjective] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(0);
  const parallaxSectionRef = useRef<HTMLDivElement>(null);

  // Scroll bindings for overlapping cards in Stage 4
  const { scrollYProgress } = useScroll({
    target: parallaxSectionRef,
    offset: ["start end", "end start"]
  });

  const yVision = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yMission = useTransform(scrollYProgress, [0, 1], [140, -140]);

  const accordionItems = [
    {
      title: "Fees and Scholarships",
      icon: DollarSign,
      description: "Although this program has a fee structure, scholarships are available for students who cannot afford the full tuition. The financial crisis won't hinder their academic pursuits. Students with financial need are offered different scholarships, depending on their eligibility."
    },
    {
      title: "Course Details",
      icon: Calendar,
      description: "In this training program, there are ten courses, and each course lasts 6 weeks. For five weeks, two video lectures (30 minutes each) will be provided, along with study notes, reading materials, live sessions, and workshops. In the sixth week, there will be an exam and feedback. So, in sixty weeks, ten courses will be completed. Those who need a break between the training can take one after completing five courses."
    },
    {
      title: "Graduation",
      icon: GraduationCap,
      description: "Students who complete all courses and meet the requirements will receive a globally accredited certificate upon graduation. Graduation services will be conducted locally, and everyone will have easy access to the graduation process and ceremony."
    }
  ];

  return (
    <div className="overflow-hidden bg-[#FAFAF7] relative">

      {/* 3D Floating Orbs in Background */}
      <div className="absolute top-[15%] left-[-200px] floating-orb orb-green opacity-40 pointer-events-none" />
      <div className="absolute top-[35%] right-[-150px] floating-orb orb-gold opacity-30 pointer-events-none" />
      <div className="absolute top-[60%] left-[-150px] floating-orb orb-gold opacity-30 pointer-events-none" />
      <div className="absolute top-[80%] right-[-200px] floating-orb orb-green opacity-40 pointer-events-none" />

      {/* STAGE 1: The Editorial Hero */}
      <section className="relative py-32 md:py-40 px-6 bg-gradient-to-b from-[#1A261D] to-[#2C4A3B] text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--gold-primary)] opacity-20 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#4A7A62] opacity-30 blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              className="lg:col-span-7 text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            >
              <span className="inline-block text-[var(--gold-light)] font-semibold text-xs tracking-[3px] uppercase mb-4">
                {t("label")}
              </span>
              <h1 className="text-4xl md:text-6xl font-normal font-serif leading-tight mb-6 text-white">
                {t("title")}
              </h1>
              <div className="w-20 h-1 bg-[var(--gold-primary)] mb-8" />
              <p className="text-white/85 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                {t("desc")}
              </p>
            </motion.div>

            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            >
              <TiltCard className="h-full" tiltMax={8} depth={30}>
                <div className="p-8 md:p-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl relative h-full flex flex-col justify-between text-left">
                  <span
                    className="absolute -top-4 left-8 px-4 py-1.5 bg-[var(--gold-primary)] text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg"
                    style={{ transform: "translateZ(30px)" }}
                  >
                    {t("theCall")}
                  </span>
                  <p
                    className="font-serif italic text-lg md:text-xl leading-relaxed text-white/95 mb-8 mt-2"
                    style={{ transform: "translateZ(25px)" }}
                  >
                    {t("quote")}
                  </p>
                  <div className="flex items-center gap-3" style={{ transform: "translateZ(20px)" }}>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[var(--gold-light)]">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm text-white">{t("cwayMissions")}</h5>
                      <p className="text-xs text-white/60">{t("bangalore")}</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STAGE 2: Immersive Darkness (The Challenges) */}
      <section className="py-28 px-6 dark-gradient-section relative border-b border-[#1A261D]/30 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[var(--gold-primary)] opacity-[0.04] blur-[120px]" />
          <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] rounded-full bg-[#4A7A62] opacity-[0.06] blur-[150px]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="challenge-new-grid">
            {/* Left Sticky Column */}
            <div className="challenge-left-content text-left">
              <span className="inline-flex items-center gap-2 text-[var(--gold-light)] font-semibold text-xs tracking-wider uppercase mb-3">
                <span className="w-6 h-[1px] bg-[var(--gold-light)]" />
                {t("challenge.label")}
              </span>
              <h2 className="text-3xl md:text-5xl font-normal font-serif mb-6 text-white leading-tight">
                {t("challenge.title")}
              </h2>
              <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mb-8 max-w-lg">
                {t("challenge.desc")}
              </p>

              <div className="challenge-quote-card border-l-4 border-[var(--gold-primary)] p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="font-serif italic text-lg leading-relaxed text-white/95">
                  {t("challenge.quote")}
                </p>
              </div>
            </div>

            {/* Right Column: Challenges List */}
            <div className="challenge-list-container text-left">
              <p className="text-white/80 font-medium text-sm md:text-base mb-6 tracking-wide uppercase">
                {t("challenge.list_heading")}
              </p>

              <motion.div
                className="challenge-list-item border-b border-white/10 py-6"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="challenge-list-number text-[var(--gold-light)]">01</div>
                <div className="challenge-list-content">
                  <h3 className="text-xl font-medium font-serif text-white mb-2">{t("challenge.item_1_title")}</h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed">
                    {t("challenge.item_1_desc")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="challenge-list-item border-b border-white/10 py-6"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="challenge-list-number text-[var(--gold-light)]">02</div>
                <div className="challenge-list-content">
                  <h3 className="text-xl font-medium font-serif text-white mb-2">{t("challenge.item_2_title")}</h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed">
                    {t("challenge.item_2_desc")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="challenge-list-item border-b border-white/10 py-6"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="challenge-list-number text-[var(--gold-light)]">03</div>
                <div className="challenge-list-content">
                  <h3 className="text-xl font-medium font-serif text-white mb-2">{t("challenge.item_3_title")}</h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed">
                    {t("challenge.item_3_desc")}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 3: The Beacon of Hope & Interactive 3D Objective Slider */}
      <section className="py-28 px-6 bg-[#FAFAF7] border-b border-[#DCE0D5] relative overflow-hidden">
        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="offer-section-grid">
            {/* Left Sticky Column */}
            <div className="offer-left-column text-left">
              <span className="inline-flex items-center gap-2 text-[var(--gold-primary)] font-semibold text-xs tracking-wider uppercase mb-3">
                <span className="w-6 h-[1px] bg-[var(--gold-primary)]" />
                {t("response.label")}
              </span>
              <h2 className="text-3xl md:text-5xl font-normal font-serif text-[var(--navy-deep)] mb-6 leading-tight">
                {t("response.title")}
              </h2>
              <p className="text-[var(--text-secondary)] text-sm md:text-base font-light leading-relaxed mb-6">
                {t("response.desc")}
              </p>

              <ul className="offer-checklist my-8">
                <li className="offer-checklist-item flex items-center gap-3 py-1">
                  <div className="w-5 h-5 rounded-full bg-[var(--navy-light)]/10 text-[var(--navy-mid)] flex items-center justify-center">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-[var(--text-primary)] font-medium text-sm md:text-base">{t("response.check_1")}</span>
                </li>
                <li className="offer-checklist-item flex items-center gap-3 py-1">
                  <div className="w-5 h-5 rounded-full bg-[var(--navy-light)]/10 text-[var(--navy-mid)] flex items-center justify-center">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-[var(--text-primary)] font-medium text-sm md:text-base">{t("response.check_2")}</span>
                </li>
                <li className="offer-checklist-item flex items-center gap-3 py-1">
                  <div className="w-5 h-5 rounded-full bg-[var(--navy-light)]/10 text-[var(--navy-mid)] flex items-center justify-center">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-[var(--text-primary)] font-medium text-sm md:text-base">{t("response.check_3")}</span>
                </li>
              </ul>

              <div className="p-6 rounded-2xl bg-white border border-[#DCE0D5] shadow-sm">
                <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed font-light">
                  {t("response.sub_desc")}
                </p>
              </div>
            </div>

            {/* Right Interactive 3D Card Slider */}
            <div className="flex flex-col gap-6 w-full text-left">
              <p className="text-[var(--text-primary)] font-semibold text-sm md:text-base tracking-wide uppercase mb-2">
                {t("response.objectives")}
              </p>

              <div className="objective-deck-container w-full mt-2">
                {/* Vertical Tabs List */}
                <div className="objective-tabs-list">
                  {objectives.map((obj, idx) => (
                    <button
                      key={obj.id}
                      onClick={() => setActiveObjective(idx)}
                      className={`objective-tab-button ${activeObjective === idx ? "objective-tab-active" : ""}`}
                    >
                      {obj.title}
                    </button>
                  ))}
                </div>

                {/* 3D stacked deck showcase */}
                <div className="objective-card-showcase relative min-h-[380px] w-full">
                  {objectives.map((obj, idx) => {
                    const relativeIndex = (idx - activeObjective + 3) % 3;
                    const isActive = relativeIndex === 0;

                    return (
                      <motion.div
                        key={obj.id}
                        className={`objective-deck-card ${isActive ? "shadow-2xl border-[var(--gold-light)]/30" : "shadow-md border-[#DCE0D5]/55"}`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: isActive ? "auto" : "none",
                        }}
                        animate={{
                          scale: isActive ? 1 : 0.94 - relativeIndex * 0.03,
                          y: isActive ? 0 : 20 * relativeIndex,
                          zIndex: 10 - relativeIndex,
                          opacity: isActive ? 1 : 0.5 / relativeIndex,
                        }}
                        transition={{ type: "spring", stiffness: 280, damping: 25 }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-[var(--cream-mid)] text-[var(--navy-mid)] flex items-center justify-center shadow-inner">
                            <obj.icon size={22} />
                          </div>
                          <h4 className="text-xl font-normal font-serif text-[var(--navy-deep)]">
                            {obj.title}
                          </h4>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed flex-grow text-justify">
                          {obj.desc}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[var(--gold-primary)] uppercase tracking-wider">
                          <span>{t("response.explore")}</span>
                          <ArrowRight size={14} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 4: Overlapping Scroll Parallax (Vision & Mission) */}
      <section ref={parallaxSectionRef} className="py-28 px-6 bg-[#FAFAF7] border-b border-[#DCE0D5] relative overflow-hidden">
        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="parallax-split-container">
            {/* Left Sticky Column */}
            <div className="parallax-sticky-column text-left">
              <span className="inline-flex items-center gap-2 text-[var(--gold-primary)] font-semibold text-xs tracking-wider uppercase mb-3">
                <span className="w-6 h-[1px] bg-[var(--gold-primary)]" />
                {t("horizon.label")}
              </span>
              <h2 className="text-3xl md:text-5xl font-normal font-serif text-[var(--navy-deep)] mb-6 leading-tight">
                {t("horizon.title")}
              </h2>
              <div className="w-16 h-1 bg-[var(--gold-primary)] mb-8" />
              <p className="text-[var(--text-secondary)] text-sm md:text-base font-light leading-relaxed max-w-md mb-8">
                {t("horizon.desc")}
              </p>

              <div className="parallax-vertical-title select-none pointer-events-none opacity-[0.03] lg:opacity-[0.06] font-serif font-bold text-7xl uppercase tracking-[10px] hidden lg:block">
                CWAY
              </div>
            </div>

            {/* Right Column: Parallax stack */}
            <div className="parallax-card-stack text-left">
              {/* Vision Card - Green Accent Gradient */}
              <motion.div style={{ y: yVision }} className="relative z-10">
                <TiltCard className="h-full" tiltMax={6} depth={20}>
                  <div className="group p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#1A261D] to-[#2C4A3B] text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute bottom-[-30px] right-[-20px] font-serif font-bold text-[10rem] text-white/5 leading-none select-none pointer-events-none" style={{ transform: "translateZ(30px)" }}>
                      V
                    </div>
                    <div style={{ transform: "translateZ(25px)" }}>
                      <span className="inline-block text-[var(--gold-light)] font-bold text-xs tracking-wider uppercase mb-3">
                        {t("horizon.vision_label")}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-normal font-serif mb-6 text-white">
                        {t("horizon.vision_title")}
                      </h2>
                      <p className="text-white/80 leading-relaxed font-light text-base md:text-lg mb-8 text-justify">
                        {t("horizon.vision_desc")}
                      </p>
                    </div>
                    <div style={{ transform: "translateZ(20px)" }}>
                      <ul className="space-y-3 mb-4">
                        {[t("horizon.v_check_1"), t("horizon.v_check_2"), t("horizon.v_check_3")].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-[var(--gold-light)] font-medium">
                            <CheckCircle2 size={16} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* Mission Card - Gold Accent Gradient */}
              <motion.div style={{ y: yMission }} className="relative z-20 md:-mt-16">
                <TiltCard className="h-full" tiltMax={6} depth={20}>
                  <div className="group p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#B88645] to-[#8A6432] text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute bottom-[-30px] right-[-20px] font-serif font-bold text-[10rem] text-white/5 leading-none select-none pointer-events-none" style={{ transform: "translateZ(30px)" }}>
                      M
                    </div>
                    <div style={{ transform: "translateZ(25px)" }}>
                      <span className="inline-block text-white/70 font-bold text-xs tracking-wider uppercase mb-3">
                        {t("horizon.mission_label")}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-normal font-serif mb-6 text-white">
                        {t("horizon.mission_title")}
                      </h2>
                      <p className="text-white/90 leading-relaxed font-light text-base md:text-lg mb-8 text-justify">
                        {t("horizon.mission_desc")}
                      </p>
                    </div>
                    <div className="p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10" style={{ transform: "translateZ(20px)" }}>
                      <p className="font-serif italic text-sm text-white/90 leading-relaxed text-justify">
                        {t("horizon.mission_quote")}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 5: The Accordion Parameters System */}
      <section className="py-28 px-6 bg-[#F3F4F0] border-b border-[#DCE0D5] relative overflow-hidden">
        <div className="container relative z-10 mx-auto max-w-7xl">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <span className="text-[var(--gold-primary)] font-bold text-xs tracking-[3px] uppercase">
              {t("parameters.label")}
            </span>
            <h2 className="text-3xl md:text-5xl font-normal font-serif text-[var(--navy-deep)] mt-4">
              {t("parameters.title")}
            </h2>
            <div className="w-16 h-1 bg-[var(--gold-primary)] mx-auto mt-6" />
          </motion.div>

          <div className="accordion-container">
            {accordionItems.map((item, idx) => {
              const isOpen = expandedAccordion === idx;

              return (
                <div
                  key={idx}
                  className={`accordion-item ${isOpen ? "accordion-item-active" : ""}`}
                >
                  <button
                    onClick={() => setExpandedAccordion(isOpen ? null : idx)}
                    className="accordion-header"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[var(--gold-primary)] text-white" : "bg-[var(--cream-dark)] text-[var(--navy-mid)]"}`}>
                        <item.icon size={20} />
                      </div>
                      <h4 className="text-lg md:text-xl font-normal font-serif text-[var(--navy-deep)]">
                        {item.title}
                      </h4>
                    </div>
                    <div className="accordion-icon-circle">
                      <ArrowRight size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-90 text-white" : "text-[var(--navy-mid)]"}`} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="accordion-content"
                      >
                        <div className="accordion-content-inner">
                          <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed text-justify font-light">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STAGE 6: Context Block Callout */}
      <section className="py-24 px-6 bg-[#FAFAF7] border-b border-[#DCE0D5] relative overflow-hidden">
        <div className="container max-w-4xl mx-auto text-center relative z-10">
          <div className="quote-text text-lg md:text-2xl font-light italic leading-relaxed text-[var(--navy-mid)] border-l-4 border-[var(--gold-primary)] pl-6 md:pl-10 text-justify max-w-3xl mx-auto">
            {t("context")}
          </div>
        </div>
      </section>

      {/* STAGE 7: Leadership Team */}
      <section className="py-28 px-6 bg-white relative overflow-hidden">
        <div className="container relative z-10 mx-auto max-w-7xl">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-20"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <span className="text-[var(--gold-primary)] font-bold text-xs tracking-[3px] uppercase">
              {t("team.label")}
            </span>
            <h2 className="text-3xl md:text-5xl font-normal font-serif text-[var(--navy-deep)] mt-4">
              {t("team.title")}
            </h2>
            <div className="w-16 h-1 bg-[var(--gold-primary)] mx-auto mt-6" />
          </motion.div>

          <motion.div
            className="flex flex-col gap-10 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Dr. Reeju Tharakan */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#DCE0D5]/50 hover:shadow-2xl hover:border-[var(--gold-light)]/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch text-left"
            >
              {/* Left Info Column */}
              <div className="lg:col-span-3 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-[#DCE0D5]/50 pb-6 lg:pb-0 lg:pr-8 pt-2 w-full">
                <div className="w-24 h-24 rounded-full mb-4 relative flex items-center justify-center bg-gradient-to-br from-[#2C4A3B] to-[#4A7A62] shadow-xl transition-transform duration-500 group-hover:scale-105">
                  <div className="absolute inset-[-6px] rounded-full border border-dashed border-[var(--gold-primary)] opacity-60 group-hover:rotate-12 transition-transform duration-700" />
                  <Image src="/Reeju.png" alt="Dr. Reeju Tharakan" width={96} height={96} className="w-full h-full rounded-full object-cover relative z-10" quality={100} priority />
                </div>
                <div className="text-[var(--gold-primary)] font-bold text-[10px] tracking-widest uppercase mt-2 mb-3 leading-tight">
                  Executive Director
                </div>
                <span className="inline-block px-3 py-1 bg-[#F3F4F0] text-[var(--navy-mid)] text-xs font-semibold rounded-full">
                  M.Th., Ph.D.
                </span>
              </div>

              {/* Right Bio Column */}
              <div className="lg:col-span-9 flex flex-col justify-start items-start text-left lg:pl-6 w-full mt-6 lg:mt-0">
                <h4 className="text-2xl font-normal font-serif text-[var(--navy-deep)] mb-2">Dr. Reeju Tharakan</h4>
                <div className="w-12 h-[2px] bg-[var(--gold-light)] mb-4" />
                <div className="text-[var(--text-secondary)] font-light leading-relaxed text-sm md:text-base text-justify space-y-4" style={{ wordSpacing: '-0.02em' }}>
                  <p>With a Ph.D. in Christian Studies and a Master of Theology in History of Christianity and 24 years of experience in theological education, Dr. Reeju forged a vision to provide an optimized theological learning opportunity for every Local Church and Leader.</p>
                  <p>As a theological educator, he served at Southern Asia Bible College, Bangalore, as an Assistant Professor for 13 years, then as an international faculty member at SUM Bible College and Theological Seminary, California, and as Dean of M.Th. studies at Bethel New Life College, Bangalore.</p>
                  <p>Presently, he is the Lead Pastor of Immanuel AG Church in Dubai and is involved in teaching, training, developing curricula, and launching new theological programs. He is also the President-Trustee of the CWAY Missions Religious Trust, Bangalore.</p>
                </div>
              </div>
            </motion.div>

            {/* Pr. Robin Ninan */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#DCE0D5]/50 hover:shadow-2xl hover:border-[var(--gold-light)]/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch text-left"
            >
              {/* Left Info Column */}
              <div className="lg:col-span-3 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-[#DCE0D5]/50 pb-6 lg:pb-0 lg:pr-8 pt-2 w-full">
                <div className="w-24 h-24 rounded-full mb-4 relative flex items-center justify-center bg-gradient-to-br from-[#2C4A3B] to-[#4A7A62] shadow-xl transition-transform duration-500 group-hover:scale-105">
                  <div className="absolute inset-[-6px] rounded-full border border-dashed border-[var(--gold-primary)] opacity-60 group-hover:rotate-12 transition-transform duration-700" />
                  <Image src="/Robin.png" alt="Pr. Robin Ninan" width={96} height={96} className="w-full h-full rounded-full object-cover relative z-10" quality={100} priority />
                </div>
                <div className="text-[var(--gold-primary)] font-bold text-[10px] tracking-widest uppercase mt-2 mb-3 leading-tight">
                  Director of Training & Outreach
                </div>
                <span className="inline-block px-3 py-1 bg-[#F3F4F0] text-[var(--navy-mid)] text-xs font-semibold rounded-full">
                  M.Div., Media Specialist
                </span>
              </div>

              {/* Right Bio Column */}
              <div className="lg:col-span-9 flex flex-col justify-start items-start text-left lg:pl-6 w-full mt-6 lg:mt-0">
                <h4 className="text-2xl font-normal font-serif text-[var(--navy-deep)] mb-2">Pr. Robin Ninan</h4>
                <div className="w-12 h-[2px] bg-[var(--gold-light)] mb-4" />
                <div className="text-[var(--text-secondary)] font-light leading-relaxed text-sm md:text-base text-justify space-y-4" style={{ wordSpacing: '-0.02em' }}>
                  <p>Holding a Master of Divinity and extensive experience in leadership, management, and media, Pr. Robin envisions using his experience to reach and organize learning and training programs for pastors and leaders of the Christian community and local churches.</p>
                  <p>He served as the Broadcasting and Production Manager at a Christian channel for 13 years and initiated leadership training and skill-development programs for youth in rural India.</p>
                  <p>He continued to enrich rural pastors and leaders through the media. He is also the Secretary-Trustee of the CWAY Missions Religious Trust, Bangalore.</p>
                </div>
              </div>
            </motion.div>

            {/* Evg. Finny Philip Varghese */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#DCE0D5]/50 hover:shadow-2xl hover:border-[var(--gold-light)]/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch text-left"
            >
              {/* Left Info Column */}
              <div className="lg:col-span-3 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-[#DCE0D5]/50 pb-6 lg:pb-0 lg:pr-8 pt-2 w-full">
                <div className="w-24 h-24 rounded-full mb-4 relative flex items-center justify-center bg-gradient-to-br from-[#2C4A3B] to-[#4A7A62] shadow-xl transition-transform duration-500 group-hover:scale-105">
                  <div className="absolute inset-[-6px] rounded-full border border-dashed border-[var(--gold-primary)] opacity-60 group-hover:rotate-12 transition-transform duration-700" />
                  <Image src="/Finny.png" alt="Evg. Finny Philip Varghese" width={96} height={96} className="w-full h-full rounded-full object-cover relative z-10" quality={100} priority />
                </div>
                <div className="text-[var(--gold-primary)] font-bold text-[10px] tracking-widest uppercase mt-2 mb-3 leading-tight">
                  Director of Operations
                </div>
                <span className="inline-block px-3 py-1 bg-[#F3F4F0] text-[var(--navy-mid)] text-xs font-semibold rounded-full">
                  Operations Leader
                </span>
              </div>

              {/* Right Bio Column */}
              <div className="lg:col-span-9 flex flex-col justify-start items-start text-left lg:pl-6 w-full mt-6 lg:mt-0">
                <h4 className="text-2xl font-normal font-serif text-[var(--navy-deep)] mb-2">Evg. Finny Philip Varghese</h4>
                <div className="w-12 h-[2px] bg-[var(--gold-light)] mb-4" />
                <div className="text-[var(--text-secondary)] font-light leading-relaxed text-sm md:text-base text-justify space-y-4" style={{ wordSpacing: '-0.02em' }}>
                  <p>An ordained minister of the AG Church of Brazil, and has been engaged in Christian missions since 2012. Driven by a deep commitment to sharing the love of God with underserved communities, he has dedicated himself to mission work across various capacities.</p>
                  <p>Over the years, he has played a pivotal role in establishing and supporting several mission-focused charitable organizations and trusts in India. As a founder, trustee, and advisor, he continues to contribute to initiatives that foster community development, spiritual growth, and holistic transformation. In addition to his ministry experience, he brings extensive expertise in information technology and business leadership.</p>
                  <p>Currently, he serves as the Founding Director of ARTNTEQ Group of Businesses, where he has strategically leveraged his skills to establish sustainable ventures that support the vision of equipping, empowering, and emancipating lay leaders for effective service and leadership.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STAGE 8: Core Values */}
      <section className="py-28 px-6 bg-[#F3F4F0] border-t border-[#DCE0D5] relative overflow-hidden">
        <div className="container relative z-10 mx-auto max-w-7xl">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-20"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <span className="text-[var(--gold-primary)] font-bold text-xs tracking-[3px] uppercase">
              {t("pillars.label")}
            </span>
            <h2 className="text-3xl md:text-5xl font-normal font-serif text-[var(--navy-deep)] mt-4">
              {t("pillars.title")}
            </h2>
            <div className="w-16 h-1 bg-[var(--gold-primary)] mx-auto mt-6" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {values.map((v, idx) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="h-full"
              >
                <TiltCard className="h-full" tiltMax={12} depth={15}>
                  <div className="bg-white p-8 rounded-2xl shadow-md border border-[#DCE0D5]/40 hover:shadow-xl transition-all duration-300 text-left flex flex-col gap-4 relative overflow-hidden h-full" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--navy-mid)]" />
                    <div className="w-12 h-12 rounded-xl bg-[var(--cream-dark)] text-[var(--navy-mid)] flex items-center justify-center shadow-sm" style={{ transform: "translateZ(20px)" }}>
                      <v.icon size={22} />
                    </div>
                    <h4 className="text-xl font-normal font-serif text-[var(--navy-deep)]" style={{ transform: "translateZ(18px)" }}>
                      {v.title}
                    </h4>
                    <p className="text-[var(--text-secondary)] text-sm font-light leading-relaxed text-justify" style={{ transform: "translateZ(15px)" }}>
                      {v.desc}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STAGE 9: Parent Trust Callout Banner */}
      <section className="bg-gradient-to-r from-[#1A261D] to-[#2C4A3B] py-24 px-6 text-white relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute bottom-[-150px] right-[-150px] w-96 h-96 rounded-full bg-[var(--gold-primary)] opacity-10 blur-[80px] pointer-events-none" />

        <div className="container relative z-10 max-w-4xl mx-auto text-center">
          <span className="text-[var(--gold-light)] font-bold text-xs tracking-[3px] uppercase mb-4 inline-block">
            Charitable Outreach
          </span>
          <h2 className="text-3xl md:text-5xl font-normal font-serif mb-6 leading-tight text-white">
            About CWAY MISSIONS Religious Trust
          </h2>
          <p className="max-w-3xl mx-auto text-white/80 text-base md:text-lg font-light leading-relaxed mb-12 text-justify">
            CWAY MISSIONS Religious Trust is a registered charitable religious trust based in Bangalore, India. The Trust is committed to the holistic transformation of communities through evangelism, church planting, theological education, and compassion ministry across India&apos;s diverse cultural landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-[var(--gold-primary)] hover:bg-[var(--gold-light)] text-white font-bold rounded-full transition-all tracking-wider uppercase text-xs shadow-lg"
            >
              Contact the Trust
            </Link>
            <Link
              href="/donate"
              className="px-8 py-4 bg-transparent border-2 border-white/60 hover:border-white text-white hover:bg-white hover:text-[#1A261D] font-bold rounded-full transition-all tracking-wider uppercase text-xs"
            >
              Support the Ministry
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
