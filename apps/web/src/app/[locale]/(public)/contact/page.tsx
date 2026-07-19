import { ContactContent } from "./ContactContent";
import { useTranslations } from "next-intl";

export const metadata = {
  title: "Contact Us",
  description: "Contact CWAY Academy — reach our admissions team, faculty, or ministry partnership office. Located in Bangalore, India.",
};

export default function ContactPage() {
  const t = useTranslations("public.contact");
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Animated Floating Orbs */}
      <div className="floating-orb orb-green" style={{ top: "5%", left: "-10%", width: "400px", height: "400px" }} />
      <div className="floating-orb orb-gold" style={{ top: "35%", right: "-10%", width: "350px", height: "350px" }} />
      
      {/* Hero Header */}
      <section className="parchment-bg" style={{ padding: "5rem 0 3rem", position: "relative", zIndex: 2 }}>
        <div className="container reveal">
          <div className="section-label">{t("label")}</div>
          <h1 style={{ marginBottom: "1rem" }}>{t("title_start")} <span className="gradient-text-gold">{t("title_highlight")}</span></h1>
          <div className="gold-divider gold-divider-left" />
          <p style={{ maxWidth: "560px", fontSize: "1.05rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
            {t("desc")}
          </p>
        </div>
      </section>

      {/* Redesigned interactive client content */}
      <ContactContent />
    </div>
  );
}

