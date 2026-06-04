import { ContactContent } from "./ContactContent";

export const metadata = {
  title: "Contact Us",
  description: "Contact CWAY Academy — reach our admissions team, faculty, or ministry partnership office. Located in Bangalore, India.",
};

export default function ContactPage() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Animated Floating Orbs */}
      <div className="floating-orb orb-green" style={{ top: "5%", left: "-10%", width: "400px", height: "400px" }} />
      <div className="floating-orb orb-gold" style={{ top: "35%", right: "-10%", width: "350px", height: "350px" }} />
      
      {/* Hero Header */}
      <section className="parchment-bg" style={{ padding: "5rem 0 3rem", position: "relative", zIndex: 2 }}>
        <div className="container reveal">
          <div className="section-label">Get in Touch</div>
          <h1 style={{ marginBottom: "1rem" }}>We Would Love to <span className="gradient-text-gold">Hear From You</span></h1>
          <div className="gold-divider gold-divider-left" />
          <p style={{ maxWidth: "560px", fontSize: "1.05rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
            Whether you have questions about admissions, course details, church partnerships, 
            or want to coordinate a donation — our administrative team is here to assist you.
          </p>
        </div>
      </section>

      {/* Redesigned interactive client content */}
      <ContactContent />
    </div>
  );
}

