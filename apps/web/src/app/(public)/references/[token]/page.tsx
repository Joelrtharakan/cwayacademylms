"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { api } from "@/store/auth.store";

const labelStyle = { display: "block", fontSize: "14px", fontWeight: 600, color: "var(--navy-deep)", marginBottom: "0.5rem" };
const inputStyle = { width: "100%", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", background: "#FFFFFF", fontSize: "15px", outline: "none", transition: "all 0.2s" };

function InputField({ label, name, value, onChange, placeholder, required = false, type = "text" }: any) {
  return (
    <div style={{ flex: 1 }}>
      {label && <label style={labelStyle}>{label} {required && "*"}</label>}
      <input type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}

const RATING_OPTIONS = ["Excellent", "Above Average", "Average", "Requires Attention", "Not Observed"];
const EVALUATION_AREAS = [
  "Christian Commitment", "Spiritual Maturity", "Christian Character/Testimony",
  "Attitude to Authority", "Sense of Responsibility", "Ability to Study in English",
  "Willingness to Learn", "Ability to Work with Others", "Willingness to Help Others",
  "Integrity/Honesty", "Leadership Ability", "Relationship with the Family"
];

export default function ReferenceFormPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [refData, setRefData] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    yearsKnown: "",
    capacityKnown: "",
    churchEngagement: "",
    spiritualInfluence: "",
    ratings: EVALUATION_AREAS.reduce((acc, area) => ({ ...acc, [area]: "" }), {}),
    financialAbility: "",
    financialHelp: "", // Pastor only
    comments: "",
    attentionAreas: "", // General only
    discussFurther: false,
    recommendation: "",
    refereeName: "",
    refereePosition: "",
    churchName: "", // Pastor only
    denomination: "", // Pastor only
    addressLine1: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    async function fetchTokenDetails() {
      try {
        const res = await api.get(`/references/${token}`);
        if (res.data.status === "success") {
          setRefData(res.data.data);
          setFormData((prev: any) => ({
            ...prev,
            refereeName: res.data.data.refereeData.name || "",
            email: res.data.data.refereeData.email || "",
          }));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid or expired reference link.");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchTokenDetails();
  }, [token]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("rating_")) {
      const area = name.replace("rating_", "");
      setFormData((prev: any) => ({ ...prev, ratings: { ...prev.ratings, [area]: value } }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        type: isPastor ? "PASTOR" : "GENERAL",
        address: {
          line1: formData.addressLine1,
          city: formData.addressCity,
          state: formData.addressState,
          zip: formData.addressZip
        }
      };
      const res = await api.post(`/references/${token}`, payload);
      if (res.data.status === "success") {
        setSubmitted(true);
        toast.success("Reference form submitted successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit form.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Loading form details...</div>;

  if (error) {
    return (
      <div style={{ padding: "4rem 2rem", background: "#F5F0E8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "3rem", borderRadius: "16px", maxWidth: "500px", textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", color: "var(--navy-deep)", marginBottom: "1rem" }}>Invalid Link</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{error}</p>
          <Link href="/" className="btn-primary" style={{ padding: "12px 24px", borderRadius: "8px" }}>Return Home</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ padding: "4rem 2rem", background: "#F5F0E8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "3rem", borderRadius: "16px", maxWidth: "600px", textAlign: "center" }}>
          <h2 style={{ fontSize: "28px", color: "var(--navy-deep)", marginBottom: "1rem" }}>Thank You!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1.6 }}>
            Your reference for <strong>{refData?.applicantName}</strong> has been successfully submitted. We deeply appreciate your time and objective evaluation to help us make the right admission decision.
          </p>
        </div>
      </div>
    );
  }

  const isPastor = refData?.refereeData?.type === "Pastor's Recommendation";

  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh", padding: "4rem 2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", background: "#FFFFFF", borderRadius: "20px", padding: "3rem 4rem", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "32px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", marginBottom: "0.5rem" }}>
            {isPastor ? "Pastor's Recommendation Form" : "General Reference Form"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Confidential Reference for <strong>{refData?.applicantName}</strong> applying to <strong>{refData?.programName}</strong>
          </p>
        </div>

        <div style={{ padding: "1.5rem", background: "rgba(201,151,58,0.05)", borderRadius: "12px", borderLeft: "4px solid var(--gold-dark)", marginBottom: "3rem" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy-deep)", marginBottom: "0.5rem" }}>Instructions</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            Admission eligibility depends upon a careful evaluation of your recommendation. We value your comments very highly and request you to complete this form carefully and as objectively as possible. This document will be kept strictly confidential.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* 1. Questions About Applicant */}
          <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "22px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Questions About the Applicant</h3>
            
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="How long have you known the applicant?" name="yearsKnown" value={formData.yearsKnown} onChange={handleChange} placeholder="e.g. 5 years" required />
              <InputField label="In what capacity do you know him/her?" name="capacityKnown" value={formData.capacityKnown} onChange={handleChange} placeholder="e.g. Pastor, Mentor, Friend" required />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>To what extent is the applicant engaged in {isPastor ? 'the activities of your church' : 'Christian ministry activities'}? *</label>
              <select name="churchEngagement" value={formData.churchEngagement} onChange={handleChange} required style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select an option</option>
                <option value="Enthusiastic">Enthusiastic</option>
                <option value="Co-operative">Co-operative</option>
                <option value="Seldom participates">Seldom participates</option>
                <option value="Attends irregularly">Attends irregularly</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>What is the applicant's spiritual influence on his/her peers? *</label>
              <select name="spiritualInfluence" value={formData.spiritualInfluence} onChange={handleChange} required style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select an option</option>
                <option value="Evangelistic">Evangelistic</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
          </div>

          {/* 2. Evaluation Table */}
          <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "22px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Applicant Evaluation</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>How would you rate the applicant in the following areas?</p>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#F5F0E8", textAlign: "left" }}>
                    <th style={{ padding: "12px", border: "1px solid rgba(220,224,213,0.8)" }}>Area</th>
                    {RATING_OPTIONS.map(opt => <th key={opt} style={{ padding: "12px", border: "1px solid rgba(220,224,213,0.8)", textAlign: "center" }}>{opt}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {EVALUATION_AREAS.map(area => (
                    <tr key={area}>
                      <td style={{ padding: "12px", border: "1px solid rgba(220,224,213,0.8)", fontWeight: 500 }}>{area}</td>
                      {RATING_OPTIONS.map(opt => (
                        <td key={opt} style={{ padding: "12px", border: "1px solid rgba(220,224,213,0.8)", textAlign: "center" }}>
                          <input type="radio" name={`rating_${area}`} value={opt} checked={formData.ratings[area] === opt} onChange={handleChange} required />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Financial & Comments */}
          <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "22px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Additional Information</h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>How would you rate the applicant's financial ability to support himself/herself? *</label>
              <select name="financialAbility" value={formData.financialAbility} onChange={handleChange} required style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select an option</option>
                <option value="Able to support himself/herself">Able to support himself/herself</option>
                <option value="Would need some help">Would need some help</option>
                <option value="Unable to pay">Unable to pay</option>
                <option value="In real need of help">In real need of help</option>
              </select>
            </div>

            {isPastor && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>If the applicant needs financial help, how and to what extent will your church be able to help?</label>
                <select name="financialHelp" value={formData.financialHelp} onChange={handleChange} required style={{ ...inputStyle, appearance: "none" }}>
                  <option value="">Select an option</option>
                  <option value="Take full responsibility">Take full responsibility</option>
                  <option value="Raise support">Raise support</option>
                  <option value="Help partially">Help partially</option>
                  <option value="Not be able to help at all">Not be able to help at all</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Please comment on any positive or negative characteristics you have observed in the life of the applicant (personal, social, family, etc.) *</label>
              <textarea name="comments" data-lenis-prevent="true" value={formData.comments} onChange={handleChange} required rows={4} style={{ ...inputStyle, resize: "vertical" }}></textarea>
            </div>

            {!isPastor && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>In your opinion, what areas of the applicant's life would need special attention?</label>
                <textarea name="attentionAreas" data-lenis-prevent="true" value={formData.attentionAreas || ""} onChange={handleChange} required rows={3} style={{ ...inputStyle, resize: "vertical" }}></textarea>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "15px", color: "var(--navy-deep)", cursor: "pointer" }}>
                <input type="checkbox" name="discussFurther" checked={formData.discussFurther} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: "var(--gold-dark)" }} />
                I would like someone to call me to discuss this student further.
              </label>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Overall Recommendation *</label>
              <select name="recommendation" value={formData.recommendation} onChange={handleChange} required style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select an option</option>
                <option value="I strongly recommend">I strongly recommend</option>
                <option value="I recommend with reservation">I recommend with reservation</option>
                <option value="I do not recommend">I do not recommend</option>
              </select>
            </div>
          </div>

          {/* 4. Referee Information */}
          <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "22px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Your Information</h3>
            
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="Name" name="refereeName" value={formData.refereeName} onChange={handleChange} required />
              <InputField label="Position/Title" name="refereePosition" value={formData.refereePosition} onChange={handleChange} placeholder="e.g. Senior Pastor, Colleague" required />
            </div>

            {isPastor && (
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <InputField label="Name of Church" name="churchName" value={formData.churchName} onChange={handleChange} required />
                <InputField label="Denomination" name="denomination" value={formData.denomination} onChange={handleChange} required />
              </div>
            )}

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" required />
              <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +1-800-CHURCH or +1234567890" required />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <InputField label="Street Address" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
            </div>
            
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
              <InputField label="Town / City" name="addressCity" value={formData.addressCity} onChange={handleChange} required />
              <InputField label="State" name="addressState" value={formData.addressState} onChange={handleChange} required />
              <InputField label="Pincode / ZIP Code" name="addressZip" value={formData.addressZip} onChange={handleChange} required />
            </div>
            
            {/* Simple Signature representation - Can be expanded to drawing pad later if needed */}
            <div style={{ padding: "1.5rem", border: "1px solid rgba(220, 224, 213, 0.8)", borderRadius: "12px", background: "#f9fbf8" }}>
               <h4 style={{ fontSize: "16px", marginBottom: "1rem", color: "var(--navy-deep)" }}>Digital Signature</h4>
               <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "1rem" }}>By typing my full name below, I authorize this as my electronic signature and affirm that all provided information is true.</p>
               <InputField label="Type Full Name to Sign" name="signatureUrl" value={formData.signatureUrl} onChange={handleChange} placeholder="First Last" required />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", padding: "1.25rem", fontSize: "18px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", letterSpacing: "1px" }}>
            {submitting ? "SUBMITTING REFERENCE..." : "SUBMIT REFERENCE"}
          </button>
        </form>

      </div>
    </div>
  );
}
