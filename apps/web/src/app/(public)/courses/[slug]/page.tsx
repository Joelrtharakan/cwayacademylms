"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, Award, BookOpen, ChevronRight, Play, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
// Ensure we import hooks at the top.
import { useAuthStore, api } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

const NavigationHeader = () => (
  <>
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
  </>
);

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const { user } = useAuthStore();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.get(`/courses/${slug}`).then(r => r.data.data),
    retry: false
  });

  const handleEnrollClick = async () => {
    // If course belongs to a program, redirect to the program application
    if (course.programId) {
      router.push(`/programs/${course.programId}/apply`);
      return;
    }

    if (!user) {
      // Not logged in -> redirect to register with intent
      router.push(`/register?enrollCourseId=${course.id}`);
      return;
    }

    // Already logged in -> auto enroll
    setIsEnrolling(true);
    try {
      await api.post("/student/enrollments", { courseId: course.id });
      toast.success("Successfully enrolled!");
      window.location.href = "/student/dashboard";
    } catch (err: any) {
      console.error("Enrollment failed", err);
      // It might fail if they are already enrolled
      if (err.response?.data?.message?.includes("already enrolled")) {
        toast.info("You are already enrolled in this course.");
        window.location.href = "/student/dashboard";
      } else {
        toast.error("Failed to enroll in the course.");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) return (
    <div style={{ paddingTop: "80px", minHeight: "100vh", background: "#FAFAF7", display: "flex", flexDirection: "column" }}>
      <NavigationHeader />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px", opacity: 0.8 }}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-[#C9973A]/30 animate-pulse"></div>
          <Loader2 size={48} className="animate-spin text-[#C9973A] relative z-10" />
        </div>
        <p className="text-[#5A6B60] font-semibold tracking-widest uppercase text-xs animate-pulse">Loading Course Details...</p>
      </div>
    </div>
  );

  if (error || !course) return (
    <div style={{ paddingTop: "80px", minHeight: "100vh", background: "#FAFAF7", display: "flex", flexDirection: "column" }}>
      <NavigationHeader />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <AlertTriangle size={48} color="#B03A2E" />
        <h2 style={{ fontFamily: "Georgia, serif", color: "#1A261D", margin: 0, fontSize: "2rem" }}>Course Not Found</h2>
        <p style={{ color: "#8F9E93", margin: 0 }}>The course you are looking for does not exist or is not published yet.</p>
        <Link href="/#courses" className="rounded-full bg-[#1A261D] text-white transition hover:bg-[#2C4A3B]" style={{ marginTop: "16px", padding: "12px 28px", fontSize: "14px", fontWeight: "bold" }}>Back to Courses</Link>
      </div>
    </div>
  );

  // Safely parse JSON fields
  const parseJson = (str: string) => {
    try { return JSON.parse(str || "[]"); } catch { return []; }
  };

  const requirements = parseJson(course.requirements);
  // Support both course.outcomes and curriculum.objectives
  const outcomes = parseJson(course.curriculum?.objectives || course.outcomes);
  const targetAudience = parseJson(course.targetAudience);
  const tags = parseJson(course.tags);
  const displayDescription = course.curriculum?.overview || course.description || "No description provided.";

  return (
    <div style={{ paddingTop: "80px" }}>
      <NavigationHeader />
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
          <div style={{ display: "grid", gridTemplateColumns: course.programId ? "1fr" : "1fr 340px", gap: "3rem", alignItems: "start" }}>
            <div style={{ maxWidth: course.programId ? "850px" : "100%" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <span className="badge badge-gold">{course.level || "BEGINNER"}</span>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>{course.category?.name || "General"}</span>
                {course.programId && (
                  <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(201,168,76,0.15)", color: "var(--gold-light)", border: "1px solid rgba(201,168,76,0.3)" }}>
                    Part of {course.program?.title || "Program"}
                  </span>
                )}
              </div>
              <h1 style={{ color: "white", marginBottom: "0.75rem", fontSize: course.programId ? "3.5rem" : "2.5rem", lineHeight: 1.1 }}>{course.title}</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "750px" }}>{course.subtitle || displayDescription.slice(0, 100) + "..."}</p>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
                {(() => {
                  const calculatedLessons = course.sections?.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0) || course.totalLectures || 0;
                  const calculatedWeeks = course.sections?.length > 0 ? course.sections.length : (course.weeksDuration || 0);
                  
                  return [
                    { icon: Clock, label: `${calculatedWeeks} weeks` }, 
                    { icon: BookOpen, label: `${calculatedLessons} Lessons` }, 
                    { icon: Users, label: `${course._count?.enrollments || 0} Students` }, 
                    { icon: Award, label: "Certificate" }
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
                      <Icon size={16} color="var(--gold-light)" />{label}
                    </div>
                  ));
                })()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(201,168,76,0.4)", flexShrink: 0, overflow: "hidden" }}>
                    {course.instructor?.avatar ? <img src={course.instructor.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BookOpen size={16} color="var(--gold-light)" />}
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>{course.instructor?.name || "Instructor"}</div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>Course Instructor</div>
                  </div>
                </div>

                {course.programId && (
                  <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "2rem", display: "flex", alignItems: "center" }}>
                    <Link href={`/programs/${course.programId}/apply`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--navy-deep)", background: "var(--gold-light)", padding: "0.75rem 1.5rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", textTransform: "uppercase", letterSpacing: "1px", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "white"} onMouseOut={(e) => e.currentTarget.style.background = "var(--gold-light)"}>
                      Apply to Program <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Enroll Card or Program Card */}
            {course.programId ? null : (
              <div style={{ background: "var(--cream-light)", borderRadius: "20px", padding: "1.75rem", boxShadow: "var(--shadow-xl)" }}>
                <div style={{ height: "140px", borderRadius: "12px", background: "linear-gradient(135deg, var(--gold-primary), var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", overflow: "hidden", position: "relative" }}>
                  {course.thumbnail && <img src={course.thumbnail} alt="" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />}
                  <Play size={40} color="white" fill="white" style={{ marginLeft: "4px", position: "relative", zIndex: 1 }} />
                </div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--navy-deep)", marginBottom: "0.25rem" }}>
                  {course.isFree ? "Free" : `${course.currency === "INR" ? "₹" : "$"}${course.price}`}
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>Includes full access to all materials</p>
                
                <button 
                  onClick={handleEnrollClick}
                  disabled={isEnrolling}
                  className="btn-primary" 
                  style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "0.625rem", border: "none", cursor: isEnrolling ? "not-allowed" : "pointer", opacity: isEnrolling ? 0.7 : 1 }}
                >
                  {isEnrolling ? <Loader2 size={16} className="animate-spin" /> : "Enroll Now"}
                </button>

                <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {[`Language: ${course.language}`, `Duration: ${course.weeksDuration} weeks`].map((item) => (
                    <div key={item} style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem" }}>
                      <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />{item}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem", marginBottom: "3rem" }}>
            <div style={{ background: "#FFFFFF", padding: "2.5rem", borderRadius: "16px", border: "1px solid var(--border-light)", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
              <h2 style={{ marginBottom: "1.25rem", fontFamily: "Georgia, serif", color: "var(--navy-deep)" }}>About This Course</h2>
              <p style={{ lineHeight: 1.9, color: "var(--text-secondary)", fontSize: "1.05rem", whiteSpace: "pre-wrap", margin: 0 }}>{displayDescription}</p>
              
              {tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-light)" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--navy-deep)", marginRight: "0.5rem", display: "flex", alignItems: "center" }}>Tags:</span>
                  {tags.map((t: string, i: number) => (
                    <span key={i} style={{ background: "var(--cream-mid)", color: "var(--text-secondary)", fontSize: "0.75rem", padding: "4px 12px", borderRadius: "999px", fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            {targetAudience.length > 0 && (
              <div>
                <h2 style={{ marginBottom: "1.25rem", fontFamily: "Georgia, serif", color: "var(--navy-deep)" }}>Who This Course is For</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                  {targetAudience.map((t: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem 1.25rem", background: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                      <Users size={18} color="var(--gold-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {outcomes.length > 0 && (
            <div style={{ 
              marginBottom: "3.5rem", 
              background: "#FFFFFF", 
              border: "1px solid var(--border-light)", 
              borderRadius: "20px", 
              padding: "2.5rem 3rem",
              boxShadow: "0 12px 48px rgba(0,0,0,0.03)"
            }}>
              <h2 style={{ marginBottom: "2rem", fontFamily: "Georgia, serif", color: "var(--navy-deep)", fontSize: "1.75rem", fontWeight: 700 }}>What You'll Learn</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", columnGap: "3rem", rowGap: "1.5rem" }}>
                {outcomes.map((o: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div style={{ 
                      flexShrink: 0, 
                      width: 28, 
                      height: 28, 
                      borderRadius: "50%", 
                      background: "linear-gradient(135deg, rgba(184,134,69,0.1) 0%, rgba(138,100,51,0.2) 100%)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      marginTop: 2,
                      boxShadow: "inset 0 0 0 1px rgba(184,134,69,0.2)"
                    }}>
                      <CheckCircle size={16} color="var(--gold-primary)" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500 }}>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginBottom: "3.5rem", 
            background: "#FFFFFF", 
            border: "1px solid var(--border-light)", 
            borderRadius: "20px", 
            padding: "2.5rem 3rem",
            boxShadow: "0 12px 48px rgba(0,0,0,0.03)"
          }}>
            <h2 style={{ marginBottom: "2rem", fontFamily: "Georgia, serif", color: "var(--navy-deep)", fontSize: "1.75rem", fontWeight: 700 }}>Course Curriculum</h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {course.sections && course.sections.length > 0 ? course.sections.map((sec: any, i: number) => (
                <div key={sec.id} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "1.5rem 0", 
                  borderBottom: i === course.sections.length - 1 ? "none" : "1px solid var(--border-light)",
                  transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                    <div style={{ 
                      width: "36px", 
                      height: "36px", 
                      borderRadius: "12px", 
                      background: "rgba(184,134,69,0.08)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      fontSize: "0.9rem", 
                      fontWeight: 700, 
                      color: "var(--gold-primary)", 
                      flexShrink: 0 
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--navy-deep)", letterSpacing: "-0.01em" }}>{sec.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
                    <BookOpen size={16} strokeWidth={2} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{sec.lessons?.length || 0} lessons</span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "3rem", background: "var(--cream-mid)", borderRadius: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 500 }}>
                  Curriculum details are being finalized. Check back soon.
                </div>
              )}
            </div>
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
