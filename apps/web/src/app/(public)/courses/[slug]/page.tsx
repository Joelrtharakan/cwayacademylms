"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, Award, BookOpen, ChevronRight, Play, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.get(`/courses/${slug}`).then(r => r.data.data),
    retry: false
  });

  if (isLoading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 size={40} className="animate-spin" color="#B88645" />
    </div>
  );

  if (error || !course) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <AlertTriangle size={48} color="#B03A2E" />
      <h2 style={{ fontFamily: "Georgia, serif", color: "#1A261D", margin: 0 }}>Course Not Found</h2>
      <p style={{ color: "#8F9E93", margin: 0 }}>The course you are looking for does not exist or is not published yet.</p>
      <Link href="/#courses" className="btn-primary" style={{ marginTop: "16px" }}>Back to Courses</Link>
    </div>
  );

  // Safely parse JSON fields
  const parseJson = (str: string) => {
    try { return JSON.parse(str || "[]"); } catch { return []; }
  };

  const requirements = parseJson(course.requirements);
  const outcomes = parseJson(course.outcomes);

  return (
    <div style={{ paddingTop: "80px" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        nav {
            position: fixed; top: 0; left: 0; width: 100%; height: 80px;
            background: rgba(250, 250, 247, 0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(220, 224, 213, 0.6); z-index: 1000;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 5%; font-family: var(--font-plus-jakarta), sans-serif;
        }
        .nav-brand { display: flex; align-items: center; gap: 1rem;}
        .nav-logo-text { font-family: var(--font-cinzel), 'Cinzel', Georgia, serif; font-size: 21px; font-weight: 700; letter-spacing: 3px; color: #1A261D; text-transform: uppercase; line-height: 1; }
        .nav-logo-text .logo-cway { color: #1A261D; }
        .nav-logo-text .logo-academy { color: #B88645; font-weight: 400; letter-spacing: 4px; }
        .nav-links { display: flex; gap: 2.5rem; align-items: center; }
        .nav-links a { font-size: 12.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #5A6B60; position: relative; padding: 0.5rem 0; text-decoration: none; transition: color 0.35s ease; }
        .nav-links a:hover, .nav-links a.nav-active { color: #2C4A3B; }
        .nav-links a::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px; background: #2C4A3B; transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-links a:hover::after, .nav-links a.nav-active::after { width: 100%; }
        @media (max-width: 992px) { .nav-links { display: none; } }
      `}} />

      {/* Header Navigation */}
      <nav>
        <Link href="/" className="nav-brand" style={{ textDecoration: "none" }}>
          <img src="/logo.png?v=3" alt="CWAY Academy Logo" style={{ width: "48px", height: "48px", objectFit: "contain", flexShrink: 0 }} />
          <div className="nav-logo-text"><span className="logo-cway">CWAY</span><span className="logo-academy"> ACADEMY</span></div>
        </Link>
        <div className="nav-links">
          <Link href="/#home">Home</Link>
          <Link href="/#about">About</Link>
          <Link href="/#courses" className="nav-active">Courses</Link>
          <Link href="/#involved">Get Involved</Link>
          <Link href="/#blog">Blog</Link>
          <Link href="/#contact">Contact</Link>
        </div>
      </nav>
      {/* Draft Banner */}
      {course.status === "DRAFT" && (
        <div style={{ background: "#B88645", color: "#FFFFFF", padding: "12px", textAlign: "center", fontSize: "14px", fontWeight: 600 }}>
          You are previewing a DRAFT course. It is not visible to the public.
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ background: "var(--cream-mid)", padding: "1rem 0", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container" style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.82rem" }}>
          <Link href="/#courses" style={{ color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600 }}>Courses</Link>
          <ChevronRight size={12} /><span style={{ color: "var(--text-muted)" }}>{course.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--navy-deep), var(--navy-mid))", padding: "4rem 0", position: "relative" }}>
        {course.thumbnail && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.15, backgroundImage: `url(${course.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "3rem", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span className="badge badge-gold">{course.level || "BEGINNER"}</span>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>{course.category?.name || "General"}</span>
              </div>
              <h1 style={{ color: "white", marginBottom: "0.75rem" }}>{course.title}</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{course.subtitle || course.description?.slice(0, 100) + "..."}</p>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                {[{ icon: Clock, label: `${course.weeksDuration || 0} weeks` }, { icon: BookOpen, label: `${course.totalLectures || 0} Lessons` }, { icon: Users, label: `${course._count?.enrollments || 0} Students` }, { icon: Award, label: "Certificate" }].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                    <Icon size={14} color="var(--gold-light)" />{label}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(201,168,76,0.4)", flexShrink: 0, overflow: "hidden" }}>
                  {course.instructor?.avatar ? <img src={course.instructor.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BookOpen size={16} color="var(--gold-light)" />}
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{course.instructor?.name || "Instructor"}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>Instructor</div>
                </div>
              </div>
            </div>

            {/* Enroll Card */}
            <div style={{ background: "var(--cream-light)", borderRadius: "20px", padding: "1.75rem", boxShadow: "var(--shadow-xl)" }}>
              <div style={{ height: "140px", borderRadius: "12px", background: "linear-gradient(135deg, var(--gold-primary), var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", overflow: "hidden", position: "relative" }}>
                {course.thumbnail && <img src={course.thumbnail} alt="" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />}
                <Play size={40} color="white" fill="white" style={{ marginLeft: "4px", position: "relative", zIndex: 1 }} />
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--navy-deep)", marginBottom: "0.25rem" }}>
                {course.isFree ? "Free" : `${course.currency === "INR" ? "₹" : "$"}${course.price}`}
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>Includes full access to all materials</p>
              <Link href="#" className="btn-primary" style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "0.625rem" }}>Enroll Now</Link>
              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[`Language: ${course.language}`, `Duration: ${course.weeksDuration} weeks`].map((item) => (
                  <div key={item} style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem" }}>
                    <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: "860px" }}>
          {course.scriptureRef && (
            <div className="scripture-block" style={{ marginTop: 0 }}>
              {course.scriptureRef}
            </div>
          )}
          
          <h2 style={{ marginBottom: "1rem" }}>About This Course</h2>
          <p style={{ lineHeight: 1.9, marginBottom: "2.5rem", whiteSpace: "pre-wrap" }}>{course.description}</p>

          {outcomes.length > 0 && (
            <>
              <h2 style={{ marginBottom: "1.25rem" }}>What You Will Learn</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2.5rem" }}>
                {outcomes.map((o: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.875rem 1rem", background: "var(--cream-mid)", borderRadius: "10px" }}>
                    <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{o}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 style={{ marginBottom: "1.25rem" }}>Course Curriculum</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2.5rem" }}>
            {course.sections && course.sections.length > 0 ? course.sections.map((sec: any, i: number) => (
              <div key={sec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "var(--cream-mid)", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                  <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--gold-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--gold-dark)", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--navy-deep)" }}>{sec.title}</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{sec.lessons?.length || 0} items</span>
              </div>
            )) : (
              <div style={{ padding: "20px", background: "var(--cream-mid)", borderRadius: "10px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                No curriculum modules added yet.
              </div>
            )}
          </div>

          <h2 style={{ marginBottom: "1.25rem" }}>Instructor Announcements</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
            {course.announcements && course.announcements.length > 0 ? course.announcements.map((ann: any) => (
              <div key={ann.id} style={{ padding: "1.25rem", background: "#FFFFFF", borderRadius: "10px", border: "1px solid var(--border-light)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem 0", color: "var(--navy-deep)", display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--gold-primary)" }}>📢</span> {ann.title}</h3>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{new Date(ann.createdAt).toLocaleDateString()}</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{ann.content}</p>
              </div>
            )) : (
              <div style={{ padding: "20px", background: "var(--cream-mid)", borderRadius: "10px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                No announcements yet.
              </div>
            )}
          </div>

          {requirements.length > 0 && (
            <>
              <h2 style={{ marginBottom: "1.25rem" }}>Requirements</h2>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "3rem" }}>
                {requirements.map((r: string, i: number) => (
                  <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--gold-primary)", flexShrink: 0 }}>✦</span>{r}
                  </li>
                ))}
              </ul>
            </>
          )}

        </div>
      </section>
    </div>
  );
}
