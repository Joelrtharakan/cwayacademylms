import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, Award, BookOpen, ChevronRight, Play, CheckCircle } from "lucide-react";

const courses = [
  {
    slug: "foundations-biblical-theology",
    title: "Foundations of Biblical Theology",
    tagline: "Build your ministry on the unshakable Word of God.",
    level: "Certificate", duration: "12 weeks", lessons: 24, students: 340,
    instructor: "Dr. [Academic Dean]", instructorTitle: "Academic Dean · M.Div, Th.D",
    category: "Theology",
    scripture: { text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.", reference: "2 Timothy 3:16 (NIV)" },
    description: "This foundational course provides a comprehensive introduction to the nature, authority, and interpretation of the Bible. Students will explore the doctrines of Scripture, God, humanity, sin, salvation, and the Church — building a robust theological framework for ministry in the Indian context.",
    outcomes: ["Understand the nature and authority of Scripture", "Articulate the core doctrines of Christian theology", "Apply biblical hermeneutics to sermon preparation", "Distinguish biblical theology from systematic theology"],
    modules: [{ title: "Introduction to Theology", lessons: 4 }, { title: "The Doctrine of God", lessons: 4 }, { title: "Christology", lessons: 4 }, { title: "The Holy Spirit & Pneumatology", lessons: 4 }, { title: "Soteriology & Eschatology", lessons: 8 }],
    requirements: ["A personal commitment to Jesus Christ as Lord and Saviour", "Active involvement in a local church", "Basic literacy in English or Hindi"],
    format: "Self-paced with weekly live Q&A", language: "English, Hindi, Tamil", price: "₹4,500",
    scholarshipAvailable: true,
  },
  {
    slug: "pastoral-ministry-leadership",
    title: "Pastoral Ministry & Leadership",
    tagline: "Lead your congregation with the heart of a shepherd.",
    level: "Certificate", duration: "16 weeks", lessons: 32, students: 280,
    instructor: "Rev. [Ministry Director]", instructorTitle: "Director of Ministry Development · M.Min",
    category: "Leadership",
    scripture: { text: "Shepherd God's flock that is under your care, watching over them — not because you must, but because you are willing.", reference: "1 Peter 5:2 (NIV)" },
    description: "Designed for active pastors and ministry leaders, this course covers the theology and practice of pastoral ministry — from expository preaching and congregation care to leadership development and church administration.",
    outcomes: ["Develop and deliver expository sermons", "Implement pastoral care and counselling principles", "Build a strong leadership team", "Navigate conflict in the local church"],
    modules: [{ title: "Theology of Pastoral Ministry", lessons: 4 }, { title: "Expository Preaching Methods", lessons: 6 }, { title: "Pastoral Care & Counselling", lessons: 6 }, { title: "Leadership Development", lessons: 10 }, { title: "Church Administration", lessons: 6 }],
    requirements: ["Currently serving as pastor, elder, or lay leader", "Minimum 2 years of active ministry", "Basic theology foundation"],
    format: "Cohort-based with fortnightly live sessions", language: "English, Tamil, Telugu", price: "₹6,500",
    scholarshipAvailable: true,
  },
];

export async function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "Course Not Found" };
  return { title: `${course.title} | CWAY Academy`, description: course.description.slice(0, 160) };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ background: "var(--cream-mid)", padding: "1rem 0", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container" style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.82rem" }}>
          <Link href="/courses" style={{ color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600 }}>Courses</Link>
          <ChevronRight size={12} /><span style={{ color: "var(--text-muted)" }}>{course.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--navy-deep), var(--navy-mid))", padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "3rem", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span className="badge badge-gold">{course.level}</span>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>{course.category}</span>
              </div>
              <h1 style={{ color: "white", marginBottom: "0.75rem" }}>{course.title}</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{course.tagline}</p>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                {[{ icon: Clock, label: course.duration }, { icon: BookOpen, label: `${course.lessons} Lessons` }, { icon: Users, label: `${course.students}+ Students` }, { icon: Award, label: "Certificate" }].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                    <Icon size={14} color="var(--gold-light)" />{label}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(201,168,76,0.4)", flexShrink: 0 }}>
                  <BookOpen size={16} color="var(--gold-light)" />
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{course.instructor}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>{course.instructorTitle}</div>
                </div>
              </div>
            </div>

            {/* Enroll Card */}
            <div style={{ background: "var(--cream-light)", borderRadius: "20px", padding: "1.75rem", boxShadow: "var(--shadow-xl)" }}>
              <div style={{ height: "140px", borderRadius: "12px", background: "linear-gradient(135deg, var(--gold-primary), var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Play size={40} color="white" fill="white" style={{ marginLeft: "4px" }} />
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--navy-deep)", marginBottom: "0.25rem" }}>{course.price}</div>
              {course.scholarshipAvailable && <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>Scholarship available for rural pastors</p>}
              <Link href="/apply" className="btn-primary" style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "0.625rem" }}>Enroll Now</Link>
              <Link href="/apply?scholarship=true" style={{ display: "block", textAlign: "center", fontSize: "0.85rem", color: "var(--gold-dark)", fontWeight: 600, textDecoration: "none" }}>Apply for Scholarship</Link>
              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[`Format: ${course.format}`, `Language: ${course.language}`, `Duration: ${course.duration}`].map((item) => (
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
          <div className="scripture-block" style={{ marginTop: 0 }}>
            {course.scripture.text}<span className="scripture-reference">— {course.scripture.reference}</span>
          </div>
          <h2 style={{ marginBottom: "1rem" }}>About This Course</h2>
          <p style={{ lineHeight: 1.9, marginBottom: "2.5rem" }}>{course.description}</p>

          <h2 style={{ marginBottom: "1.25rem" }}>What You Will Learn</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2.5rem" }}>
            {course.outcomes.map((o) => (
              <div key={o} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.875rem 1rem", background: "var(--cream-mid)", borderRadius: "10px" }}>
                <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{o}</span>
              </div>
            ))}
          </div>

          <h2 style={{ marginBottom: "1.25rem" }}>Course Curriculum</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2.5rem" }}>
            {course.modules.map((mod, i) => (
              <div key={mod.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "var(--cream-mid)", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                  <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--gold-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--gold-dark)", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--navy-deep)" }}>{mod.title}</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{mod.lessons} lessons</span>
              </div>
            ))}
          </div>

          <h2 style={{ marginBottom: "1.25rem" }}>Requirements</h2>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "3rem" }}>
            {course.requirements.map((r) => (
              <li key={r} style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--gold-primary)", flexShrink: 0 }}>✦</span>{r}
              </li>
            ))}
          </ul>

          <div style={{ background: "var(--navy-deep)", borderRadius: "20px", padding: "2.5rem", textAlign: "center" }}>
            <h3 style={{ color: "white", marginBottom: "0.75rem" }}>Ready to Begin?</h3>
            <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "1.5rem", fontSize: "0.9rem", lineHeight: 1.7 }}>Scholarships are available. No called leader should be without training.</p>
            <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center" }}>
              <Link href="/apply" className="btn-primary">Apply Now</Link>
              <Link href="/courses" className="btn-outline-gold">View All Courses</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
