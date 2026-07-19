"use client";
import { useState } from "react";
import { CheckCircle, ChevronRight, ChevronLeft, BookOpen, User, Church, FileText, Heart, Upload } from "lucide-react";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Ministry Background", icon: Church },
  { id: 3, title: "Course Selection", icon: BookOpen },
  { id: 4, title: "Testimony", icon: Heart },
  { id: 5, title: "Documents", icon: Upload },
  { id: 6, title: "Review & Submit", icon: CheckCircle },
];

const courses = [
  "Foundations of Biblical Theology (Certificate)",
  "Pastoral Ministry & Leadership (Certificate)",
  "Five-Fold Ministry Training (Diploma)",
  "Evangelism & Church Planting (Certificate)",
  "Worship Arts & Ministry (Certificate)",
  "Biblical Counselling & Care (Diploma)",
  "Old Testament Survey (Beginner)",
  "New Testament Survey (Beginner)",
  "Christian Ethics & Social Justice (Intermediate)",
];

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dateOfBirth: "", gender: "", address: "", city: "", state: "", country: "India",
    church: "", denomination: "", yearsInMinistry: "", ministryRole: "",
    courseId: "", format: "",
    scholarshipRequest: false, scholarshipReason: "",
    testimony: "",
    submitted: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = () => {
    setForm((p) => ({ ...p, submitted: true }));
  };

  if (form.submitted) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "500px", padding: "2rem" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, var(--success), #52a86b)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h2 style={{ marginBottom: "1rem" }}>Application Submitted!</h2>
          <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Thank you, {form.firstName}. Your application has been received. Our admissions team will review it and respond within 5–7 business days. Please check your email for a confirmation.
          </p>
          <div className="scripture-block">
            "Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths."
            <span className="scripture-reference">— Proverbs 3:5–6</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .apply-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .apply-form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .apply-step-nav { display: flex; justify-content: space-between; margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border-light); }
        .apply-progress-label { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-align: center; max-width: 64px; }
        @media (max-width: 768px) {
          .apply-form-grid-2, .apply-form-grid-3 { grid-template-columns: 1fr; }
          .apply-step-nav { gap: 0.75rem; }
          .apply-progress-label { display: none; }
        }
        @media (max-width: 480px) {
          .card-cream { padding: 1.5rem !important; }
        }
      ` }} />
      {/* Header */}
      <section className="parchment-bg" style={{ padding: "4rem 0 2rem" }}>
        <div className="container">
          <div className="section-label">Admissions</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Apply to <span className="gradient-text-gold">CWAY Academy</span></h1>
          <p style={{ color: "var(--text-secondary)" }}>Complete the 6-step application below. You can save and resume at any time.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: "800px" }}>
          {/* Progress Steps */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3rem", position: "relative" }}>
            <div style={{ position: "absolute", top: "22px", left: "10%", right: "10%", height: "2px", background: "var(--border-light)", zIndex: 0 }} />
            {steps.map((s) => (
              <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", zIndex: 1 }}>
                <div
                  onClick={() => step > s.id && setStep(s.id)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: step >= s.id ? (step === s.id ? "var(--gold-primary)" : "var(--success)") : "var(--cream-mid)",
                    border: "3px solid " + (step >= s.id ? (step === s.id ? "var(--gold-primary)" : "var(--success)") : "var(--border-light)"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: step > s.id ? "pointer" : "default",
                    transition: "all 0.3s",
                    color: step >= s.id ? "white" : "var(--text-muted)",
                  }}
                >
                  {step > s.id ? <CheckCircle size={20} /> : <s.icon size={18} />}
                </div>
                <span className="apply-progress-label" style={{ color: step >= s.id ? "var(--navy-deep)" : "var(--text-muted)" }}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="card-cream" style={{ padding: "2.5rem" }}>
            {step === 1 && (
              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>Personal Information</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>Tell us a bit about yourself.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div className="apply-form-grid-2">
                    <div><label className="form-label" htmlFor="app-first">First Name *</label><input id="app-first" className="form-input" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Samuel" /></div>
                    <div><label className="form-label" htmlFor="app-last">Last Name *</label><input id="app-last" className="form-input" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Raju" /></div>
                  </div>
                  <div><label className="form-label" htmlFor="app-email">Email Address *</label><input id="app-email" type="email" className="form-input" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" /></div>
                  <div><label className="form-label" htmlFor="app-phone">Phone Number *</label><input id="app-phone" type="tel" className="form-input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" /></div>
                  <div className="apply-form-grid-2">
                    <div><label className="form-label" htmlFor="app-dob">Date of Birth</label><input id="app-dob" type="date" className="form-input" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} /></div>
                    <div>
                      <label className="form-label" htmlFor="app-gender">Gender</label>
                      <select id="app-gender" className="form-input" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                        <option value="">Select...</option>
                        <option>Male</option><option>Female</option><option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div><label className="form-label" htmlFor="app-address">Address</label><input id="app-address" className="form-input" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street address" /></div>
                  <div className="apply-form-grid-3">
                    <div><label className="form-label" htmlFor="app-city">City</label><input id="app-city" className="form-input" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Bangalore" /></div>
                    <div><label className="form-label" htmlFor="app-state">State</label><input id="app-state" className="form-input" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Karnataka" /></div>
                    <div><label className="form-label" htmlFor="app-country">Country</label><input id="app-country" className="form-input" value={form.country} onChange={(e) => update("country", e.target.value)} /></div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>Ministry Background</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>Tell us about your church and ministry context.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div><label className="form-label" htmlFor="app-church">Church / Organization Name *</label><input id="app-church" className="form-input" value={form.church} onChange={(e) => update("church", e.target.value)} placeholder="Grace Community Church" /></div>
                  <div><label className="form-label" htmlFor="app-denom">Denomination / Stream</label><input id="app-denom" className="form-input" value={form.denomination} onChange={(e) => update("denomination", e.target.value)} placeholder="Pentecostal, Baptist, CSI, etc." /></div>
                  <div className="apply-form-grid-2">
                    <div><label className="form-label" htmlFor="app-years">Years in Ministry *</label><input id="app-years" type="number" min="0" className="form-input" value={form.yearsInMinistry} onChange={(e) => update("yearsInMinistry", e.target.value)} placeholder="5" /></div>
                    <div>
                      <label className="form-label" htmlFor="app-role">Ministry Role *</label>
                      <select id="app-role" className="form-input" value={form.ministryRole} onChange={(e) => update("ministryRole", e.target.value)}>
                        <option value="">Select your role...</option>
                        <option>Senior Pastor</option><option>Associate Pastor</option><option>Lay Leader</option>
                        <option>Evangelist</option><option>Worship Leader</option><option>Youth Leader</option>
                        <option>Women's Ministry Leader</option><option>Church Planter</option>
                        <option>Missionary</option><option>Christian Educator</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>Course Selection</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>Choose the course you would like to enroll in.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label className="form-label" htmlFor="app-course">Preferred Course *</label>
                    <select id="app-course" className="form-input" value={form.courseId} onChange={(e) => update("courseId", e.target.value)}>
                      <option value="">Select a course...</option>
                      {courses.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="app-format">Preferred Learning Format</label>
                    <select id="app-format" className="form-input" value={form.format} onChange={(e) => update("format", e.target.value)}>
                      <option value="">Select format...</option>
                      <option>Self-Paced (Online)</option>
                      <option>Cohort-Based (Online with live sessions)</option>
                      <option>Hybrid (Online + in-person workshops)</option>
                    </select>
                  </div>

                  {/* Scholarship */}
                  <div className="scripture-block" style={{ marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <input
                        id="app-scholarship"
                        type="checkbox"
                        checked={form.scholarshipRequest}
                        onChange={(e) => update("scholarshipRequest", e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--gold-primary)" }}
                      />
                      <label htmlFor="app-scholarship" style={{ fontStyle: "normal", fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600, color: "var(--navy-deep)" }}>
                        I am requesting a scholarship
                      </label>
                    </div>
                    <p style={{ fontStyle: "normal", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                      CWAY Academy offers generous scholarships to rural pastors and those in financial need. No called leader should be prevented from receiving training.
                    </p>
                  </div>

                  {form.scholarshipRequest && (
                    <div>
                      <label className="form-label" htmlFor="app-scholarship-reason">Please explain your need for scholarship support *</label>
                      <textarea id="app-scholarship-reason" className="form-input" rows={4} value={form.scholarshipReason} onChange={(e) => update("scholarshipReason", e.target.value)} placeholder="Please share your financial situation and how a scholarship would help you pursue this training..." style={{ resize: "vertical" }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>Your Testimony</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>Share your faith journey and calling to ministry in your own words.</p>
                <div>
                  <label className="form-label" htmlFor="app-testimony">Personal Testimony & Ministry Calling *</label>
                  <textarea
                    id="app-testimony"
                    className="form-input"
                    rows={10}
                    value={form.testimony}
                    onChange={(e) => update("testimony", e.target.value)}
                    placeholder="Share when you came to faith in Jesus Christ, how God called you to ministry, and what you hope to accomplish through CWAY Academy training..."
                    style={{ resize: "vertical" }}
                  />
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>{form.testimony.length} characters (minimum 200 recommended)</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>Document Uploads</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>Please upload the following supporting documents. Accepted formats: PDF, JPG, PNG (max 5MB each).</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {[
                    { id: "doc-id", label: "Government ID (Aadhar / Passport / Voter ID)", required: true },
                    { id: "doc-church", label: "Church / Ministry Recommendation Letter", required: true },
                    { id: "doc-statement", label: "Statement of Faith (if available)", required: false },
                    { id: "doc-education", label: "Educational Certificate (if applicable)", required: false },
                  ].map((doc) => (
                    <div key={doc.id}>
                      <label className="form-label" htmlFor={doc.id}>
                        {doc.label} {doc.required ? "*" : <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional)</span>}
                      </label>
                      <div
                        style={{
                          border: "2px dashed var(--border-light)",
                          borderRadius: "12px",
                          padding: "2rem",
                          textAlign: "center",
                          background: "var(--cream-base)",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                      >
                        <Upload size={24} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem" }} />
                        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
                          <label htmlFor={doc.id} style={{ color: "var(--gold-dark)", fontWeight: 600, cursor: "pointer" }}>Browse files</label>
                          {" "}or drag and drop
                        </p>
                        <input id={doc.id} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>Review Your Application</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>Please review your details before submitting.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {[
                    { label: "Full Name", value: `${form.firstName} ${form.lastName}` },
                    { label: "Email", value: form.email },
                    { label: "Phone", value: form.phone },
                    { label: "Location", value: [form.city, form.state, form.country].filter(Boolean).join(", ") },
                    { label: "Church", value: form.church },
                    { label: "Ministry Role", value: form.ministryRole },
                    { label: "Years in Ministry", value: form.yearsInMinistry },
                    { label: "Selected Course", value: form.courseId },
                    { label: "Scholarship Request", value: form.scholarshipRequest ? "Yes" : "No" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "1rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy-deep)", minWidth: "160px" }}>{label}:</span>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{value || "—"}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "2rem", padding: "1.25rem", background: "var(--cream-mid)", borderRadius: "10px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  By submitting this application, I confirm that all information provided is accurate and truthful. I understand that CWAY Academy will review my application and respond within 5–7 business days.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="apply-step-nav">
              {step > 1 ? (
                <button onClick={() => setStep((s) => s - 1)} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ChevronLeft size={16} /> Previous
                </button>
              ) : <div />}

              {step < 6 ? (
                <button onClick={() => setStep((s) => s + 1)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--success)" }}>
                  Submit Application <CheckCircle size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
