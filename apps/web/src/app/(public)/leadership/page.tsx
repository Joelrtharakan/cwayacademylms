import Link from "next/link";
import { ArrowRight, Heart, DollarSign, Users, Star } from "lucide-react";

export const metadata = {
  title: "Leadership Team",
  description: "Meet the CWAY Academy leadership team — seasoned theologians, pastors, and ministry leaders guiding our global theological training mission.",
};

const leaders = [
  {
    name: "Dr. [Director Name]",
    role: "Founder & Executive Director",
    credentials: "Th.D, M.Div",
    bio: "The founder of CWAY MISSIONS Religious Trust carries a prophetic burden for India's unreached communities. With decades of frontline ministry experience across rural India, he established CWAY Academy to ensure that every called servant of God has access to world-class theological training in their own language. His vision: a church equipped in every district of India.",
    specialty: "Systematic Theology · Church Planting · Apostolic Leadership",
  },
  {
    name: "Pastor [Academic Dean Name]",
    role: "Academic Dean",
    credentials: "M.Div, B.Th",
    bio: "Our Academic Dean brings 20+ years of theological education experience from leading seminaries across India. He oversees curriculum development, faculty selection, and academic standards, ensuring every CWAY Academy program maintains the highest level of biblical and pedagogical excellence. His passion: making deep theology accessible to the grassroots church.",
    specialty: "Biblical Hermeneutics · Curriculum Design · Pastoral Formation",
  },
  {
    name: "Rev. [Ministry Director Name]",
    role: "Director of Ministry Development",
    credentials: "M.Min, Certificate in Leadership",
    bio: "A veteran church planter and trainer with experience in 8+ Indian states, he leads our ministry development programs. His hands-on approach to training — combining classroom instruction with field-based mentorship — has shaped hundreds of effective rural pastors and church leaders across India.",
    specialty: "Five-Fold Ministry · Evangelism · Church Planting Strategy",
  },
  {
    name: "Sister [Women's Ministry Director Name]",
    role: "Director of Women's Ministry Training",
    credentials: "B.Th, Certified Christian Counsellor",
    bio: "A passionate advocate for women in ministry, she leads CWAY Academy's women's theological training programs. Drawing from her extensive experience in women's leadership across South India, she ensures that our training is contextually sensitive, doctrinally sound, and empowering for women at every level of ministry.",
    specialty: "Women's Leadership · Biblical Counselling · Discipleship",
  },
  {
    name: "Prof. [Theology Faculty Name]",
    role: "Professor of Old & New Testament",
    credentials: "M.Th, B.Th",
    bio: "A gifted Bible teacher with deep expertise in biblical languages and exegesis, he brings academic rigour to our Old and New Testament courses. His teaching style bridges scholarly depth with pastoral warmth, making complex biblical content accessible to students from all educational backgrounds.",
    specialty: "Biblical Exegesis · Old Testament · Pauline Literature",
  },
  {
    name: "Dr. [Missions Faculty Name]",
    role: "Professor of Missiology & Evangelism",
    credentials: "Ph.D (Missiology), M.Div",
    bio: "A renowned missions scholar with field experience in cross-cultural ministry across Asia, he brings global missiological perspective to CWAY Academy. His courses on evangelism, church planting, and indigenous ministry methods have equipped hundreds of church planters for effective service in unreached communities.",
    specialty: "Missiology · Cross-Cultural Ministry · Church Growth",
  },
];

export default function LeadershipPage() {
  return (
    <div>
      {/* Hero */}
      <section className="parchment-bg" style={{ padding: "6rem 0 4rem" }}>
        <div className="container reveal">
          <div className="section-label">Our Faculty & Leadership</div>
          <h1 style={{ marginBottom: "1rem" }}>
            Guided by <span className="gradient-text-gold">Seasoned Servants</span>
          </h1>
          <div className="gold-divider gold-divider-left" />
          <p style={{ maxWidth: "580px", fontSize: "1.05rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
            CWAY Academy is led and taught by men and women of God with decades of
            combined ministry, teaching, and theological expertise. Our team brings
            academic excellence rooted in practical kingdom experience.
          </p>
        </div>
      </section>

      {/* Leadership Grid */}
      <section className="section-padding bg-[var(--cream-base)]">
        <div className="container">
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
            {leaders.map((leader, i) => (
              <div 
                key={i} 
                className={`card-cream reveal ${i % 3 === 1 ? 'stagger-1' : i % 3 === 2 ? 'stagger-2' : ''}`} 
                style={{ padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", height: "100%", background: "white" }}
              >
                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: i % 2 === 0
                        ? "linear-gradient(135deg, var(--navy-deep), var(--navy-mid))"
                        : "linear-gradient(135deg, var(--gold-primary), var(--gold-dark))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      border: "3px solid var(--gold-light)",
                    }}
                  >
                    {leader.name.split(" ")[1]?.[1] || leader.name[0]}
                  </div>
                  <div>
                    <h4 style={{ color: "var(--navy-deep)", marginBottom: "0.25rem", fontSize: "1rem" }}>{leader.name}</h4>
                    <div style={{ fontSize: "0.85rem", color: "var(--gold-dark)", fontWeight: 600, marginBottom: "0.25rem" }}>{leader.role}</div>
                    <span className="badge badge-gold" style={{ fontSize: "0.7rem" }}>{leader.credentials}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                  {leader.bio}
                </p>
                <div style={{ padding: "0.75rem 1rem", background: "var(--cream-mid)", borderRadius: "8px", fontSize: "0.78rem", color: "var(--gold-dark)", fontWeight: 600, letterSpacing: "0.03em" }}>
                  ✦ {leader.specialty}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Team CTA */}
      <section style={{ background: "var(--navy-deep)", padding: "5rem 0", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ color: "white", marginBottom: "1rem" }}>Are You Called to Teach?</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", maxWidth: "480px", margin: "0 auto 2rem", lineHeight: 1.8 }}>
            CWAY Academy is always seeking qualified theologians, pastors, and ministry
            practitioners who are passionate about equipping the next generation of
            Indian Christian leaders.
          </p>
          <Link href="/contact?subject=faculty" className="btn-primary">
            Enquire About Faculty Positions <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
