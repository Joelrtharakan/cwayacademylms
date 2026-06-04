"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, Shield, RefreshCw, CheckCircle } from "lucide-react";

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
          <h2 style={{ marginBottom: "1rem" }}>Thank You for Your Generosity!</h2>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Your gift of ₹{finalAmount.toLocaleString("en-IN")} toward <strong>{purpose}</strong> has been received. A receipt will be sent to {email}. May God multiply your seed sown!
          </p>
          <div className="scripture-block">
            "Give, and it will be given to you: good measure, pressed down, shaken together, and running over will be put into your bosom."
            <span className="scripture-reference">— Luke 6:38 (NKJV)</span>
          </div>
          <Link href="/" className="btn-primary" style={{ marginTop: "2rem", display: "inline-flex" }}>Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="parchment-bg" style={{ padding: "5rem 0 3rem" }}>
        <div className="container">
          <div className="section-label">Partner with the Ministry</div>
          <h1 style={{ marginBottom: "1rem" }}>Give to <span className="gradient-text-gold">Advance the Kingdom</span></h1>
          <div className="gold-divider gold-divider-left" />
          <p style={{ maxWidth: "560px", fontSize: "1.05rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
            Your generous giving directly funds theological training for rural pastors,
            women's ministry leaders, and Christian disciples across India who cannot
            afford education but are deeply called to serve.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="donate-layout-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3rem", alignItems: "start" }}>
            {/* Donation Form */}
            <div className="card-cream" style={{ padding: "2.5rem" }}>
              <h3 style={{ marginBottom: "1.5rem" }}>Make a Donation</h3>

              {/* Amount Selection */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Select Amount (INR) *</label>
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
                  <label className="form-label" htmlFor="custom-amount">Or enter custom amount</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                    <input
                      id="custom-amount"
                      type="number"
                      className="form-input"
                      style={{ paddingLeft: "2rem" }}
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setAmount(""); }}
                      placeholder="Enter amount"
                      min="100"
                    />
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="donation-purpose">Donation Purpose</label>
                <select id="donation-purpose" className="form-input" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                  {purposes.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>

              {/* Recurring */}
              <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "var(--cream-mid)", borderRadius: "10px" }}>
                <input id="recurring" type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "var(--gold-primary)" }} />
                <label htmlFor="recurring" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy-deep)", cursor: "pointer" }}>
                  Make this a monthly recurring gift
                </label>
              </div>

              {/* Donor Info */}
              <div className="form-row-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div><label className="form-label" htmlFor="donor-name">Full Name *</label><input id="donor-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" /></div>
                <div><label className="form-label" htmlFor="donor-email">Email *</label><input id="donor-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></div>
              </div>

              {/* Trust */}
              <div style={{ display: "flex", gap: "1rem", padding: "1rem", background: "rgba(61,122,75,0.06)", borderRadius: "10px", marginBottom: "1.5rem" }}>
                <Shield size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  Donations are processed securely via Razorpay (India) or Stripe (International). Tax receipts are issued under CWAY MISSIONS Religious Trust (India — 80G exemption applicable).
                </p>
              </div>

              <button onClick={() => finalAmount >= 100 && name && email && setSubmitted(true)} className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "1rem" }}>
                <Heart size={18} />
                {finalAmount ? `Give ₹${finalAmount.toLocaleString("en-IN")}${recurring ? "/month" : ""}` : "Give Now"}
              </button>
            </div>

            {/* Impact Panel */}
            <div>
              <h3 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Your Gift Makes an Impact</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { amount: "₹500", impact: "Funds one week of study materials for a rural pastor" },
                  { amount: "₹1,000", impact: "Sponsors a student's access to an entire course module" },
                  { amount: "₹2,000", impact: "Covers one month's scholarship for a rural ministry leader" },
                  { amount: "₹5,000", impact: "Fully sponsors one student for a 12-week certificate course" },
                  { amount: "₹10,000", impact: "Funds course development in a new Indian language" },
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
                "Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver."
                <span className="scripture-reference">— 2 Corinthians 9:7</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
