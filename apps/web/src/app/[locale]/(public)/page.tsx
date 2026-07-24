"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmailCard } from "@/components/EmailCard";
import { ContactContent } from "./contact/ContactContent";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTranslations } from "next-intl";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: string;
}

// Homepage blog posts are localized via landing.blog.posts (messages/*/landing.json)

export default function LandingPage() {
  const t = useTranslations("landing");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<Post | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});

  const toggleProgram = (id: string) => {
    setExpandedPrograms(prev => {
      const isExpanding = !prev[id];
      if (isExpanding) {
        setTimeout(() => {
          const el = document.getElementById(`program-courses-${id}`);
          if (el) {
            const yOffset = -100; 
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 50);
      }
      return { ...prev, [id]: isExpanding };
    });
  };

  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ["publicPrograms"],
    queryFn: () => api.get("/programs").then((res) => res.data.data),
  });
  const programsList = programsData || [];

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["publicCourses"],
    queryFn: () => api.get("/courses").then((res) => res.data.data),
  });
  const courses = coursesData?.courses || [];

  const standaloneCourses = React.useMemo(() => {
    return courses.filter((c: any) => !c.programId);
  }, [courses]);

  const { data: blogPostsData } = useQuery({
    queryKey: ["publicBlogPosts"],
    queryFn: () => api.get("/blog/posts?published=true").then((res) => res.data.data),
  });

  const displayPosts = React.useMemo(() => {
    if (blogPostsData && blogPostsData.length > 0) {
      return blogPostsData.map((p: any) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || "Click to read more...",
        content: p.content,
        author: p.customAuthor || p.author?.name || "CWAY Academy",
        authorRole: p.customAuthor ? "Author" : (p.author?.credentials || "Author"),
        date: new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        readTime: p.readingTime ? `${p.readingTime} min` : "5 min",
        category: "Article",
      }));
    }
    return t.raw("blog.posts") as Post[];
  }, [blogPostsData, t]);

  useEffect(() => {
    if (selectedBlogPost || showPrivacyModal || showTermsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedBlogPost, showPrivacyModal, showTermsModal]);

  useEffect(() => {
    // 1. Router System
    const navigateTo = () => {
      const hash = window.location.hash || "#home";
      const id = hash.replace("#", "");
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: "auto" });

      // Trigger reveal animations after render
      setTimeout(() => initRevealAnimations(id), 100);
    };

    navigateTo();
    window.addEventListener("hashchange", navigateTo);

    // 2. Scroll Progress & Navbar styling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const progressEl = document.getElementById("progress");
          if (progressEl) {
            const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            const pct = (window.scrollY / (docHeight - window.innerHeight)) * 100;
            progressEl.style.width = pct + "%";
          }

          const navEl = document.querySelector("nav");
          if (navEl) {
            if (window.scrollY > 50) {
              navEl.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.06)";
              navEl.style.height = "70px";
            } else {
              navEl.style.boxShadow = "none";
              navEl.style.height = "80px";
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("hashchange", navigateTo);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Reveal Animations Observer
  const initRevealAnimations = (tabId?: string) => {
    const currentTab = tabId || activeTab;
    const els = document.querySelectorAll(`#${currentTab} .reveal`);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);

          if (e.target.classList.contains("stat-item") && !e.target.getAttribute("data-counted")) {
            animateCounter(e.target.querySelector(".counter") as HTMLElement);
            e.target.setAttribute("data-counted", "true");
          }
        }
      });
    }, { threshold: 0.1 });

    els.forEach((el) => {
      el.classList.remove("in");
      obs.observe(el);
    });
  };

  useEffect(() => {
    if (!isLoadingPrograms || !isLoadingCourses) {
      setTimeout(() => initRevealAnimations(activeTab), 100);
    }
  }, [isLoadingPrograms, isLoadingCourses, activeTab]);

  // Stats Counter Animation
  const animateCounter = (el: HTMLElement | null) => {
    if (!el) return;
    const target = +(el.getAttribute("data-target") || 0);
    const duration = 2000;
    const startTime = performance.now();

    function update(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeProgress * target);

      if (el) {
        el.innerText = String(current);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.innerText = String(target);
        }
      }
    }
    requestAnimationFrame(update);
  };

  const getPageStyle = (tabId: string) => {
    const isActive = activeTab === tabId;
    return {
      display: isActive ? "block" : "none",
      opacity: isActive ? 1 : 0,
      transition: "opacity 0.4s ease"
    };
  };

  return (
    <>
      {/* Scope HTML styles strictly to page */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Color Palette - Forest & Sunlit Wood */
        :root {
            --bg-main: #FAFAF7;
            --bg-alt: #F3F4F0;
            --bg-soft: #EAECE4;
            --accent-green: #2C4A3B;
            --accent-green-light: #4A7A62;
            --accent-gold: #B88645;
            --accent-gold-light: #D4A35B;
            --text-main: #1A261D;
            --text-muted: #5A6B60;
            --border: #DCE0D5;
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
            --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.03);
            --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
            --shadow-xl: 0 24px 48px rgba(0, 0, 0, 0.12), 0 12px 24px rgba(0, 0, 0, 0.06);
            --radius-md: 16px;
            --radius-lg: 24px;
        }

        /* Reset styles */
        body { 
            font-family: var(--font-plus-jakarta), sans-serif !important; 
            background: var(--bg-main) !important; 
            color: var(--text-main) !important;
            padding-top: 80px !important; 
            overflow-x: hidden !important;
            max-width: 100vw !important;
            line-height: 1.7 !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        }
        html { max-width: 100vw; overflow-x: hidden; }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1rem, 4vw, 2rem); }
        .section { padding-top: clamp(4rem, 8vw, 7rem); padding-bottom: clamp(4rem, 8vw, 7rem); }
        .text-center { text-align: center; }

        /* Typography */
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-dm-serif), serif !important; color: var(--text-main); line-height: 1.15; }
        .headline-hero { font-weight: 400; font-size: clamp(42px, 6vw, 78px); line-height: 1.08; margin-bottom: 1.5rem; color: #FFFFFF; letter-spacing: -0.02em; }
        .headline-page { font-weight: 400; font-size: clamp(34px, 4.5vw, 58px); margin-bottom: 1rem; letter-spacing: -0.01em; }
        .heading-section { font-weight: 400; font-size: clamp(26px, 3.5vw, 44px); margin-bottom: 1rem; letter-spacing: -0.01em; }
        .sub-heading { font-family: var(--font-dm-serif), serif !important; font-style: italic; font-weight: 400; font-size: clamp(17px, 2vw, 22px); color: var(--text-muted); }
        .body-text { font-family: var(--font-plus-jakarta), sans-serif !important; font-size: 15.5px; color: var(--text-muted); line-height: 1.75; font-weight: 400; }
        .label { font-family: var(--font-plus-jakarta), sans-serif !important; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--accent-green); margin-bottom: 0.75rem; display: block; }

        /* Buttons */
        .btn-primary {
            background: var(--accent-green); color: #FFFFFF; border: 2px solid var(--accent-green);
            font-family: var(--font-plus-jakarta), sans-serif; font-weight: 700; font-size: 13px; padding: 15px 36px; border-radius: 50px;
            display: inline-block; text-align: center; box-shadow: var(--shadow-md);
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 1.5px; text-transform: uppercase;
        }
        .btn-primary:hover { background: transparent; color: var(--accent-green); box-shadow: none; transform: translateY(-3px); }
        
        .btn-secondary {
            background: transparent; color: var(--accent-gold); border: 2px solid var(--accent-gold);
            font-family: var(--font-plus-jakarta), sans-serif; font-weight: 700; font-size: 13px; padding: 15px 36px; border-radius: 50px;
            display: inline-block; text-align: center; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 1.5px; text-transform: uppercase;
        }
        .btn-secondary:hover { background: var(--accent-gold); color: #FFFFFF; box-shadow: var(--shadow-md); transform: translateY(-3px); }

        /* Navigation */
        nav {
            position: fixed; top: 0; left: 0; width: 100%; height: 80px;
            background: rgba(250, 250, 247, 0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(220, 224, 213, 0.6); z-index: 1000;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 clamp(1rem, 5%, 2.5rem); transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box;
        }
        .nav-brand { display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex-shrink: 1; }
        .nav-logo-text { 
            font-family: var(--font-cinzel), 'Cinzel', Georgia, serif !important;
            font-size: clamp(16px, 4vw, 21px);
            font-weight: 700;
            letter-spacing: clamp(1.5px, 0.5vw, 3px);
            color: var(--text-main);
            text-transform: uppercase;
            line-height: 1;
            white-space: nowrap;
        }
        .nav-logo-text .logo-cway {
            color: var(--text-main);
        }
        .nav-logo-text .logo-academy {
            color: var(--accent-gold);
            font-weight: 400;
            letter-spacing: clamp(2px, 0.7vw, 4px);
        }
        
        .nav-links { display: flex; gap: 2.5rem; align-items: center; }
        .nav-links a {
            font-family: var(--font-plus-jakarta), sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
            color: var(--text-muted); position: relative; padding: 0.5rem 0;
            transition: all 0.35s ease;
        }
        .nav-links a:hover { color: var(--accent-green); }
        .nav-links a::after {
            content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px;
            background: var(--accent-green); transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-links a:hover::after, .nav-links a.nav-active::after { width: 100%; }
        .nav-links a.nav-active { color: var(--accent-green); }
        
        .hamburger { display: none; flex-direction: column; cursor: pointer; gap: 6px; flex-shrink: 0; }
        .hamburger span { width: 24px; height: 2px; background: var(--text-main); transition: 0.3s; border-radius: 2px; }
        .nav-actions { display: flex; gap: 1rem; align-items: center; flex-shrink: 0; }

        .mobile-overlay {
            background: var(--bg-main); position: fixed; top: 0; left: 0; width: 100%; height: 100vh; height: 100svh;
            z-index: 999; transform: translateY(-100%); transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            gap: min(3vh, 1.5rem); overflow: hidden; padding: 5rem 1.5rem 2rem;
        }
        .mobile-overlay.open { transform: translateY(0); }
        .mobile-overlay-close { position: absolute; top: 24px; right: clamp(1rem, 5%, 2rem); font-size: 32px; color: var(--text-main); cursor: pointer; }
        .mobile-overlay a {
            font-family: var(--font-dm-serif), serif; font-size: clamp(18px, 4.5vh, 26px); font-weight: 400; color: var(--text-main);
            text-align: center; transition: all 0.3s ease;
        }
        .mobile-overlay a:hover { color: var(--accent-green); }

        /* Progress Bar */
        #progress { position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: linear-gradient(to right, var(--accent-green-light), var(--accent-gold)); z-index: 1001; transition: width 0.1s linear; }

        /* Reveal Animations */
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
        .reveal.in { opacity: 1; transform: translateY(0); }
        .stagger-1 { transition-delay: 0.12s; } .stagger-2 { transition-delay: 0.24s; } .stagger-3 { transition-delay: 0.36s; }

        @keyframes fadeUpHero {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-hero {
          animation: fadeUpHero 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Hero */
        .hero-section { 
            min-height: calc(100vh - 80px); 
            position: relative; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            text-align: center; 
            overflow: hidden; 
            padding: 5rem 1.5rem 3rem; 
        }
        .hero-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(160deg, rgba(44, 74, 59, 0.7), rgba(26, 38, 29, 0.92));
            z-index: 1;
        }
        .hero-content { position: relative; z-index: 2; max-width: 860px; margin: 0 auto; padding: 0 0.5rem; width: 100%; }
        .hero-btn-group { display: flex; gap: 1.5rem; justify-content: center; margin-top: 3rem; flex-wrap: wrap; }

        .hero-content .body-text { color: rgba(255,255,255,0.85); font-size: 18px; }
        .hero-content .btn-primary { background: var(--accent-gold); border-color: var(--accent-gold); color: white; }
        .hero-content .btn-primary:hover { background: transparent; color: var(--accent-gold); }
        .hero-content .btn-secondary { background: transparent; border-color: rgba(255,255,255,0.6); color: white; }
        .hero-content .btn-secondary:hover { background: white; color: var(--accent-green); border-color: white; }

        /* Cards */
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3rem; align-items: center; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }

        .card { 
            background: #FFFFFF; 
            border-radius: var(--radius-lg); 
            padding: 2.5rem 2rem; 
            box-shadow: var(--shadow-sm); 
            border: 1px solid rgba(220, 224, 213, 0.5); 
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-gold-light));
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        .card:hover { 
            transform: translateY(-6px); 
            box-shadow: var(--shadow-lg); 
            border-color: transparent; 
        }
        .card:hover::before { opacity: 1; }
        
        .card-accent-bar {
            width: 40px; height: 3px; border-radius: 2px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-green-light));
            margin-bottom: 1.5rem;
        }

        /* Stats */
        .stats-section { background: var(--accent-green); color: white; padding-top: 5rem; padding-bottom: 5rem; position: relative; overflow: hidden; }
        .stats-section::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 20% 50%, rgba(74, 122, 98, 0.3), transparent 50%),
                        radial-gradient(circle at 80% 50%, rgba(184, 134, 69, 0.15), transparent 50%);
        }
        .stat-item { text-align: center; position: relative; z-index: 1; }
        .stat-num { font-family: var(--font-dm-serif), serif !important; font-size: 3.5rem; font-weight: 400; margin-bottom: 0.5rem; color: white; }
        .stat-label { font-family: var(--font-plus-jakarta), sans-serif !important; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.7); }

        /* Page Headers */
        .page-header { background: var(--bg-alt); padding-top: clamp(3.5rem, 6vw, 6rem); padding-bottom: clamp(2.5rem, 4vw, 4rem); text-align: center; border-bottom: 1px solid var(--border); }
        .page-header p { max-width: 700px; margin: 0 auto; }

        /* About challenge box & quotes */
        .challenge-box { background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; border-left: 3px solid var(--accent-green); text-align: left; box-shadow: var(--shadow-sm); transition: all 0.3s ease; }
        .challenge-box:hover { box-shadow: var(--shadow-md); transform: translateX(4px); }
        .quote-text { font-family: var(--font-dm-serif), serif !important; font-size: 22px; font-style: italic; color: var(--accent-green); line-height: 1.5; border-left: 3px solid var(--accent-gold); padding-left: 2rem; margin: 3rem 0; text-align: left; }

        /* Badges */
        .course-card { display: flex; flex-direction: column; justify-content: space-between; height: 100%; text-align: left; }
        .course-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .badge { background: var(--bg-soft); color: var(--accent-green); font-family: var(--font-plus-jakarta), sans-serif; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Team placeholder */
        .team-card { text-align: center; }
        .team-img-placeholder { 
            width: 110px; height: 110px; 
            background: linear-gradient(135deg, var(--accent-green), var(--accent-green-light)); 
            border-radius: 50%; margin: 0 auto 1.5rem; 
            display: flex; align-items: center; justify-content: center; 
            font-family: var(--font-dm-serif), serif !important; font-size: 32px; font-weight: 400; 
            color: white; 
            box-shadow: 0 8px 24px rgba(44, 74, 59, 0.25);
            transition: all 0.4s ease;
        }
        .team-card:hover .team-img-placeholder { transform: scale(1.05); box-shadow: 0 12px 32px rgba(44, 74, 59, 0.3); }

        /* Partnership list & bank details */
        .partner-list { list-style: none; counter-reset: partner-counter; text-align: left; }
        .partner-list li { position: relative; padding-left: 4rem; margin-bottom: 2rem; font-size: 16px; color: var(--text-muted); line-height: 1.7; }
        .partner-list li::before { counter-increment: partner-counter; content: "0" counter(partner-counter); position: absolute; left: 0; top: -4px; font-family: var(--font-dm-serif), serif; font-size: 26px; font-weight: 400; color: var(--accent-gold-light); }
        .bank-card { background: #FFFFFF; padding: 3rem; border-radius: var(--radius-lg); text-align: center; border: 1px dashed var(--accent-green); box-shadow: var(--shadow-sm); }

        /* Blog details */
        .blog-card { overflow: hidden; padding: 0; text-align: left; transition: all 0.3s ease; }
        .blog-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg) !important; border-color: var(--accent-gold) !important; }
        .blog-content { padding: 2.5rem 2.5rem; }
        .blog-label-bar { width: 32px; height: 3px; border-radius: 2px; background: var(--accent-gold); margin-bottom: 1rem; }
        .blog-read { font-family: var(--font-plus-jakarta), sans-serif; font-weight: 700; color: var(--accent-green); display: inline-flex; align-items: center; gap: 8px; margin-top: 1.5rem; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; cursor: pointer; transition: all 0.3s ease; }
        .blog-read:hover { color: var(--accent-gold); gap: 14px; }
        .hover-close:hover { background: var(--bg-soft); color: var(--text-main) !important; }
        .hover-btn-close:hover { background: var(--bg-soft); color: var(--text-main) !important; }

        /* Footer */
        footer { background: var(--bg-alt); padding: 5rem 0 2rem; border-top: 1px solid var(--border); text-align: left; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 4rem; }
        .footer-bottom { border-top: 1px solid var(--border); text-align: center; padding-top: 2rem; margin-top: 4rem; color: var(--text-muted); font-size: 13px; }

        /* What We Offer Grid - Responsive Grid */
        .what-we-offer-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            margin-bottom: 40px;
        }
        .offer-card-item {
            background: #fff;
            border-radius: 20px;
            padding: 44px 36px;
            border: 1px solid #DCE0D5;
            position: relative;
            overflow: hidden;
            transition: transform 0.4s, box-shadow 0.4s, border-color 0.4s;
            cursor: default;
        }

        /* Vision/Mission Cards special */
        .vm-card { text-align: center; }
        .vm-card-number { 
            font-family: var(--font-dm-serif), serif !important; 
            font-size: 48px; 
            font-weight: 400; 
            color: var(--bg-soft); 
            line-height: 1; 
            margin-bottom: 1rem;
            background: linear-gradient(180deg, var(--accent-green), var(--accent-green-light));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            opacity: 0.2;
        }

        /* Premium About Page Styles */
        .about-header-wrapper {
            background: linear-gradient(135deg, #1A261D 0%, #2C4A3B 100%);
            color: #FFFFFF;
            padding-top: clamp(5rem, 10vw, 8rem); padding-bottom: clamp(3rem, 6vw, 6rem);
            position: relative;
            overflow: hidden;
        }
        .about-header-wrapper::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 80% 20%, rgba(184, 134, 69, 0.25), transparent 50%),
                        radial-gradient(circle at 10% 80%, rgba(74, 122, 98, 0.3), transparent 60%);
            pointer-events: none;
        }
        .about-header-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 4rem;
            align-items: center;
        }
        .about-header-quote {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-left: 3px solid var(--accent-gold);
            padding: 2rem;
            border-radius: 0 var(--radius-md) var(--radius-md) 0;
            font-family: var(--font-dm-serif), serif;
            font-style: italic;
            font-size: 1.15rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            border-top: 1px solid rgba(255,255,255,0.08);
            border-right: 1px solid rgba(255,255,255,0.08);
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        
        .challenge-section {
            padding-top: clamp(4rem, 8vw, 8rem); padding-bottom: clamp(4rem, 8vw, 8rem);
            background: var(--bg-main);
        }
        .challenge-new-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5rem;
            align-items: start;
        }
        .challenge-left-content {
            position: sticky;
            top: 120px;
            text-align: left;
        }
        .challenge-quote-card {
            background: linear-gradient(135deg, var(--accent-green) 0%, #1A261D 100%);
            color: #FFFFFF;
            padding: 3.5rem 3rem;
            border-radius: var(--radius-lg);
            border-left: 4px solid var(--accent-gold);
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
            text-align: left;
            margin-top: 2.5rem;
        }
        .challenge-quote-card::before {
            content: '“';
            position: absolute;
            top: -20px;
            left: 20px;
            font-size: 12rem;
            font-family: var(--font-dm-serif), serif;
            color: rgba(255, 255, 255, 0.05);
            line-height: 1;
            pointer-events: none;
            user-select: none;
        }
        .challenge-list-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        .challenge-list-item {
            display: flex;
            gap: 2rem;
            padding: 2.5rem 1.5rem;
            border-bottom: 1px solid var(--border);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: transparent;
            text-align: left;
        }
        .challenge-list-item:first-child {
            border-top: 1px solid var(--border);
        }
        .challenge-list-number {
            font-family: var(--font-dm-serif), serif !important;
            font-size: 2.8rem;
            line-height: 1;
            font-weight: 400;
            color: var(--accent-gold);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .challenge-list-content {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .challenge-list-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--accent-green);
            margin: 0;
            transition: color 0.35s ease;
        }
        .challenge-list-item:hover {
            background: rgba(44, 74, 59, 0.03);
            padding-left: 2.5rem;
            padding-right: 1rem;
            border-radius: var(--radius-md);
            border-bottom-color: transparent;
        }
        .challenge-list-item:hover + .challenge-list-item {
            border-top-color: transparent;
        }
        .challenge-list-item:hover .challenge-list-number {
            color: var(--accent-green);
            transform: scale(1.1) translateX(4px);
        }
        .challenge-list-item:hover .challenge-list-title {
            color: var(--accent-gold-light);
        }

        .vm-section {
            padding-top: clamp(4rem, 8vw, 8rem); padding-bottom: clamp(4rem, 8vw, 8rem);
            background: var(--bg-alt);
            position: relative;
            overflow: hidden;
        }
        .vm-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            max-width: 1100px;
            margin: 0 auto;
        }
        .vm-card-green {
            background: linear-gradient(135deg, var(--accent-green) 0%, #1A261D 100%);
            color: #FFFFFF;
            padding: 4rem 3.5rem;
            border-radius: var(--radius-lg);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
        }
        .vm-card-gold {
            background: linear-gradient(135deg, var(--accent-gold) 0%, #8A6432 100%);
            color: #FFFFFF;
            padding: 4rem 3.5rem;
            border-radius: var(--radius-lg);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
        }
        .vm-card-green:hover, .vm-card-gold:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-xl);
        }
        .vm-letter {
            position: absolute;
            bottom: -20px;
            right: -10px;
            font-size: 10rem;
            font-family: var(--font-dm-serif), serif;
            font-weight: 700;
            opacity: 0.08;
            user-select: none;
            pointer-events: none;
            line-height: 1;
        }
        .vm-header {
            font-family: var(--font-dm-serif), serif !important;
            font-size: 2.2rem !important;
            color: #FFFFFF !important;
            margin-bottom: 1.5rem;
            position: relative;
            z-index: 1;
        }
        .vm-text {
            color: rgba(255, 255, 255, 0.85) !important;
            font-size: 1.05rem !important;
            line-height: 1.8 !important;
            position: relative;
            z-index: 1;
        }

        .team-section {
            padding-top: clamp(4rem, 8vw, 8rem); padding-bottom: clamp(4rem, 8vw, 8rem);
            background: var(--bg-main);
        }
        .team-list-container {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
            margin-top: 4rem;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
        }
        .modern-team-row-card {
            background: #FFFFFF;
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 2.5rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: grid;
            grid-template-columns: min(220px, 100%) 1fr;
            gap: 2.5rem;
            align-items: center;
            text-align: left;
        }
        .modern-team-row-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-xl);
            border-color: var(--accent-gold-light);
        }
        .team-avatar-container {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-bottom: 1rem;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-light) 100%);
            box-shadow: 0 6px 20px rgba(44, 74, 59, 0.15);
            transition: all 0.4s ease;
        }
        .team-avatar-container::after {
            content: '';
            position: absolute;
            top: -6px; left: -6px; right: -6px; bottom: -6px;
            border-radius: 50%;
            border: 2px dashed var(--accent-gold);
            opacity: 0.5;
            transition: all 0.4s ease;
        }
        .modern-team-row-card:hover .team-avatar-container {
            transform: scale(1.05) rotate(5deg);
            box-shadow: 0 10px 30px rgba(44, 74, 59, 0.3);
        }
        .modern-team-row-card:hover .team-avatar-container::after {
            transform: rotate(-15deg);
            opacity: 1;
            border-color: var(--accent-gold-light);
        }
        .team-initials {
            font-family: var(--font-dm-serif), serif !important;
            font-size: 1.8rem;
            color: #FFFFFF;
            font-weight: 400;
        }
        .team-role {
            color: var(--accent-gold);
            font-family: var(--font-plus-jakarta), sans-serif !important;
            font-weight: 700;
            font-size: 0.75rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0.5rem 0 1rem;
            line-height: 1.3;
        }
        .team-credential-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background-color: #F3F4F0;
            color: var(--accent-green);
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 50px;
        }
        .team-row-left {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 1.5rem;
            width: 100%;
        }
        .team-row-right {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .team-separator {
            width: 48px;
            height: 2px;
            background-color: var(--accent-gold-light);
            margin-bottom: 1rem;
            margin-left: auto;
            margin-right: auto;
        }
        @media (min-width: 993px) {
            .team-row-left {
                align-items: flex-start;
                text-align: left;
                border-bottom: none;
                border-right: 1px solid var(--border);
                padding-bottom: 0;
                padding-right: 2.5rem;
            }
            .team-row-right {
                align-items: flex-start;
                text-align: left;
                padding-left: 2rem;
            }
            .team-separator {
                margin-left: 0;
                margin-right: 0;
            }
        }

        /* Offer section styles */
        .offer-section-grid {
            display: grid;
            grid-template-columns: 1fr 1.6fr;
            gap: 5rem;
            align-items: start;
        }
        .offer-left-column {
            position: sticky;
            top: 120px;
            text-align: left;
        }
        .offer-checklist {
            list-style: none;
            padding: 0;
            margin: 2.5rem 0;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }
        .offer-checklist-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-main);
            font-size: 15.5px;
            font-weight: 500;
        }
        .offer-checklist-icon {
            color: var(--accent-green);
            flex-shrink: 0;
        }
        .offer-right-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        .offer-card {
            background: linear-gradient(135deg, #FFFFFF 0%, #FAFBF9 100%);
            border: 1px solid rgba(44, 74, 59, 0.08);
            border-radius: var(--radius-lg);
            padding: 3rem 2.2rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            text-align: left;
        }
        .offer-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-gold));
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        .offer-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-xl);
            border-color: rgba(44, 74, 59, 0.15);
        }
        .offer-card:hover::before {
            opacity: 1;
        }
        .offer-icon-circle {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 1px dashed transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: all 0.5s ease;
        }
        .offer-icon-inner {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(44, 74, 59, 0.06);
            color: var(--accent-green);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s ease;
        }
        .offer-card:hover .offer-icon-circle {
            border-color: var(--accent-gold);
            transform: rotate(15deg);
        }
        .offer-card:hover .offer-icon-inner {
            background: var(--accent-green);
            color: #FFFFFF;
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(44, 74, 59, 0.25);
        }
        .offer-card-arrow {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--accent-green);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.6;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .offer-card:hover .offer-card-arrow {
            opacity: 1;
            color: var(--accent-gold);
        }
        .offer-card-arrow svg {
            transition: transform 0.3s ease;
        }
        .offer-card:hover .offer-card-arrow svg {
            transform: translateX(4px);
        }

        /* Responsive Layouts */
        @media (max-width: 992px) {
            .grid-4, .grid-3 { grid-template-columns: repeat(2, 1fr); }
            .grid-2 { grid-template-columns: 1fr; }
            .about-header-grid { grid-template-columns: 1fr; gap: 2.5rem; }
            .challenge-grid { grid-template-columns: 1fr; gap: 2rem; }
            .vm-grid { grid-template-columns: 1fr; gap: 2.5rem; }
            .modern-team-row-card { grid-template-columns: 1fr; gap: 1.5rem; }
            .team-list-container { gap: 2rem; }
            .offer-section-grid { grid-template-columns: 1fr; gap: 3rem; }
            .offer-left-column { position: relative; top: 0; }
            .challenge-new-grid { grid-template-columns: 1fr; gap: 3.5rem; }
            .challenge-left-content { position: relative; top: 0; }
            .offer-right-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
            .what-we-offer-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .hero-section { background-attachment: scroll !important; }
        }
        @media (max-width: 1150px) {
            .nav-links { display: none; }
            .nav-actions { display: none; }
            .hamburger { display: flex; }
        }
        @media (max-width: 768px) {
            .hero-btn-group { flex-direction: column !important; align-items: stretch !important; gap: 0.85rem !important; }
            .hero-btn-group a, .hero-btn-group button { width: 100% !important; text-align: center !important; justify-content: center !important; }
            .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
            .footer-grid { grid-template-columns: 1fr; text-align: center; }
            .stats-section .grid-4 { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
            .section { padding-top: 4rem; padding-bottom: 4rem; }
            .page-header { padding-top: 7rem; padding-bottom: 2rem; }
            .headline-page { font-size: clamp(28px, 8vw, 44px); }
            .headline-hero { font-size: clamp(30px, 8vw, 46px); }
            .offer-right-grid { grid-template-columns: 1fr !important; gap: 1.25rem; }
            .what-we-offer-grid { grid-template-columns: 1fr !important; }
            .what-we-offer-grid > div { padding: 2rem 1.5rem !important; }
            .offer-card-item { padding: 2rem 1.5rem !important; }
            .program-card-header { padding: 2rem 1.25rem !important; }
            .program-btn-group { flex-direction: column !important; align-items: stretch !important; gap: 0.85rem !important; }
            .program-btn-group a, .program-btn-group button { width: 100% !important; text-align: center !important; justify-content: center !important; }
            /* Team row card */
            .modern-team-row-card { grid-template-columns: 1fr; gap: 1.25rem; padding: 1.5rem 1.25rem; }
            .team-row-left { border-right: none; border-bottom: 1px solid var(--border); padding-right: 0; padding-bottom: 1.5rem; align-items: center; text-align: center; }
            .team-row-right { padding-left: 0 !important; text-align: left; align-items: flex-start; }
            .team-avatar-container { margin: 0 auto 1rem auto; }
            /* About challenge grid */
            .challenge-new-grid { grid-template-columns: 1fr; }
            .challenge-left-content { position: relative; top: 0; }
            .challenge-quote-card { padding: 1.75rem 1.25rem; margin-top: 1.5rem; }
            /* VM section */
            .vm-grid { grid-template-columns: 1fr; gap: 2rem; }
            .vm-card-green, .vm-card-gold { padding: 2.5rem 2rem; }
            /* Nav logo reduce */
            .nav-logo-text { font-size: 17px !important; letter-spacing: 2px !important; }
            /* Stat bar on blog/courses pages */
            .stats-bar-4col { grid-template-columns: repeat(2, 1fr) !important; }
            /* Hero section padding */
            .hero-section { padding: 4rem 1.25rem 3rem !important; min-height: 100svh !important; }
            /* Blog reader modal — full screen */
            .blog-modal-panel { max-width: 100vw !important; max-height: 100vh !important; border-radius: 0 !important; margin: 0 !important; }
            .blog-modal-overlay { padding: 0 !important; }
            /* Blog cards */
            .blog-cards-2col { grid-template-columns: 1fr !important; }
            /* Bank card */
            .bank-card { padding: 2rem 1.25rem; }
            /* Partner list */
            .partner-list li { padding-left: 3rem; }
            /* Section padding */
            .section { padding-top: 3.5rem !important; padding-bottom: 3.5rem !important; }
            /* About page dark section */
            .dark-gradient-section { padding-left: 1.25rem; padding-right: 1.25rem; }
            /* Challenge section */
            .challenge-section { padding-top: 4rem !important; padding-bottom: 4rem !important; }
            /* Team section */
            .team-section { padding-top: 4rem !important; padding-bottom: 4rem !important; }
            .team-list-container { gap: 1.5rem !important; margin-top: 2rem !important; }
        }
        @media (max-width: 640px) {
            .offer-right-grid { grid-template-columns: 1fr; gap: 1.25rem; }
            .what-we-offer-grid { grid-template-columns: 1fr !important; }
            .hero-stat-row { flex-direction: column; gap: 1rem; }
            .container { padding: 0 1rem; }
            nav { padding: 0 1rem !important; }
        }
        @media (max-width: 480px) {
            .nav-logo-text { font-size: 15px !important; letter-spacing: 1.5px !important; }
            .headline-hero { font-size: clamp(28px, 8.5vw, 38px) !important; }
            .headline-page { font-size: clamp(24px, 7.5vw, 34px) !important; }
            .heading-section { font-size: clamp(22px, 6.5vw, 30px) !important; }
            .section { padding-top: 3rem !important; padding-bottom: 3rem !important; }
            .page-header { padding: 2.5rem 0 1.5rem !important; }
            .blog-modal-panel { border-radius: 0 !important; }
            .challenge-list-number { font-size: 2.2rem !important; }
            .challenge-list-item { gap: 1.25rem !important; padding: 1.5rem 0.75rem !important; }
            .what-we-offer-grid > div { padding: 1.5rem 1.25rem !important; }
            .card { padding: 1.5rem 1.25rem !important; }
            .blog-content { padding: 1.5rem 1.25rem !important; }
            .modern-team-row-card { padding: 1.25rem 1rem !important; }
            .vm-card-green, .vm-card-gold { padding: 2rem 1.5rem !important; }
            .hero-section { padding: 3.5rem 1rem 2.5rem !important; }
        }
        @media (max-width: 380px) {
            .nav-logo-text { font-size: 14px !important; letter-spacing: 1px !important; }
            .container { padding: 0 0.75rem !important; }
            .headline-hero { font-size: clamp(26px, 8vw, 34px) !important; }
            nav { padding: 0 0.75rem !important; }
            .stat-num { font-size: 2rem !important; }
            .blog-content { padding: 1.25rem 1rem !important; }
        }
      ` }} />

      {/* Progress Scrollbar */}
      <div id="progress"></div>

      {/* Header Navigation */}
      <nav>
        <div className="nav-brand">
          <Image 
            src="/logo.png" 
            alt="CWAY Academy Logo" 
            width={48}
            height={48}
            style={{ objectFit: "contain", flexShrink: 0 }}
            priority
          />
          <div className="nav-logo-text"><span className="logo-cway">CWAY</span><span className="logo-academy"> ACADEMY</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div className="nav-links">
            <a href="#home" className={activeTab === "home" ? "nav-active" : ""}>{t("nav.home")}</a>
            <a href="#about" className={activeTab === "about" ? "nav-active" : ""}>{t("nav.about")}</a>
            <a href="#courses" className={activeTab === "courses" ? "nav-active" : ""}>{t("nav.courses")}</a>
            <a href="#involved" className={activeTab === "involved" ? "nav-active" : ""}>{t("nav.involved")}</a>
            <a href="#blog" className={activeTab === "blog" ? "nav-active" : ""}>{t("nav.blog")}</a>
            <a href="#contact" className={activeTab === "contact" ? "nav-active" : ""}>{t("nav.contact")}</a>
          </div>
          
          <div className="nav-actions">
            <LanguageSwitcher />
            <Link href="/login" className="btn-primary" style={{ padding: "10px 24px", fontSize: "11px" }}>{t("nav.login")}</Link>
          </div>

          <div className="hamburger" onClick={() => setMobileMenuOpen(true)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} id="mobile-overlay">
        <div className="mobile-overlay-close" onClick={() => setMobileMenuOpen(false)}>×</div>
        <a href="#home" className={activeTab === "home" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>{t("nav.home")}</a>
        <a href="#about" className={activeTab === "about" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>{t("nav.about")}</a>
        <a href="#courses" className={activeTab === "courses" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>{t("nav.courses")}</a>
        <a href="#involved" className={activeTab === "involved" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>{t("nav.involved")}</a>
        <a href="#blog" className={activeTab === "blog" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>{t("nav.blog")}</a>
        <a href="#contact" className={activeTab === "contact" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>{t("nav.contact")}</a>
        <div style={{ width: "40px", height: "1px", background: "var(--accent-gold)", opacity: 0.3 }}></div>
        <div>
          <LanguageSwitcher upward={true} />
        </div>
        <Link href="/login" className="btn-primary" style={{ padding: "14px 32px", fontSize: "13px" }}>{t("nav.login")}</Link>
      </div>

      {/* ─── HOME PAGE ─── */}
      <section id="home" className="page" style={getPageStyle("home")}>
        <div className="hero-section">
          <Image 
            src="/hero-bg.png" 
            alt="CWAY Academy" 
            fill 
            style={{ objectFit: "cover", zIndex: 0 }} 
            priority 
            quality={90} 
          />
          <div className="hero-overlay"></div>
          <div className="hero-content reveal-hero">
            <span className="label" style={{ justifyContent: "center", marginBottom: "1.5rem", color: "var(--accent-gold-light)" }}>Cway Missions Presents</span>
            <h1 className="headline-hero">{t("hero.title_1")}<br /><span style={{ color: "var(--accent-gold-light)" }}>{t("hero.title_2")}</span></h1>
            <p className="body-text" style={{ fontSize: "18px", maxWidth: "580px", margin: "0 auto", color: "rgba(255,255,255,0.85)" }}>{t("hero.subtitle")}</p>
            <div className="hero-btn-group">
              <a href="#about" className="btn-primary">{t("hero.button")}</a>
            </div>
          </div>
        </div>

        {/* ── WHAT WE OFFER ── */}
        <div className="section" style={{ background: "linear-gradient(180deg, #F7F8F4 0%, #EDEEE8 100%)", padding: "clamp(80px, 10vw, 140px) 0" }}>
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            {/* Section Header — centered */}
            <div className="reveal" style={{ textAlign: "center", marginBottom: "64px" }}>
              <span className="label" style={{ color: "var(--accent-green)", letterSpacing: "3px", fontSize: "11px", fontWeight: 700 }}>{t("offer.label")}</span>
              <h2 className="heading-section" style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.15, marginTop: "12px", marginBottom: "20px", color: "var(--accent-green)" }}>
                {t("offer.title")}
              </h2>
              <p className="body-text" style={{ fontSize: "17px", maxWidth: "620px", margin: "0 auto", color: "#5A6B5D" }}>
                {t("offer.subtitle")}
              </p>
            </div>

            {/* Feature Cards — 2×2 grid */}
            <div className="what-we-offer-grid">
              {[
                { num: "01", title: t("offer.feature_1_title"), desc: t("offer.feature_1_desc") },
                { num: "02", title: t("offer.feature_2_title"), desc: t("offer.feature_2_desc") },
                { num: "03", title: t("offer.feature_3_title"), desc: t("offer.feature_3_desc") },
                { num: "04", title: t("offer.feature_4_title"), desc: t("offer.feature_4_desc") }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`reveal offer-card-item ${i > 0 ? `stagger-${Math.min(i, 3)}` : ""}`}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(44,74,59,0.12)"; e.currentTarget.style.borderColor = "var(--accent-gold-light)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#DCE0D5"; }}
                >
                  {/* Number watermark */}
                  <span style={{
                    position: "absolute", top: "-8px", right: "16px",
                    fontSize: "96px", fontWeight: 800, lineHeight: 1,
                    color: "#2C4A3B", opacity: 0.04,
                    fontFamily: "var(--font-serif, Georgia, serif)",
                    pointerEvents: "none", userSelect: "none"
                  }}>{item.num}</span>

                  {/* Gold accent bar */}
                  <div style={{ width: "36px", height: "3px", background: "var(--accent-gold-light)", borderRadius: "2px", marginBottom: "24px" }} />

                  <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--accent-green)", marginBottom: "12px", fontFamily: "var(--font-serif, Georgia, serif)" }}>{item.title}</h3>
                  <p className="body-text" style={{ fontSize: "14.5px", lineHeight: 1.65, color: "#5A6B5D" }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom banner row */}
            <div className="reveal courses-banner-row">
              <div className="courses-banner-tags">
                {[t("offer.banner_1"), t("offer.banner_2"), t("offer.banner_3")].map((text, i) => (
                  <span key={i} className="courses-banner-tag">{text}</span>
                ))}
              </div>
              <a href="#courses" className="btn-primary" style={{ padding: "14px 32px", fontSize: "12px", textAlign: "center" }}>{t("offer.button")}</a>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="container grid-4">
            <div className="stat-item reveal">
              <div className="stat-num counter" data-target="10">0</div>
              <div className="stat-label">{t("stats.label_1")}</div>
            </div>
            <div className="stat-item reveal stagger-1">
              <div className="stat-num counter" data-target="60">0</div>
              <div className="stat-label">{t("stats.label_2")}</div>
            </div>
            <div className="stat-item reveal stagger-2">
              <div className="stat-num">15</div>
              <div className="stat-label">{t("stats.label_3")}</div>
            </div>
            <div className="stat-item reveal stagger-3">
              <div className="stat-num">∞</div>
              <div className="stat-label">{t("stats.label_4")}</div>
            </div>
          </div>
        </div>

        <div className="section" style={{ background: "var(--bg-alt)" }}>
          <div className="container text-center reveal">
            <span className="label text-center">{t("next_step.label")}</span>
            <h2 className="heading-section">{t("next_step.title")}</h2>
            <p className="sub-heading" style={{ marginBottom: "3rem" }}>{t("next_step.subtitle")}</p>
            <a href="#contact" className="btn-primary">{t("next_step.button")}</a>
          </div>
        </div>
      </section>

      {/* ─── ABOUT PAGE ─── */}
      <section id="about" className="page" style={getPageStyle("about")}>
        {/* About Header */}
        <div className="about-header-wrapper">
          <div className="container about-header-grid reveal">
            <div>
              <span className="label" style={{ color: "var(--accent-gold-light)", marginBottom: "1rem" }}>{t("about.label")}</span>
              <h1 className="headline-page" style={{ color: "#FFFFFF", marginBottom: "1.5rem" }}>{t("about.title")}</h1>
              <p className="body-text" style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "1.1rem", lineHeight: "1.8", maxWidth: "680px" }}>
                {t("about.desc")}
              </p>
            </div>
            <div className="about-header-quote">
              {t("about.quote")}
            </div>
          </div>
        </div>

        {/* The Challenges Section */}
        <div className="challenge-section">
          <div className="container">
            <div className="challenge-new-grid">
              {/* Left Column: Heading & Quote Card */}
              <div className="challenge-left-content reveal">
                <span className="label">{t("challenge.label")}</span>
                <h2 className="heading-section" style={{ fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: "1.2", marginBottom: "1.5rem" }}>
                  {t("challenge.title")}
                </h2>
                <p className="body-text" style={{ fontSize: "16px" }}>
                  {t("challenge.desc")}
                </p>

                <div className="challenge-quote-card">
                  <p style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontSize: "18px", lineHeight: 1.7, color: "#FFFFFF" }}>
                    {t("challenge.quote")}
                  </p>
                </div>
              </div>

              {/* Right Column: Challenges List */}
              <div className="challenge-list-container">
                <p className="body-text font-semibold text-[var(--text-main)] mb-2" style={{ textAlign: "left" }}>
                  {t("challenge.list_heading")}
                </p>
                <div className="challenge-list-item reveal">
                  <div className="challenge-list-number">01</div>
                  <div className="challenge-list-content">
                    <h3 className="challenge-list-title">{t("challenge.item_1_title")}</h3>
                    <p className="body-text" style={{ fontSize: "14.5px" }}>{t("challenge.item_1_desc")}</p>
                  </div>
                </div>

                <div className="challenge-list-item reveal stagger-1">
                  <div className="challenge-list-number">02</div>
                  <div className="challenge-list-content">
                    <h3 className="challenge-list-title">{t("challenge.item_2_title")}</h3>
                    <p className="body-text" style={{ fontSize: "14.5px" }}>{t("challenge.item_2_desc")}</p>
                  </div>
                </div>

                <div className="challenge-list-item reveal stagger-2">
                  <div className="challenge-list-number">03</div>
                  <div className="challenge-list-content">
                    <h3 className="challenge-list-title">{t("challenge.item_3_title")}</h3>
                    <p className="body-text" style={{ fontSize: "14.5px" }}>{t("challenge.item_3_desc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div className="vm-section">
          <div className="container text-center">
            <span className="label text-center">{t("response.label")}</span>
            <h2 className="heading-section" style={{ marginBottom: "2rem" }}>{t("response.title")}</h2>
            <p className="body-text" style={{ marginBottom: "4rem", maxWidth: "800px", margin: "0 auto 4rem" }}>
              {t("response.desc")}
            </p>

            <div className="vm-grid">
              <div className="vm-card-green reveal">
                <div className="vm-letter">{t("response.vision_label")}</div>
                <h3 className="vm-header">{t("response.vision_title")}</h3>
                <p className="vm-text">{t("response.vision_desc")}</p>
              </div>
              <div className="vm-card-gold reveal stagger-1">
                <div className="vm-letter">{t("response.mission_label")}</div>
                <h3 className="vm-header">{t("response.mission_title")}</h3>
                <p className="vm-text">{t("response.mission_desc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="team-section">
          <div className="container">
            <div className="text-center">
              <span className="label text-center">{t("team.label")}</span>
              <h2 className="heading-section">{t("team.title")}</h2>
            </div>

            <div className="team-list-container">
              <div className="modern-team-row-card reveal">
                <div className="team-row-left">
                  <div className="team-avatar-container" style={{ position: "relative", overflow: "hidden" }}>
                    <Image src="/Reeju.png" alt={t("team.reeju_name")} fill sizes="200px" style={{ objectFit: "cover", objectPosition: "85% 20%" }} />
                  </div>
                  <div className="team-role">{t("team.reeju_role")}</div>
                  <span className="team-credential-badge">{t("team.reeju_cred")}</span>
                </div>
                <div className="team-row-right">
                  <h3 style={{ fontSize: "22px", fontWeight: 600 }}>{t("team.reeju_name")}</h3>
                  <div className="team-separator" />
                  <div className="body-text" style={{ fontSize: "15px", lineHeight: "1.7", textAlign: "justify", wordSpacing: "-0.02em" }}>
                    <p style={{ marginBottom: "1rem" }}>{t("team.reeju_p1")}</p>
                    <p style={{ marginBottom: "1rem" }}>{t("team.reeju_p2")}</p>
                    <p>{t("team.reeju_p3")}</p>
                  </div>
                </div>
              </div>

              <div className="modern-team-row-card reveal stagger-1">
                <div className="team-row-left">
                  <div className="team-avatar-container" style={{ position: "relative", overflow: "hidden" }}>
                    <Image src="/Robin.png" alt={t("team.robin_name")} fill sizes="200px" style={{ objectFit: "cover", objectPosition: "center 20%" }} />
                  </div>
                  <div className="team-role">{t("team.robin_role")}</div>
                  <span className="team-credential-badge">{t("team.robin_cred")}</span>
                </div>
                <div className="team-row-right">
                  <h3 style={{ fontSize: "22px", fontWeight: 600 }}>{t("team.robin_name")}</h3>
                  <div className="team-separator" />
                  <div className="body-text" style={{ fontSize: "15px", lineHeight: "1.7", textAlign: "justify", wordSpacing: "-0.02em" }}>
                    <p style={{ marginBottom: "1rem" }}>{t("team.robin_p1")}</p>
                    <p style={{ marginBottom: "1rem" }}>{t("team.robin_p2")}</p>
                    <p>{t("team.robin_p3")}</p>
                  </div>
                </div>
              </div>

              <div className="modern-team-row-card reveal stagger-2">
                <div className="team-row-left">
                  <div className="team-avatar-container" style={{ position: "relative", overflow: "hidden" }}>
                    <Image src="/Finny.png" alt={t("team.finny_name")} fill sizes="200px" style={{ objectFit: "cover", objectPosition: "center 20%" }} />
                  </div>
                  <div className="team-role">{t("team.finny_role")}</div>
                  <span className="team-credential-badge">{t("team.finny_cred")}</span>
                </div>
                <div className="team-row-right">
                  <h3 style={{ fontSize: "22px", fontWeight: 600 }}>{t("team.finny_name")}</h3>
                  <div className="team-separator" />
                  <div className="body-text" style={{ fontSize: "15px", lineHeight: "1.7", textAlign: "justify", wordSpacing: "-0.02em" }}>
                    <p style={{ marginBottom: "1rem" }}>{t("team.finny_p1")}</p>
                    <p style={{ marginBottom: "1rem" }}>{t("team.finny_p2")}</p>
                    <p>{t("team.finny_p3")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COURSES PAGE ─── */}
      <section id="courses" className="page" style={getPageStyle("courses")}>
        <div className="page-header">
          <div className="container reveal">
            <span className="label text-center">{t("courses.label")}</span>
            <h1 className="headline-page">{t("courses.title")}</h1>
            <p className="body-text">{t("courses.subtitle")}</p>
          </div>
        </div>

        <div className="section">
          <div className="container">
            {isLoadingCourses || isLoadingPrograms ? (
              <div style={{ textAlign: "center", padding: "4rem 0" }}>
                <p className="body-text">{t("courses.loading")}</p>
              </div>
            ) : !standaloneCourses?.length && !programsList?.length ? (
              <div style={{ textAlign: "center", padding: "4rem 0", background: "#FFFFFF", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "20px", marginBottom: "1rem", color: "var(--text-main)" }}>{t("courses.empty_title")}</h3>
                <p className="body-text">{t("courses.empty_desc")}</p>
              </div>
            ) : (
              <>
                {programsList.length > 0 && (
                  <div style={{ marginBottom: "5rem" }}>
                    <h2 className="heading-section text-center" style={{ marginBottom: "3rem" }}>{t("courses.featured_programs")}</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
                    {programsList.map((prog: any, pIdx: number) => (
                      <div key={prog.id} className="reveal" style={{ background: "#FFFFFF", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
                        <div className="program-card-header" style={{ background: "linear-gradient(135deg, var(--accent-green) 0%, #1A261D 100%)", padding: "3rem", color: "white", position: "relative" }}>
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", background: "radial-gradient(circle at top right, rgba(184, 134, 69, 0.15) 0%, rgba(184, 134, 69, 0) 60%)", pointerEvents: "none" }} />
                          <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", marginBottom: "1rem", display: "inline-block" }}>{t("courses.program_badge")}</span>
                          <h3 style={{ fontSize: "32px", color: "white", marginBottom: "1rem", fontFamily: "var(--font-dm-serif), serif", position: "relative", zIndex: 1 }}>{prog.title}</h3>
                          {prog.description && <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px", maxWidth: "800px", lineHeight: "1.6", position: "relative", zIndex: 1, marginBottom: "2rem" }}>{prog.description}</p>}
                          
                          <div style={{ display: "flex", gap: "1rem", alignItems: "center", position: "relative", zIndex: 1, flexWrap: "wrap" }} className="program-btn-group">
                            {prog.applicationsClosed ? (
                              <button disabled className="btn-primary" style={{ background: "rgba(255,255,255,0.5)", color: "rgba(44,74,59,0.7)", border: "1px solid rgba(255,255,255,0.5)", cursor: "not-allowed" }}>
                                {t("courses.applications_closed")}
                              </button>
                            ) : (
                              <Link href={`/programs/${prog.id}/apply`} className="btn-primary" style={{ background: "white", color: "var(--accent-green)", border: "1px solid white" }}>
                                {t("courses.apply_button")}
                              </Link>
                            )}
                            <button 
                              onClick={() => toggleProgram(prog.id)} 
                              className="btn-primary"
                              style={{ 
                                background: "rgba(255,255,255,0.1)", 
                                color: "white", 
                                border: "1px solid rgba(255,255,255,0.3)", 
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                            >
                              {expandedPrograms[prog.id] ? t("courses.hide_courses") : t("courses.view_courses")}
                            </button>
                          </div>
                        </div>
                        
                        {expandedPrograms[prog.id] && (
                          <div id={`program-courses-${prog.id}`} style={{ padding: "3rem", background: "var(--bg-main)" }}>
                            <h4 style={{ fontSize: "18px", color: "var(--text-main)", marginBottom: "2rem", fontWeight: 700, fontFamily: "var(--font-plus-jakarta), sans-serif" }}>{t("courses.courses_in_program")}</h4>
                            <div className="grid-3">
                              {prog.courses.map((c: any, i: number) => (
                                <div 
                                  key={c.id} 
                                  style={{ 
                                    background: "#FFFFFF", 
                                    borderRadius: "20px", 
                                    border: "1px solid rgba(220, 224, 213, 0.8)", 
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)", 
                                    overflow: "hidden", 
                                    display: "flex", 
                                    flexDirection: "column", 
                                    height: "100%", 
                                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    cursor: "pointer"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.04)";
                                  }}
                                  onClick={() => router.push(`/courses/${c.slug}`)}
                                >
                                  {c.thumbnail ? (
                                    <div className="h-48 rounded-t-2xl relative overflow-hidden bg-gray-100">
                                      <Image src={c.thumbnail} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized quality={100} priority style={{ objectFit: "cover", transition: "transform 0.7s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
                                    </div>
                                  ) : (
                                    <div style={{ height: "170px", width: "100%", background: "linear-gradient(135deg, rgba(184,134,69,0.15), rgba(138,100,51,0.05))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <span style={{ fontFamily: "var(--font-dm-serif), serif", color: "var(--gold-dark)", fontSize: "1.2rem", opacity: 0.6, letterSpacing: "2px" }}>CWAY</span>
                                    </div>
                                  )}
                                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                    <div className="course-badges" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                                      <span className="badge" style={{ background: "rgba(184,134,69,0.1)", color: "var(--gold-dark)", border: "none", fontSize: "10px", padding: "0.3rem 0.6rem" }}>{c._count?.sections > 0 ? c._count.sections : (c.weeksDuration || 0)} Wks</span>
                                      {c.level && <span className="badge" style={{ background: "var(--cream-mid)", color: "var(--text-secondary)", border: "none", fontSize: "10px", padding: "0.3rem 0.6rem" }}>{c.level}</span>}
                                    </div>
                                    <h3 style={{ fontSize: "19px", marginBottom: "0.75rem", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", lineHeight: 1.3 }}>{c.title}</h3>
                                    <p className="body-text" style={{ fontSize: "13.5px", flexGrow: 1, marginBottom: "1.5rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{c.subtitle || c.description?.substring(0, 90) + "..." || "Explore the biblical foundations and practical aspects of this subject."}</p>
                                    
                                    <div style={{ marginTop: "auto", borderTop: "1px solid rgba(220, 224, 213, 0.4)", paddingTop: "1.25rem" }}>
                                      <div style={{ display: "inline-flex", alignItems: "center", color: "var(--navy-deep)", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--gold-dark)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--navy-deep)"}>
                                        {t("courses.view_details")} <span style={{ marginLeft: "6px", fontSize: "16px" }}>→</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {standaloneCourses.length > 0 && (
                <div>
                  <h2 className="heading-section text-center" style={{ marginBottom: "3rem" }}>{t("courses.courses_title")}</h2>
                  <div className="grid-3">
                    {standaloneCourses.map((c: any, i: number) => (
                      <div key={c.id} className={`card course-card reveal ${i % 3 === 1 ? "stagger-1" : i % 3 === 2 ? "stagger-2" : ""}`} style={{ display: "flex", flexDirection: "column", padding: 0 }}>
                        <div className="h-48 rounded-t-2xl relative overflow-hidden bg-gray-100">
                           <Image src={c.thumbnail} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized quality={100} priority style={{ objectFit: "cover" }} />
                        </div>
                        <div className="course-card-body" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "2rem" }}>
                          <div className="course-badges" style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span style={{ padding: "4px 12px", background: "#F4EDE4", color: "#8B6D43", borderRadius: "100px", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                              {c._count?.sections > 0 ? c._count.sections : (c.weeksDuration || 0)} WKS
                            </span>
                            {c.level && (
                              <span style={{ padding: "4px 12px", background: "#EAF0E9", color: "#4A6D56", borderRadius: "100px", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                                {c.level}
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontSize: "24px", marginBottom: "1rem", fontFamily: "var(--font-dm-serif), var(--font-cinzel), serif", color: "var(--navy-deep)", lineHeight: 1.3, fontWeight: 700 }}>
                            {c.title}
                          </h3>
                          <p className="body-text" style={{ fontSize: "15px", flex: 1, marginBottom: "2rem", color: "var(--text-main)", lineHeight: 1.6 }}>
                            {c.subtitle || (c.description ? (c.description.length > 100 ? c.description.substring(0, 100) + "..." : c.description) : "Learn the foundations of this topic.")}
                          </p>
                          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem", marginTop: "auto" }}>
                            <Link href={`/courses/${c.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--navy-deep)", fontWeight: 800, fontSize: "14px", textDecoration: "none", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                              {t("courses.view_details")} &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="text-center reveal" style={{ marginTop: "4rem" }}>
            <div className="bank-card" style={{ display: "inline-block" }}>
              <h3 style={{ fontSize: "22px", marginBottom: "1rem", color: "var(--accent-green)" }}>{t("courses.graduation_title")}</h3>
              <p className="body-text" style={{ maxWidth: "600px", margin: "0 auto", fontSize: "14.5px" }}>{t("courses.graduation_desc")}</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ─── GET INVOLVED PAGE ─── */}
      <section id="involved" className="page" style={getPageStyle("involved")}>
        <div className="page-header">
          <div className="container reveal">
            <span className="label text-center">{t("involved.label")}</span>
            <h1 className="headline-page">{t("involved.title")}</h1>
            <p className="body-text">{t("involved.subtitle")}</p>
          </div>
        </div>

        <div className="section container grid-2">
          <div className="reveal">
            <span className="label">{t("involved.ways_to_help_label")}</span>
            <h2 className="heading-section">{t("involved.ways_to_help_title")}</h2>
            <ul className="partner-list" style={{ marginTop: "3rem" }}>
              <li>{t("involved.item_1")}</li>
              <li>{t("involved.item_2")}</li>
              <li>{t("involved.item_3")}</li>
              <li>{t("involved.item_4")}</li>
              <li>{t("involved.item_5")}</li>
            </ul>
            <div style={{ marginTop: "3rem" }}>
              <a href="#contact" className="btn-primary">{t("involved.button")}</a>
            </div>
          </div>
          <div className="reveal stagger-1">
            <div className="bank-card">
              <h3 style={{ fontSize: "26px", marginBottom: "1.5rem" }}>{t("involved.bank_title")}</h3>
              <p className="body-text" style={{ fontSize: "16px", lineHeight: 2.2 }}>
                <strong>{t("involved.bank_name")}:</strong> CWAY MISSIONS<br />
                <strong>{t("involved.bank_bank")}:</strong> Federal Bank — Banaswadi Branch<br />
                <strong>{t("involved.bank_acc")}:</strong> 14710200017349<br />
                <strong>{t("involved.bank_ifsc")}:</strong> FDRL0001471
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOG PAGE ─── */}
      <section id="blog" className="page" style={getPageStyle("blog")}>
        <div className="page-header">
          <div className="container reveal">
            <span className="label text-center">{t("blog.label")}</span>
            <h1 className="headline-page">{t("blog.title")}</h1>
            <p className="body-text">{t("blog.subtitle")}</p>
          </div>
        </div>

        <div
          className="section container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2.5rem",
            alignItems: "stretch",
            paddingTop: "4rem",
            paddingBottom: "4rem"
          }}
        >
          {displayPosts.map((post: Post, idx: number) => (
            <div
              key={post.slug}
              className={`card blog-card reveal ${idx % 2 === 1 ? 'stagger-1' : ''}`}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                background: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
                borderTop: "4px solid var(--accent-gold)",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div className="blog-content" style={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div className="blog-label-bar"></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span className="label" style={{ margin: 0 }}>Blog {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{post.date}</span>
                  </div>

                  <h3 style={{ fontSize: "20px", color: "var(--text-main)", marginBottom: "1rem", fontFamily: "var(--font-dm-serif), serif", fontWeight: 700, lineHeight: 1.35 }}>
                    {post.title}
                  </h3>

                  <p className="body-text" style={{ fontSize: "14.5px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                    {post.excerpt}
                  </p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-green), var(--accent-green-light))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "var(--bg-main)", fontFamily: "var(--font-dm-serif), serif", fontWeight: 700, fontSize: "12px" }}>
                        {post.author[0]}
                      </span>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: "12px", color: "var(--text-main)", lineHeight: 1.2 }}>{post.author}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{post.authorRole}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>{post.readTime} {t("blog.read_time")}</span>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                      onClick={() => setSelectedBlogPost(post)}
                      className="blog-read"
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        margin: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 700,
                        color: "var(--accent-green)",
                        textTransform: "uppercase",
                        fontSize: "12px",
                        letterSpacing: "1.5px",
                        cursor: "pointer"
                      }}
                    >
                      {t("blog.read_story")} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTACT PAGE ─── */}
      <section id="contact" className="page" style={getPageStyle("contact")}>
        <div 
          className="section container text-center" 
          style={{ 
            minHeight: "calc(100vh - 80px)", 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center",
            paddingTop: "5rem",
            paddingBottom: "5rem"
          }}
        >
          <div className="reveal" style={{ width: "100%", margin: "0 auto" }}>
            <span className="label text-center" style={{ color: "var(--accent-gold)" }}>{t("contact.label")}</span>
            <h1 className="headline-page" style={{ margin: "1.5rem 0" }}>{t("contact.title")}</h1>
            <p className="sub-heading" style={{ marginBottom: "3rem" }}>{t("contact.subtitle")}</p>

            <ContactContent />
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="footer-main">
        <div className="container footer-grid-container">
          <div>
            <div className="nav-logo-text" style={{ marginBottom: "1.2rem" }}><span className="logo-cway">CWAY</span><span className="logo-academy"> ACADEMY</span></div>
            <p className="body-text footer-brand-desc" dangerouslySetInnerHTML={{ __html: t("footer.desc") }}></p>
            <div style={{ marginTop: "1.5rem" }}>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@cwayacademy.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--accent-gold)", textDecoration: "none" }}>SUPPORT@CWAYACADEMY.COM</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "1.5rem", color: "var(--text-main)", fontSize: "13px" }}>{t("footer.quick_links")}</h4>
            <div className="footer-links-col">
              <a href="#home" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>{t("nav.home")}</a>
              <a href="#about" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>{t("nav.about")}</a>
              <a href="#courses" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>{t("nav.courses")}</a>
              <a href="#involved" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>{t("nav.involved")}</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "1.5rem", color: "var(--text-main)", fontSize: "13px" }}>{t("footer.contact_info")}</h4>
            <p className="body-text" style={{ fontSize: "14.5px", lineHeight: "1.8", color: "var(--text-muted)", margin: 0 }}>
              CWAY Missions Religious Trust<br />
              Bangalore, Karnataka, India<br /><br />
              <strong style={{ color: "var(--text-main)", fontWeight: 600 }}>{t("footer.phone")}</strong><br />
              +91 96638 31220
            </p>
          </div>
        </div>
        <div className="container">
          <div className="footer-bottom-bar">
            <div className="footer-copyright">&copy; 2026 CWAY Academy — A Ministry of CWAY Missions, Bangalore, India. All rights reserved.</div>
            <div className="footer-legal-links">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Reader Overlay */}
      <AnimatePresence>
        {selectedBlogPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(26, 38, 29, 0.75)",
              backdropFilter: "blur(12px)"
            }}
            onClick={() => setSelectedBlogPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                backgroundColor: "var(--bg-main)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: "760px",
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div
                style={{
                  padding: "1.75rem 2rem",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1.5rem"
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <span className="label" style={{ marginBottom: "0.25rem", display: "inline-block", color: "var(--accent-gold)" }}>{selectedBlogPost.category}</span>
                  <h2
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                      lineHeight: 1.3,
                      color: "var(--text-main)",
                      fontFamily: "var(--font-dm-serif), serif",
                      fontWeight: 700
                    }}
                  >
                    {selectedBlogPost.title}
                  </h2>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "12px", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>{selectedBlogPost.author}</span>
                    <span>•</span>
                    <span>{selectedBlogPost.authorRole}</span>
                    <span>•</span>
                    <span>{selectedBlogPost.date}</span>
                    <span>•</span>
                    <span>{selectedBlogPost.readTime} read</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBlogPost(null)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  className="hover-close"
                  aria-label="Close reader"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                data-lenis-prevent
                style={{
                  padding: "2rem 2.5rem",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-main)",
                  overscrollBehavior: "contain"
                }}
              >
                <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "left" }}>
                  {/* Lead excerpt */}
                  <p
                    style={{
                      fontSize: "1.05rem",
                      lineHeight: 1.8,
                      fontWeight: 500,
                      color: "var(--accent-green)",
                      marginBottom: "2rem",
                      borderLeft: "3.5px solid var(--accent-gold)",
                      paddingLeft: "1.25rem"
                    }}
                  >
                    {selectedBlogPost.excerpt}
                  </p>

                  {/* Render paragraphs dynamically */}
                  <div style={{ lineHeight: 1.9, color: "var(--text-muted)" }}>
                    {selectedBlogPost.content.split(/\n\s*\n/).map((para: string, i: number) => {
                      const trimmed = para.trim();
                      if (trimmed.startsWith("“") && trimmed.endsWith("”")) {
                        return (
                          <blockquote
                            key={i}
                            style={{
                              borderLeft: "4px solid var(--accent-gold)",
                              paddingLeft: "1.5rem",
                              fontStyle: "italic",
                              margin: "2rem 0",
                              fontSize: "1.1rem",
                              color: "var(--accent-green)",
                              fontFamily: "var(--font-dm-serif), serif"
                            }}
                          >
                            {trimmed}
                          </blockquote>
                        );
                      }
                      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                        return (
                          <h4
                            key={i}
                            style={{
                              fontSize: "1.2rem",
                              color: "var(--text-main)",
                              fontFamily: "var(--font-dm-serif), serif",
                              fontWeight: 700,
                              marginTop: "2.5rem",
                              marginBottom: "1rem"
                            }}
                          >
                            {trimmed.replace(/\*\*/g, "")}
                          </h4>
                        );
                      }
                      const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                      return (
                        <p
                          key={i}
                          style={{ marginBottom: "1.25rem", fontSize: "15px" }}
                          dangerouslySetInnerHTML={{ __html: withBold }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div
                style={{
                  padding: "1.25rem 2rem",
                  borderTop: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setSelectedBlogPost(null)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  className="hover-btn-close"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(26, 38, 29, 0.75)",
              backdropFilter: "blur(12px)"
            }}
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                backgroundColor: "var(--bg-main)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: "760px",
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div
                style={{
                  padding: "1.75rem 2rem",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1.5rem"
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <span className="label" style={{ marginBottom: "0.25rem", display: "inline-block", color: "var(--accent-gold)" }}>Legal Documents</span>
                  <h2
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                      lineHeight: 1.3,
                      color: "var(--text-main)",
                      fontFamily: "var(--font-serif), serif",
                      fontWeight: 700
                    }}
                  >
                    Privacy Policy
                  </h2>
                </div>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  className="hover-close"
                  aria-label="Close reader"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                data-lenis-prevent
                style={{
                  padding: "2rem 2.5rem",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-main)",
                  overscrollBehavior: "contain"
                }}
              >
                <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "left" }}>
                  <p style={{ fontSize: "14.5px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Last Updated: June 2026
                  </p>
                  <p style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    CWAY Academy and the CWAY Missions Religious Trust respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit our website, register for training, or communicate with us, and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>1. Information We Collect</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We collect personal information that you voluntarily provide to us when you fill out contact forms, apply for admission, request scholarships, or subscribe to updates. This information may include:
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem", listStyleType: "disc", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                    <li>Personal identification information (such as name, email address, phone number, and mailing address).</li>
                    <li>Ministry and academic background details provided in connection with enrollment or scholarship inquiries.</li>
                    <li>Payment information and donor records in connection with sponsorships or donations.</li>
                  </ul>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>2. How We Use Your Information</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We use the information we collect for the following purposes:
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem", listStyleType: "disc", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                    <li>To facilitate admissions, enrollment, academic assessments, and hybrid class workshops.</li>
                    <li>To coordinate and manage local graduation ceremonies.</li>
                    <li>To process and record sponsorships and charitable contributions.</li>
                    <li>To respond to your inquiries, support requests, or partnership applications.</li>
                    <li>To send updates or newsletters about CWAY Academy and CWAY Missions Trust.</li>
                  </ul>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>3. Data Protection and Security</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We implement appropriate administrative, physical, and electronic security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please note that no transmission of data over the internet can be guaranteed as completely secure.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>4. Information Sharing and Disclosure</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We do not sell, rent, or trade your personal identification information. We may share details with trusted third-party service providers (such as hosting partners or platform administrators) who assist us in operating our educational platforms and conducting our ministries, provided those partners agree to keep this information confidential.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>5. Your Rights and Contact Info</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    You have the right to request access to the personal data we hold about you, request corrections to any inaccuracies, or ask for deletion of your records. For any requests or inquiries, please contact us at:
                  </p>
                  <p style={{ fontSize: "15px", color: "var(--accent-green)", fontWeight: 600, lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Email: support@cwayacademy.com<br />
                    Address: CWAY Missions Religious Trust, Bangalore, Karnataka, India
                  </p>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div
                style={{
                  padding: "1.25rem 2rem",
                  borderTop: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  className="hover-btn-close"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(26, 38, 29, 0.75)",
              backdropFilter: "blur(12px)"
            }}
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                backgroundColor: "var(--bg-main)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: "760px",
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div
                style={{
                  padding: "1.75rem 2rem",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1.5rem"
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <span className="label" style={{ marginBottom: "0.25rem", display: "inline-block", color: "var(--accent-gold)" }}>Legal Documents</span>
                  <h2
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                      lineHeight: 1.3,
                      color: "var(--text-main)",
                      fontFamily: "var(--font-serif), serif",
                      fontWeight: 700
                    }}
                  >
                    Terms of Service
                  </h2>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  className="hover-close"
                  aria-label="Close reader"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                data-lenis-prevent
                style={{
                  padding: "2rem 2.5rem",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-main)",
                  overscrollBehavior: "contain"
                }}
              >
                <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "left" }}>
                  <p style={{ fontSize: "14.5px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Last Updated: June 2026
                  </p>
                  <p style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Welcome to CWAY Academy. By accessing our website, participating in our hybrid training programs, or using any services provided by CWAY Academy and CWAY Missions Religious Trust, you agree to comply with and be bound by the following Terms of Service. If you do not agree, please do not access or use our services.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>1. Admission and Code of Conduct</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    CWAY Academy provides Bible-based leadership training primarily intended for pastors, church elders, lay leaders, and Christian believers seeking to grow in spiritual leadership. All student participants are expected to communicate respectfully, engage with program coordinators constructively, and provide accurate background and credentials during enrollment.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>2. Academic Policies and Course Materials</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    The structure of CWAY Academy comprises a total of ten courses spanning a duration of 60 weeks (6 weeks per course).
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem", listStyleType: "disc", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                    <li><strong>Material Usage:</strong> All video lectures, transcripts, notes, and theological study sheets provided are the intellectual property of CWAY Academy. You are granted a limited license to use these materials solely for personal learning and study. Distributing or copying them for commercial purposes is strictly prohibited.</li>
                    <li><strong>Graduation Requirements:</strong> To obtain the globally certified graduation credentials, students must complete all 10 courses, submit all evaluations, and fulfill feedback requirements.</li>
                  </ul>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>3. Tuition and Scholarships</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    CWAY Academy is committed to making education accessible to rural leaders. Tuition rates and payment periods are detailed in the courses block. Scholarships are available to candidates with proven financial constraints, sponsored directly by donation partners. Satisfying eligibility criteria is mandatory for scholarship allocation.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>4. Limitation of Liability</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    All educational materials and platform operations are provided "as is" and "as available". We do not warrant that files or platforms will be completely error-free or uninterrupted. CWAY Academy and CWAY Missions Religious Trust will not be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use our services.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>5. Jurisdiction and Governing Law</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms or CWAY Academy services will be subject to the exclusive jurisdiction of the courts located in Bangalore, Karnataka, India.
                  </p>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div
                style={{
                  padding: "1.25rem 2rem",
                  borderTop: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setShowTermsModal(false)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  className="hover-btn-close"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
