"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Shield, RefreshCw, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const amounts = [500, 1000, 2000, 5000, 10000];
const purposes = [
  "General Ministry Fund",
  "Scholarship Fund — Rural Pastors",
  "Course Development",
  "Technology & Infrastructure",
  "Women's Ministry Training",
  "Church Planting Support",
];

export default function DonatePage() {
  const t = useTranslations("public.donate");
  
  const [amount, setAmount] = useState<number | "">("");
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState(purposes[0]);
  const [recurring, setRecurring] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const finalAmount = amount || Number(custom) || 0;

  if (submitted) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "480px", padding: "2rem" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, var(--gold-primary), var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h2 style={{ marginBottom: "1rem" }}>{t("success.title")}</h2>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            {t("success.desc_1")}{finalAmount.toLocaleString("en-IN")}{t("success.desc_2")}<strong>{purpose}</strong>{t("success.desc_3")}{email}{t("success.desc_4")}
          </p>
          <div className="scripture-block">
            {t("success.quote")}
            <span className="scripture-reference">{t("success.quote_ref")}</span>
          </div>
          <Link href="/" className="btn-primary" style={{ marginTop: "2rem", display: "inline-flex" }}>{t("success.btn")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="parchment-bg" style={{ padding: "5rem 0 3rem" }}>
        <div className="container">
          <div className="section-label">{t("label")}</div>
          <h1 style={{ marginBottom: "1rem" }}>{t("title_start")} <span className="gradient-text-gold">{t("title_highlight")}</span></h1>
          <div className="gold-divider gold-divider-left" />
          <p style={{ maxWidth: "560px", fontSize: "1.05rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
            {t("desc")}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="donate-layout-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3rem", alignItems: "start" }}>
            {/* Donation Form */}
            <div className="card-cream" style={{ padding: "2.5rem" }}>
              <h3 style={{ marginBottom: "1.5rem" }}>{t("form.title")}</h3>

              {/* Amount Selection */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">{t("form.amount_label")}</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  {amounts.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAmount(a); setCustom(""); }}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "10px",
                        border: amount === a ? "2px solid var(--gold-primary)" : "1.5px solid var(--border-light)",
                        background: amount === a ? "var(--gold-pale)" : "var(--cream-base)",
                        color: amount === a ? "var(--gold-dark)" : "var(--text-secondary)",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      ₹{a.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="form-label" htmlFor="custom-amount">{t("form.custom_amount_label")}</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                    <input
                      id="custom-amount"
                      type="number"
                      className="form-input"
                      style={{ paddingLeft: "2rem" }}
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setAmount(""); }}
                      placeholder={t("form.custom_amount_placeholder")}
                      min="100"
                    />
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="donation-purpose">{t("form.purpose_label")}</label>
                <select id="donation-purpose" className="form-input" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                  {purposes.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>

              {/* Recurring */}
              <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "var(--cream-mid)", borderRadius: "10px" }}>
                <input id="recurring" type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "var(--gold-primary)" }} />
                <label htmlFor="recurring" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy-deep)", cursor: "pointer" }}>
                  {t("form.recurring_label")}
                </label>
              </div>

              {/* Donor Info */}
              <div className="form-row-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div><label className="form-label" htmlFor="donor-name">{t("form.name_label")}</label><input id="donor-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("form.name_placeholder")} /></div>
                <div><label className="form-label" htmlFor="donor-email">{t("form.email_label")}</label><input id="donor-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("form.email_placeholder")} /></div>
              </div>

              {/* Trust */}
              <div style={{ display: "flex", gap: "1rem", padding: "1rem", background: "rgba(61,122,75,0.06)", borderRadius: "10px", marginBottom: "1.5rem" }}>
                <Shield size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {t("form.trust_desc")}
                </p>
              </div>

              <button onClick={() => finalAmount >= 100 && name && email && setSubmitted(true)} className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "1rem" }}>
                <Heart size={18} />
                {finalAmount ? `${t("form.btn_give")} ₹${finalAmount.toLocaleString("en-IN")}${recurring ? t("form.btn_month") : ""}` : t("form.btn_give_now")}
              </button>
            </div>

            {/* Impact Panel */}
            <div>
              <h3 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>{t("impact.title")}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { amount: "₹500", impact: t("impact.item_500") },
                  { amount: "₹1,000", impact: t("impact.item_1000") },
                  { amount: "₹2,000", impact: t("impact.item_2000") },
                  { amount: "₹5,000", impact: t("impact.item_5000") },
                  { amount: "₹10,000", impact: t("impact.item_10000") },
                ].map((item) => (
                  <div key={item.amount} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ background: "var(--gold-primary)", color: "white", fontWeight: 700, fontSize: "0.85rem", padding: "0.375rem 0.75rem", borderRadius: "8px", flexShrink: 0, fontFamily: "var(--font-serif)" }}>
                      {item.amount}
                    </div>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>{item.impact}</p>
                  </div>
                ))}
              </div>

              <div className="scripture-block" style={{ marginTop: "2rem" }}>
                {t("impact.quote")}
                <span className="scripture-reference">{t("impact.quote_ref")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
