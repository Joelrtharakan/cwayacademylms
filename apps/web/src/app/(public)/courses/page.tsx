"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/* ── Animation variants ── */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
} as const;

/* ── Course data ── */
const allCourses = [
  {
    slug: "spiritual-formation",
    title: "Spiritual Formation",
    level: "Certificate",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Formation",
    description:
      "Integrated study of the Christian life and personal character development by the initiation and enactment of the Holy Spirit.",
  },
  {
    slug: "old-testament",
    title: "Old Testament",
    level: "Certificate",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Theology",
    description:
      "Overview of the content and theology of the Old Testament books, examining key theological themes and relevance to ministry today.",
  },
  {
    slug: "new-testament",
    title: "New Testament",
    level: "Certificate",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Theology",
    description:
      "Overview within historical, literary, cultural, and theological contexts, tracing each book\u2019s Christological development.",
  },
  {
    slug: "interpreting-the-bible",
    title: "Interpreting the Bible",
    level: "Certificate",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Hermeneutics",
    description:
      "Equipping you with tools to study Scripture with insight, accuracy, and understanding through sound interpretive principles.",
  },
  {
    slug: "theology-doctrines-1",
    title: "Theology & Doctrines 1",
    level: "Certificate",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Theology",
    description:
      "God, Humanity, Christ, and Salvation. Developing a Biblically grounded theology for life and ministry.",
  },
  {
    slug: "theology-doctrines-2",
    title: "Theology & Doctrines 2",
    level: "Certificate",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Theology",
    description:
      "Church, Holy Spirit, and Mission. Exploring major areas of Christian theology to defend and teach the faith.",
  },
  {
    slug: "five-fold-ministry",
    title: "Five-Fold Ministry",
    level: "Diploma",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Ministry",
    description:
      "Training in church leadership, revealing functions of apostles, prophets, evangelists, pastors, and teachers.",
  },
  {
    slug: "church-history",
    title: "Our Roots: Church History",
    level: "Certificate",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "History",
    description:
      "Development of Christianity from inception to present, including the global expansion and India\u2019s heritage.",
  },
  {
    slug: "spiritual-leadership",
    title: "Spiritual Leadership",
    level: "Diploma",
    format: "Hybrid",
    duration: "6 Weeks",
    lectures: "10 Lectures",
    category: "Leadership",
    description:
      "Practical understanding of leadership principles and blending natural/spiritual qualities to shape your calling.",
  },
];

/* ── Category color mapping ── */
const categoryColors: Record<string, string> = {
  Formation: "#6B8E7B",
  Theology: "#2C4A3B",
  Hermeneutics: "#7A6B4A",
  Ministry: "#4A6B5A",
  History: "#5A6B5D",
  Leadership: "#3A5A4A",
};

export default function CoursesPage() {
  return (
    <div style={{ overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .courses-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .courses-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .courses-program-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .courses-hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .courses-program-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .courses-cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        @media (max-width: 992px) {
          .courses-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .courses-program-grid { grid-template-columns: 1fr; gap: 3rem; }
        }
        @media (max-width: 768px) {
          .courses-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .courses-cards-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
          .courses-program-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .courses-hero-buttons,
          .courses-program-buttons,
          .courses-cta-buttons { flex-direction: column; align-items: stretch; }
          .courses-hero-buttons a,
          .courses-program-buttons a,
          .courses-cta-buttons a { text-align: center; }
        }
        @media (max-width: 480px) {
          .courses-cards-grid { grid-template-columns: 1fr; gap: 14px; }
          .courses-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      ` }} />
      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section
        style={{
          background: "linear-gradient(160deg, #1A2F25 0%, #2C4A3B 40%, #1A2F25 100%)",
          padding: "clamp(100px, 14vw, 180px) 24px clamp(80px, 10vw, 120px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-20%", right: "-10%", width: "500px", height: "500px",
            borderRadius: "50%", background: "var(--gold-primary)", opacity: 0.06, filter: "blur(100px)"
          }} />
          <div style={{
            position: "absolute", bottom: "-15%", left: "-5%", width: "400px", height: "400px",
            borderRadius: "50%", background: "#4A7A62", opacity: 0.08, filter: "blur(80px)"
          }} />
          {/* Subtle grid pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{
              color: "var(--gold-light)", fontWeight: 700, fontSize: "11px",
              letterSpacing: "3px", textTransform: "uppercase", display: "block", marginBottom: "20px"
            }}>
              Theological Education
            </span>
            <h1 style={{
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 400,
              color: "#FFFFFF", lineHeight: 1.1, marginBottom: "28px", maxWidth: "800px"
            }}>
              Courses Built for{" "}
              <span style={{
                background: "linear-gradient(135deg, var(--gold-light), #D4A853)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                fontStyle: "italic"
              }}>
                Kingdom Impact
              </span>
            </h1>
            <div style={{ width: "60px", height: "3px", background: "var(--gold-light)", borderRadius: "2px", marginBottom: "24px" }} />
            <p style={{
              fontSize: "clamp(16px, 1.8vw, 19px)", color: "rgba(255,255,255,0.7)",
              fontWeight: 300, lineHeight: 1.7, maxWidth: "620px", marginBottom: "40px"
            }}>
              Biblically grounded. Locally delivered. Globally certified.
              Our curriculum is designed to support active ministry, balancing academic depth
              with practical spiritual development.
            </p>
            <div className="courses-hero-buttons">
              <Link
                href="/apply"
                style={{
                  display: "inline-block", padding: "16px 36px",
                  background: "var(--gold-light)", color: "var(--navy-deep)",
                  fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em",
                  textTransform: "uppercase", borderRadius: "999px",
                  textDecoration: "none", transition: "transform 0.3s, box-shadow 0.3s",
                }}
              >
                Apply Now
              </Link>
              <Link
                href="/contact"
                style={{
                  display: "inline-block", padding: "16px 36px",
                  background: "transparent", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontWeight: 600, fontSize: "12px", letterSpacing: "0.1em",
                  textTransform: "uppercase", borderRadius: "999px",
                  textDecoration: "none", transition: "border-color 0.3s",
                }}
              >
                Talk to Admissions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: "#fff", borderBottom: "1px solid #DCE0D5" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="courses-stats-grid"
            style={{ gap: "0" }}
          >
            {[
              { value: "10+", label: "Courses Available" },
              { value: "6 Weeks", label: "Per Course" },
              { value: "10", label: "Lectures Each" },
              { value: "Accredited", label: "Global Recognition" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                style={{
                  textAlign: "center", padding: "36px 16px",
                  borderRight: i < 3 ? "1px solid #DCE0D5" : "none",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                  fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 400,
                  color: "var(--accent-green)", display: "block", marginBottom: "6px"
                }}>
                  {stat.value}
                </span>
                <span style={{
                  fontSize: "11px", color: "#5A6B5D", textTransform: "uppercase",
                  letterSpacing: "0.15em", fontWeight: 600
                }}>
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          COURSES GRID
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(180deg, #F7F8F4 0%, #EDEEE8 100%)",
        padding: "clamp(80px, 10vw, 120px) 24px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Section intro */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            <motion.span variants={fadeUp} style={{
              color: "var(--accent-green)", fontWeight: 700, fontSize: "11px",
              letterSpacing: "3px", textTransform: "uppercase", display: "block", marginBottom: "12px"
            }}>
              Our Curriculum
            </motion.span>
            <motion.h2 variants={fadeUp} style={{
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400,
              color: "var(--accent-green)", marginBottom: "16px"
            }}>
              9 Courses. One Transformative Journey.
            </motion.h2>
            <motion.p variants={fadeUp} style={{
              fontSize: "16px", color: "#5A6B5D", maxWidth: "560px",
              margin: "0 auto", lineHeight: 1.7, fontWeight: 300
            }}>
              Each course is 6 weeks long with 10 lectures, delivered in a flexible hybrid format
              that fits around your life and ministry.
            </motion.p>
          </motion.div>

          {/* Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="courses-cards-grid"
          >
            {allCourses.map((course, idx) => (
              <motion.article
                key={course.slug}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid #DCE0D5",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.4s, border-color 0.4s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 24px 64px rgba(44,74,59,0.14)";
                  e.currentTarget.style.borderColor = "var(--accent-gold-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#DCE0D5";
                }}
              >
                {/* Card header band */}
                <div style={{
                  padding: "28px 32px 24px",
                  background: `linear-gradient(135deg, ${categoryColors[course.category] || "#2C4A3B"}, ${categoryColors[course.category] || "#2C4A3B"}dd)`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Big number watermark */}
                  <span style={{
                    position: "absolute", top: "-12px", right: "12px",
                    fontFamily: "var(--font-serif, Georgia, serif)",
                    fontSize: "80px", fontWeight: 700, color: "rgba(255,255,255,0.08)",
                    lineHeight: 1, pointerEvents: "none", userSelect: "none"
                  }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 14px", borderRadius: "999px",
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
                    color: "#fff", fontSize: "10px", fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px"
                  }}>
                    {course.category}
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-serif, Georgia, serif)",
                    fontSize: "22px", fontWeight: 400, color: "#fff",
                    lineHeight: 1.3, position: "relative", zIndex: 1
                  }}>
                    {course.title}
                  </h3>
                </div>

                {/* Card body */}
                <div style={{ padding: "28px 32px 32px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14.5px", color: "#5A6B5D", lineHeight: 1.7, marginBottom: "24px", fontWeight: 300 }}>
                      {course.description}
                    </p>

                    {/* Meta info */}
                    <div style={{
                      display: "flex", gap: "16px", flexWrap: "wrap",
                      marginBottom: "24px", paddingBottom: "24px",
                      borderBottom: "1px solid #EDEEE8"
                    }}>
                      {[
                        { label: course.level, color: course.level === "Diploma" ? "var(--gold-dark)" : "var(--accent-green)" },
                        { label: course.duration, color: "#5A6B5D" },
                        { label: course.lectures, color: "#5A6B5D" },
                      ].map((meta) => (
                        <span key={meta.label} style={{
                          padding: "6px 14px", borderRadius: "999px",
                          background: "#F3F4F0", fontSize: "11px", fontWeight: 600,
                          color: meta.color, letterSpacing: "0.03em"
                        }}>
                          {meta.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/contact"
                    style={{
                      display: "block", textAlign: "center",
                      padding: "14px 24px", borderRadius: "999px",
                      background: "var(--accent-green)",
                      color: "#fff", fontWeight: 600, fontSize: "13px",
                      letterSpacing: "0.04em", textDecoration: "none",
                      transition: "background 0.3s, transform 0.3s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--navy-deep)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-green)"; }}
                  >
                    Enroll Now
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PROGRAM STRUCTURE SECTION
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: "#fff",
        padding: "clamp(80px, 10vw, 120px) 24px",
        borderTop: "1px solid #DCE0D5",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="courses-program-grid"
          >
            {/* Left text */}
            <motion.div variants={fadeUp}>
              <span style={{
                color: "var(--accent-green)", fontWeight: 700, fontSize: "11px",
                letterSpacing: "3px", textTransform: "uppercase", display: "block", marginBottom: "12px"
              }}>
                How It Works
              </span>
              <h2 style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
                fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 400,
                color: "var(--accent-green)", lineHeight: 1.2, marginBottom: "20px"
              }}>
                Your Path to Graduation
              </h2>
              <p style={{ fontSize: "16px", color: "#5A6B5D", lineHeight: 1.7, fontWeight: 300, marginBottom: "36px" }}>
                Complete all 9 courses at your own pace. Each course consists of 10 lectures
                delivered over 6 weeks in a hybrid format — online and in-person — so you can
                continue your ministry while you study.
              </p>
              <div className="courses-program-buttons">
                <Link
                  href="/apply"
                  style={{
                    display: "inline-block", padding: "14px 32px",
                    background: "var(--accent-green)", color: "#fff",
                    fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em",
                    textTransform: "uppercase", borderRadius: "999px",
                    textDecoration: "none", transition: "background 0.3s",
                  }}
                >
                  Start Your Journey
                </Link>
                <Link
                  href="/contact"
                  style={{
                    display: "inline-block", padding: "14px 32px",
                    background: "transparent", color: "var(--accent-green)",
                    border: "1.5px solid #DCE0D5",
                    fontWeight: 600, fontSize: "12px", letterSpacing: "0.1em",
                    textTransform: "uppercase", borderRadius: "999px",
                    textDecoration: "none", transition: "border-color 0.3s",
                  }}
                >
                  Ask a Question
                </Link>
              </div>
            </motion.div>

            {/* Right: Steps */}
            <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { step: "01", title: "Enroll", desc: "Register online or contact admissions. Choose your start date." },
                { step: "02", title: "Study", desc: "Complete 10 lectures per course over 6 weeks — online, offline, or both." },
                { step: "03", title: "Complete", desc: "Finish all 9 courses and meet the requirements at your own pace." },
                { step: "04", title: "Graduate", desc: "Receive a globally accredited certificate at a local graduation ceremony." },
              ].map((item, i) => (
                <div
                  key={item.step}
                  style={{
                    display: "flex", gap: "24px", alignItems: "flex-start",
                    padding: "28px 0",
                    borderBottom: i < 3 ? "1px solid #EDEEE8" : "none",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-serif, Georgia, serif)",
                    fontSize: "32px", fontWeight: 400,
                    color: "var(--accent-green)", opacity: 0.3,
                    lineHeight: 1, minWidth: "44px"
                  }}>
                    {item.step}
                  </span>
                  <div>
                    <h4 style={{
                      fontFamily: "var(--font-serif, Georgia, serif)",
                      fontSize: "18px", fontWeight: 600,
                      color: "var(--accent-green)", marginBottom: "6px"
                    }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: "14px", color: "#5A6B5D", lineHeight: 1.6, fontWeight: 300 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          GRADUATION CTA
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(160deg, #1A2F25 0%, #2C4A3B 40%, #1A2F25 100%)",
        padding: "clamp(80px, 10vw, 120px) 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "600px", height: "600px", borderRadius: "50%",
            background: "var(--gold-primary)", opacity: 0.06, filter: "blur(120px)"
          }} />
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeUp} style={{
              color: "var(--gold-light)", fontWeight: 700, fontSize: "11px",
              letterSpacing: "3px", textTransform: "uppercase", display: "block", marginBottom: "16px"
            }}>
              Your Future Awaits
            </motion.span>
            <motion.h2 variants={fadeUp} style={{
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 400,
              color: "#fff", lineHeight: 1.15, marginBottom: "20px"
            }}>
              Graduation &amp; Certification
            </motion.h2>
            <motion.div variants={fadeUp} style={{ width: "60px", height: "3px", background: "var(--gold-light)", borderRadius: "2px", margin: "0 auto 28px" }} />
            <motion.p variants={fadeUp} style={{
              fontSize: "17px", color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7, fontWeight: 300, marginBottom: "44px", maxWidth: "600px", margin: "0 auto 44px"
            }}>
              Students who complete all courses and meet the requirements will receive
              a globally accredited certificate upon graduation. Graduation services
              will be conducted locally.
            </motion.p>
            <motion.div variants={fadeUp} className="courses-cta-buttons">
              <Link
                href="/contact"
                style={{
                  display: "inline-block", padding: "16px 36px",
                  background: "var(--gold-light)", color: "var(--navy-deep)",
                  fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em",
                  textTransform: "uppercase", borderRadius: "999px",
                  textDecoration: "none",
                }}
              >
                Talk to Admissions
              </Link>
              <Link
                href="/apply"
                style={{
                  display: "inline-block", padding: "16px 36px",
                  background: "transparent", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontWeight: 600, fontSize: "12px", letterSpacing: "0.1em",
                  textTransform: "uppercase", borderRadius: "999px",
                  textDecoration: "none",
                }}
              >
                Apply Online
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
