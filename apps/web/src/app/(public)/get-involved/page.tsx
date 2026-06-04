"use client";

import Link from "next/link";
import { Heart, Users, Globe, BookOpen, ArrowRight, DollarSign, Calendar, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

const ways = [
  {
    icon: Heart,
    title: "Prayer Partner",
    desc: "Become a prayer partner. Get in touch with us to choose a prayer option and receive our regular ministry updates.",
    cta: "Request Prayer Details",
    href: "/contact?subject=prayer",
    color: "var(--navy-light)",
  },
  {
    icon: DollarSign,
    title: "Sponsor a Candidate",
    desc: "Contribute a one-time gift of Rs. 15,000/- to fully sponsor one local church candidate for the entire 15-month training program.",
    cta: "Sponsor Today",
    href: "/get-involved#bank",
    color: "var(--gold-primary)",
  },
  {
    icon: Calendar,
    title: "Monthly Supporter",
    desc: "Partner with this project by pledging a custom monthly amount to support rural leadership operations across India.",
    cta: "Setup Partnership",
    href: "/contact?subject=partner",
    color: "var(--navy-mid)",
  },
  {
    icon: MessageSquare,
    title: "Share the Vision",
    desc: "Share this vision with like-minded people, pastors, and churches in your network who care about training frontline leaders.",
    cta: "Contact to Share",
    href: "/contact?subject=share",
    color: "var(--gold-light)",
  },
];

export default function GetInvolvedPage() {
  return (
    <div className="overflow-hidden">

      {/* Hero Header */}
      <section className="parchment-bg py-24 px-6">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label">Join the Mission</div>
            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 leading-tight max-w-4xl">
              Partner With Us to <span className="gradient-text-gold">Equip Leaders</span>
            </h1>
            <div className="gold-divider gold-divider-left" />
            <p className="max-w-2xl text-lg md:text-xl text-[var(--text-secondary)] font-light leading-relaxed mt-6">
              We request your partnership to help train Christian leaders for the church in India.
              Village churches cannot afford training costs without your help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ways to Give */}
      <section className="py-24 px-6 bg-white">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
          >
            <motion.span variants={fadeUp} className="section-label" style={{ justifyContent: "center" }}>How You Can Help</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold font-serif text-[var(--navy-deep)] mt-3">Ways to Get Involved</motion.h2>
            <motion.div variants={fadeUp} className="gold-divider" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {ways.map((w, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="bg-white p-8 rounded-[24px] shadow-md border border-[var(--border-light)] hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: `${w.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                      color: w.color,
                    }}
                  >
                    <w.icon size={24} />
                  </div>
                  <h4 className="text-xl font-bold font-serif text-[var(--navy-deep)] mb-3">{w.title}</h4>
                  <p className="text-[var(--text-secondary)] text-sm font-light leading-relaxed mb-6">{w.desc}</p>
                </div>
                <Link href={w.href} className="btn-primary" style={{ background: w.color, display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", padding: "0.625rem 1.25rem", borderRadius: "50px", textDecoration: "none", justifyContent: "center" }}>
                  {w.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bank Details section */}
      <section id="bank" className="py-24 px-6 bg-[var(--cream-base)]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
              className="space-y-6"
            >
              <span className="section-label">Giving Accountability</span>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-[var(--navy-deep)]">Financial Partnership</h2>
              <p className="text-[var(--text-secondary)] text-lg font-light leading-relaxed">
                CWAY Academy processes all sponsorships and gifts through CWAY MISSIONS.
                Sponsor funds go directly to local pastor candidates for course delivery,
                graduation services, and course materials.
              </p>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-[var(--border-light)] flex gap-4 items-start">
                <span className="text-[var(--gold-primary)] text-2xl">✓</span>
                <div>
                  <h4 className="text-lg font-bold text-[var(--navy-deep)] mb-1">Direct Scholarship</h4>
                  <p className="text-sm text-[var(--text-secondary)] font-light">100% of candidate sponsorships fund student study tools, internet allocations, and printed materials.</p>
                </div>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-[var(--border-light)] flex gap-4 items-start">
                <span className="text-[var(--gold-primary)] text-2xl">✓</span>
                <div>
                  <h4 className="text-lg font-bold text-[var(--navy-deep)] mb-1">Regular Reporting</h4>
                  <p className="text-sm text-[var(--text-secondary)] font-light">Receive regular updates on your sponsored candidate's progress and invitations to local graduation services.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={scaleIn}
              className="flex justify-center"
            >
              <div className="w-full bg-white border border-[var(--border-light)] p-10 md:p-14 rounded-[32px] shadow-lg border-t-8 border-t-[var(--gold-primary)]">
                <div className="w-16 h-16 rounded-full bg-[var(--gold-pale)]/50 text-[var(--gold-dark)] flex items-center justify-center text-2xl mx-auto mb-8 font-bold">🏦</div>
                <h3 className="text-3xl font-bold font-serif mb-8 text-[var(--navy-deep)] text-center">Bank Details</h3>
                <div className="space-y-5 text-left max-w-md mx-auto text-base md:text-lg">
                  <p className="flex justify-between border-b border-[var(--cream-mid)] pb-3 text-[var(--text-secondary)] font-light">
                    <span className="font-semibold text-[var(--navy-deep)]">Account Name:</span>
                    <span>CWAY MISSIONS</span>
                  </p>
                  <p className="flex justify-between border-b border-[var(--cream-mid)] pb-3 text-[var(--text-secondary)] font-light">
                    <span className="font-semibold text-[var(--navy-deep)]">Bank:</span>
                    <span className="text-right">Federal Bank <br /><span className="text-xs text-[var(--text-muted)]">Banaswadi Branch</span></span>
                  </p>
                  <p className="flex justify-between border-b border-[var(--cream-mid)] pb-3 text-[var(--text-secondary)] font-light">
                    <span className="font-semibold text-[var(--navy-deep)]">Account No:</span>
                    <span className="font-mono text-[var(--gold-dark)] font-semibold">14710200017349</span>
                  </p>
                  <p className="flex justify-between pb-3 text-[var(--text-secondary)] font-light">
                    <span className="font-semibold text-[var(--navy-deep)]">IFSC:</span>
                    <span className="font-mono text-[var(--gold-dark)] font-semibold">FDRL0001471</span>
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Scripture block */}
      <section className="bg-[var(--navy-deep)] py-24 px-6 text-white text-center">
        <div className="container max-w-3xl mx-auto">
          <div className="scripture-block p-8 bg-white/5 border-l-4 border-[var(--gold-primary)] rounded-r-xl max-w-2xl mx-auto">
            <p className="text-white/80 font-serif italic text-lg md:text-xl leading-relaxed mb-4">
              "Now may He who supplies seed to the sower, and bread for food, supply and multiply the seed you have sown and increase the fruits of your righteousness."
            </p>
            <span className="scripture-reference text-sm block font-sans font-bold text-[var(--gold-light)]">— 2 Corinthians 9:10 (NKJV)</span>
          </div>
          <div className="mt-12 flex gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-[var(--gold-primary)] hover:bg-[var(--gold-dark)] text-white font-semibold rounded-full transition-all text-decoration-none">
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
