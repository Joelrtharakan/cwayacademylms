"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/store/auth.store";
import { toast } from "react-hot-toast";
import { Camera, FileText, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";

function InputField({ label, name, type = "text", required = false, width = "100%", placeholder = "", value, onChange }: any) {
  return (
    <div style={{ width, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {label && <label style={{ display: "block", marginBottom: "0.6rem", fontSize: "13px", fontWeight: 700, color: "var(--navy-deep)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label} {required && <span style={{color: "var(--danger, red)"}}>*</span>}</label>}
      <input type={type} name={name} placeholder={placeholder} value={value || ""} onChange={onChange} required={required}
             style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", background: "#FFFFFF", fontSize: "15px", outline: "none", transition: "all 0.2s" }}
             onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold-dark)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.15)"; }}
             onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(220, 224, 213, 0.8)"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function ProgramApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;
  
  const [program, setProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    mediumOfStudy: "English",
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    aadhaarNumber: "",
    
    mobileCode: "+971",
    mobileNumber: "",
    whatsappCode: "+971",
    whatsappNumber: "",
    email: "",
    
    permanentAddressLine1: "",
    permanentAddressLine2: "",
    permanentCity: "",
    permanentState: "",
    permanentPostalCode: "",
    permanentCountry: "",
    
    currentAddressLine1: "",
    currentAddressLine2: "",
    currentCity: "",
    currentState: "",
    currentPostalCode: "",
    currentCountry: "",
    
    highestQualification: "",
    previousInstitution: "",
    yearOfCompletion: "",
    marksOrGrade: "",
    
    isBornAgain: "yes",
    churchName: "",
    churchAddressLine1: "",
    churchAddressLine2: "",
    churchCity: "",
    churchState: "",
    churchPostalCode: "",
    churchCountry: "",
    pastorName: "",
    ministryExperience: "",
    callingStatement: "",
    
    reference1Name: "",
    reference1Email: "",
    reference1Phone: "",
    reference1Relation: "",
    reference1Type: "General Reference",
    reference2Name: "",
    reference2Email: "",
    reference2Phone: "",
    reference2Relation: "",
    reference2Type: "General Reference",
    
    declarationNameFirst: "",
    declarationNameLast: "",
    agreeToRules: false
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);

  useEffect(() => {
    api.get(`/programs/${programId}`)
      .then(res => {
        setProgram(res.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        toast.error("Program not found");
        router.push("/#courses");
      });
  }, [programId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleCertificatesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + certificateFiles.length > 5) {
        toast.error("You can upload up to 5 files only");
        return;
      }
      setCertificateFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeCertificate = (index: number) => {
    setCertificateFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToRules) {
      toast.error("You must agree to the declaration");
      return;
    }
    if (!photoFile) {
      toast.error("Passport size photo is required");
      return;
    }
    if (certificateFiles.length === 0) {
      toast.error("Please upload at least one certificate/mark sheet");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      submitData.append("photo", photoFile);
      certificateFiles.forEach(file => {
        submitData.append("certificates", file);
      });

      // Append text fields
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, " ").trim();
      submitData.append("fullName", fullName);
      submitData.append("dob", formData.dob);
      submitData.append("gender", formData.gender);
      submitData.append("maritalStatus", formData.maritalStatus);
      submitData.append("nationality", formData.nationality);
      if (formData.aadhaarNumber) submitData.append("aadhaarNumber", formData.aadhaarNumber);
      submitData.append("mobileNumber", `${formData.mobileCode} ${formData.mobileNumber}`);
      submitData.append("whatsappNumber", `${formData.whatsappCode} ${formData.whatsappNumber}`);
      submitData.append("email", formData.email);
      
      submitData.append("permanentAddressLine1", formData.permanentAddressLine1);
      submitData.append("permanentAddressLine2", formData.permanentAddressLine2);
      submitData.append("permanentCity", formData.permanentCity);
      submitData.append("permanentState", formData.permanentState);
      submitData.append("permanentPostalCode", formData.permanentPostalCode);
      submitData.append("permanentCountry", formData.permanentCountry);
      
      submitData.append("currentAddressLine1", formData.currentAddressLine1);
      submitData.append("currentAddressLine2", formData.currentAddressLine2);
      submitData.append("currentCity", formData.currentCity);
      submitData.append("currentState", formData.currentState);
      submitData.append("currentPostalCode", formData.currentPostalCode);
      submitData.append("currentCountry", formData.currentCountry);
      
      submitData.append("highestQualification", formData.highestQualification);
      submitData.append("previousInstitution", formData.previousInstitution);
      submitData.append("yearOfCompletion", formData.yearOfCompletion);
      submitData.append("marksOrGrade", formData.marksOrGrade);
      
      submitData.append("isBornAgain", formData.isBornAgain === "yes" ? "true" : "false");
      submitData.append("churchName", formData.churchName);
      submitData.append("churchAddressLine1", formData.churchAddressLine1);
      submitData.append("churchAddressLine2", formData.churchAddressLine2);
      submitData.append("churchCity", formData.churchCity);
      submitData.append("churchState", formData.churchState);
      submitData.append("churchPostalCode", formData.churchPostalCode);
      submitData.append("churchCountry", formData.churchCountry);
      submitData.append("pastorName", formData.pastorName);
      if (formData.ministryExperience) submitData.append("ministryExperience", formData.ministryExperience);
      submitData.append("callingStatement", formData.callingStatement);
      
      submitData.append("reference1Name", formData.reference1Name);
      submitData.append("reference1Email", formData.reference1Email);
      submitData.append("reference1Phone", formData.reference1Phone);
      submitData.append("reference1Relation", formData.reference1Relation);
      submitData.append("reference1Type", formData.reference1Type);
      
      submitData.append("reference2Name", formData.reference2Name);
      submitData.append("reference2Email", formData.reference2Email);
      submitData.append("reference2Phone", formData.reference2Phone);
      submitData.append("reference2Relation", formData.reference2Relation);
      submitData.append("reference2Type", formData.reference2Type);
      
      submitData.append("declarationName", `${formData.declarationNameFirst} ${formData.declarationNameLast}`);

      await api.post(`/programs/${programId}/apply`, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  if (isSubmitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
        <div style={{ background: "white", padding: "4rem", borderRadius: "12px", textAlign: "center", maxWidth: "600px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <CheckCircle size={64} color="var(--accent-green)" style={{ margin: "0 auto 2rem" }} />
          <h1 style={{ fontSize: "32px", fontFamily: "var(--font-dm-serif)", marginBottom: "1rem" }}>Application Sent for Review</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1.6, marginBottom: "2rem" }}>
            Thank you for applying to the <strong>{program?.title}</strong> program. 
            We have received your application and it is currently under review by our admissions team. 
            You will receive an email once a decision has been made.
          </p>
          <button onClick={() => router.push("/#courses")} className="btn-primary">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const selectStyle = { width: "100%", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", background: "#FFFFFF", fontSize: "15px", outline: "none", transition: "all 0.2s", cursor: "pointer" };
  const labelStyle = { display: "block", marginBottom: "0.6rem", fontSize: "13px", fontWeight: 700, color: "var(--navy-deep)", textTransform: "uppercase", letterSpacing: "0.5px" };

  return (
    <div style={{ background: "linear-gradient(135deg, var(--cream-bg), var(--cream-light))", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        nav {
            position: absolute; top: 0; left: 0; width: 100%; height: 80px;
            background: rgba(250, 250, 247, 0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(220, 224, 213, 0.6); z-index: 1000;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 5%; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-brand { display: flex; align-items: center; gap: 1rem; cursor: pointer; }
        .nav-logo-text { 
            font-family: var(--font-cinzel), 'Cinzel', Georgia, serif !important;
            font-size: 21px; font-weight: 700; letter-spacing: 3px;
            color: var(--text-main); text-transform: uppercase; line-height: 1;
        }
        .nav-logo-text .logo-cway { color: var(--text-main); }
        .nav-logo-text .logo-academy { color: var(--gold-primary); font-weight: 400; letter-spacing: 4px; }
        
        .nav-links { display: flex; gap: 2.5rem; align-items: center; }
        .nav-links a {
            font-family: var(--font-plus-jakarta), sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
            color: var(--color-cway-forest); position: relative; padding: 0.5rem 0; text-decoration: none;
            transition: all 0.35s ease;
        }
        .nav-links a:hover { color: var(--color-cway-forest); }
        .nav-links a::after {
            content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px;
            background: var(--color-cway-forest); transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-links a:hover::after, .nav-links a.nav-active::after { width: 100%; }
        .nav-links a.nav-active { color: var(--color-cway-forest); }

        .btn-primary {
            background: var(--color-cway-forest); color: #FFFFFF; border: 2px solid var(--color-cway-forest);
            font-family: var(--font-plus-jakarta), sans-serif; font-weight: 700; font-size: 13px; padding: 15px 36px; border-radius: 50px;
            display: inline-block; text-align: center; box-shadow: var(--shadow-md);
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 1.5px; text-transform: uppercase;
            text-decoration: none;
        }
        .btn-primary:hover { background: transparent; color: var(--color-cway-forest); box-shadow: none; transform: translateY(-3px); }
        .nav-actions { display: flex; gap: 1rem; align-items: center; }
      ` }} />

      {/* Header Navigation */}
      <nav>
        <div className="nav-brand" onClick={() => router.push("/")}>
          <img 
            src="/logo.png?v=3" 
            alt="CWAY Academy Logo" 
            style={{ width: "48px", height: "48px", objectFit: "contain", flexShrink: 0 }}
          />
          <div className="nav-logo-text"><span className="logo-cway">CWAY</span><span className="logo-academy"> ACADEMY</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div className="nav-links">
            <Link href="/#home" className="nav-active">Home</Link>
            <Link href="/#about">About</Link>
            <Link href="/#courses">Courses</Link>
            <Link href="/#involved">Get Involved</Link>
            <Link href="/#blog">Blog</Link>
            <Link href="/#contact">Contact</Link>
          </div>
          
          <div className="nav-actions">
            <Link href="/login" className="btn-primary" style={{ padding: "10px 24px", fontSize: "11px" }}>Login</Link>
          </div>
        </div>
      </nav>

      <div style={{ padding: "8rem 2rem 5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
        
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, var(--navy-deep), var(--navy-mid))", padding: "4rem 3rem", color: "white", textAlign: "center" }}>
          <img src="/logo.png?v=3" alt="CWAY Academy" style={{ width: "72px", height: "72px", objectFit: "contain", margin: "0 auto 1.5rem", display: "block" }} />
          <h1 style={{ fontSize: "40px", fontFamily: "var(--font-dm-serif)", marginBottom: "1rem", letterSpacing: "1px", color: "#FFFFFF" }}>PROGRAM APPLICATION</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>Step into your calling with Christ-centered theological training designed for life and ministry.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "4rem" }}>
          
          {/* Section 1: Program details */}
          <div style={{ marginBottom: "3.5rem" }}>
            <h3 style={{ fontSize: "24px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Program Information</h3>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Select Program *</label>
                <input type="text" value={program?.title || ""} disabled style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.6)", background: "var(--cream-light)", color: "var(--text-muted)", fontSize: "15px", outline: "none" }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={labelStyle}>Medium of Study *</label>
                <select name="mediumOfStudy" value={formData.mediumOfStudy} onChange={handleChange} required style={selectStyle}>
                  <option value="English">English</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div style={{ marginBottom: "3.5rem" }}>
            <h3 style={{ fontSize: "24px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Personal Details</h3>
            
            <label style={labelStyle}>Full Name *</label>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="" placeholder="First Name" name="firstName" required  value={(formData as any)["firstName"]} onChange={handleChange} />
              <InputField label="" placeholder="Middle Name" name="middleName"  value={(formData as any)["middleName"]} onChange={handleChange} />
              <InputField label="" placeholder="Last Name" name="lastName" required  value={(formData as any)["lastName"]} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="Date of Birth" name="dob" type="date" required  value={(formData as any)["dob"]} onChange={handleChange} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={labelStyle}>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required style={selectStyle}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={labelStyle}>Marital Status *</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required style={selectStyle}>
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>
              <InputField label="Nationality" name="nationality" required  value={(formData as any)["nationality"]} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
              <InputField label="Aadhaar Number (optional)" name="aadhaarNumber"  value={(formData as any)["aadhaarNumber"]} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Passport Size Photo upload *</label>
              <div style={{ border: "2px dashed rgba(220, 224, 213, 1)", borderRadius: "16px", padding: "3rem", textAlign: "center", background: "var(--cream-light)", transition: "background 0.2s" }}
                   onMouseOver={(e) => e.currentTarget.style.background = "#fff"}
                   onMouseOut={(e) => e.currentTarget.style.background = "var(--cream-light)"}>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} id="photo-upload" />
                <label htmlFor="photo-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Camera size={32} color="var(--gold-dark)" />
                  </div>
                  <span style={{ color: "var(--navy-deep)", fontWeight: 600 }}>{photoFile ? photoFile.name : "Click to Upload Passport Photo"}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>JPEG, PNG, max 5MB</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Contact */}
          <div style={{ marginBottom: "3.5rem" }}>
            <h3 style={{ fontSize: "24px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Contact Details</h3>
            
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="Email Address" name="email" type="email" required  value={(formData as any)["email"]} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Mobile Number *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="text" name="mobileCode" value={formData.mobileCode} onChange={handleChange} style={{ width: "80px", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", outline: "none", fontSize: "15px" }} />
                  <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required style={{ flex: 1, padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", outline: "none", fontSize: "15px" }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>WhatsApp Number *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="text" name="whatsappCode" value={formData.whatsappCode} onChange={handleChange} style={{ width: "80px", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", outline: "none", fontSize: "15px" }} />
                  <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required style={{ flex: 1, padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", outline: "none", fontSize: "15px" }} />
                </div>
              </div>
            </div>

            <label style={labelStyle}>Permanent Address *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
              <InputField label="" placeholder="Address Line 1" name="permanentAddressLine1" required  value={(formData as any)["permanentAddressLine1"]} onChange={handleChange} />
              <InputField label="" placeholder="Address Line 2" name="permanentAddressLine2"  value={(formData as any)["permanentAddressLine2"]} onChange={handleChange} />
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <InputField label="" placeholder="City" name="permanentCity" required  value={(formData as any)["permanentCity"]} onChange={handleChange} />
                <InputField label="" placeholder="State / Province" name="permanentState" required  value={(formData as any)["permanentState"]} onChange={handleChange} />
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <InputField label="" placeholder="Postal Code" name="permanentPostalCode" required  value={(formData as any)["permanentPostalCode"]} onChange={handleChange} />
                <InputField label="" placeholder="Country" name="permanentCountry" required  value={(formData as any)["permanentCountry"]} onChange={handleChange} />
              </div>
            </div>

            <label style={labelStyle}>Current Address *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <InputField label="" placeholder="Address Line 1" name="currentAddressLine1" required  value={(formData as any)["currentAddressLine1"]} onChange={handleChange} />
              <InputField label="" placeholder="Address Line 2" name="currentAddressLine2"  value={(formData as any)["currentAddressLine2"]} onChange={handleChange} />
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <InputField label="" placeholder="City" name="currentCity" required  value={(formData as any)["currentCity"]} onChange={handleChange} />
                <InputField label="" placeholder="State / Province" name="currentState" required  value={(formData as any)["currentState"]} onChange={handleChange} />
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <InputField label="" placeholder="Postal Code" name="currentPostalCode" required  value={(formData as any)["currentPostalCode"]} onChange={handleChange} />
                <InputField label="" placeholder="Country" name="currentCountry" required  value={(formData as any)["currentCountry"]} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 4: Education */}
          <div style={{ marginBottom: "3.5rem" }}>
            <h3 style={{ fontSize: "24px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Educational Background</h3>
            
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={labelStyle}>Highest Qualification *</label>
                <select name="highestQualification" value={formData.highestQualification} onChange={handleChange} required style={selectStyle}>
                  <option value="">Select Qualification</option>
                  <option value="SSLC / 10th">SSLC / 10th</option>
                  <option value="12th / PUC">12th / PUC</option>
                  <option value="Bachelors">Bachelors Degree</option>
                  <option value="Masters">Masters Degree</option>
                  <option value="Theology Degree">Theology Degree</option>
                </select>
              </div>
              <InputField label="Previous Institution Name" name="previousInstitution" required  value={(formData as any)["previousInstitution"]} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
              <InputField label="Year of Completion" name="yearOfCompletion" type="number" required  value={(formData as any)["yearOfCompletion"]} onChange={handleChange} />
              <InputField label="Marks / Grade (Percentage / CGPA)" name="marksOrGrade" required  value={(formData as any)["marksOrGrade"]} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Upload Certificates (Max 5) *</label>
              <div style={{ border: "2px dashed rgba(220, 224, 213, 1)", borderRadius: "16px", padding: "3rem", textAlign: "center", background: "var(--cream-light)", transition: "background 0.2s" }}
                   onMouseOver={(e) => e.currentTarget.style.background = "#fff"}
                   onMouseOut={(e) => e.currentTarget.style.background = "var(--cream-light)"}>
                <input type="file" multiple accept=".pdf,image/*" onChange={handleCertificatesUpload} style={{ display: "none" }} id="cert-upload" />
                <label htmlFor="cert-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Upload size={32} color="var(--gold-dark)" />
                  </div>
                  <span style={{ color: "var(--navy-deep)", fontWeight: 600 }}>Click to Upload Documents</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "300px" }}>Please upload all your academic documents, including mark sheets and certificates.</span>
                </label>
              </div>
              {certificateFiles.length > 0 && (
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {certificateFiles.map((file, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(184,134,69,0.05)", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(184,134,69,0.2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--navy-deep)", fontWeight: 600 }}><FileText size={18} color="var(--gold-dark)" /> <span>{file.name}</span></div>
                      <button type="button" onClick={() => removeCertificate(i)} style={{ color: "var(--danger, red)", background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Church & Ministry */}
          <div style={{ marginBottom: "3.5rem" }}>
            <h3 style={{ fontSize: "24px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>Church & Ministry</h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Are you a born-again believer? *</label>
              <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, color: "var(--navy-deep)" }}><input type="radio" name="isBornAgain" value="yes" checked={formData.isBornAgain === "yes"} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: "var(--gold-dark)" }} /> Yes</label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, color: "var(--navy-deep)" }}><input type="radio" name="isBornAgain" value="no" checked={formData.isBornAgain === "no"} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: "var(--gold-dark)" }} /> No</label>
              </div>
            </div>

            <InputField label="Church Name" name="churchName" required  value={(formData as any)["churchName"]} onChange={handleChange} />
            
            <div style={{ margin: "2rem 0" }}>
              <label style={labelStyle}>Church Address *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <InputField label="" placeholder="Address Line 1" name="churchAddressLine1" required  value={(formData as any)["churchAddressLine1"]} onChange={handleChange} />
                <InputField label="" placeholder="Address Line 2" name="churchAddressLine2"  value={(formData as any)["churchAddressLine2"]} onChange={handleChange} />
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <InputField label="" placeholder="City" name="churchCity" required  value={(formData as any)["churchCity"]} onChange={handleChange} />
                  <InputField label="" placeholder="State / Province" name="churchState" required  value={(formData as any)["churchState"]} onChange={handleChange} />
                </div>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <InputField label="" placeholder="Postal Code" name="churchPostalCode" required  value={(formData as any)["churchPostalCode"]} onChange={handleChange} />
                  <InputField label="" placeholder="Country" name="churchCountry" required  value={(formData as any)["churchCountry"]} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="Pastor's Name" name="pastorName" required  value={(formData as any)["pastorName"]} onChange={handleChange} />
              <InputField label="Ministry Experience (if any)" name="ministryExperience"  value={(formData as any)["ministryExperience"]} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Calling / Purpose Statement *</label>
              <textarea name="callingStatement" data-lenis-prevent="true" value={formData.callingStatement} onChange={handleChange} required rows={4} style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", background: "#FFFFFF", fontSize: "15px", outline: "none", transition: "all 0.2s", resize: "vertical", overflowY: "auto" }} onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold-dark)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,69,0.15)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(220, 224, 213, 0.8)"; e.currentTarget.style.boxShadow = "none"; }} placeholder="Briefly describe your calling and purpose..." />
            </div>
          </div>

          {/* Section 6: References */}
          <div style={{ marginBottom: "3.5rem" }}>
            <h3 style={{ fontSize: "24px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", borderBottom: "1px solid rgba(220, 224, 213, 0.6)", paddingBottom: "1rem", marginBottom: "2rem" }}>References</h3>
            
            <h4 style={{ fontSize: "16px", marginBottom: "1rem", color: "var(--navy-deep)" }}>Reference 1</h4>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Reference Type *</label>
                <select name="reference1Type" value={formData.reference1Type} onChange={handleChange} required style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", background: "#FFFFFF", fontSize: "15px", outline: "none", transition: "all 0.2s", appearance: "none" }}>
                  <option value="General Reference">General Reference</option>
                  <option value="Pastor's Recommendation">Pastor's Recommendation</option>
                </select>
              </div>
              <InputField label="Relation" placeholder="e.g. Pastor, Mentor, Friend" name="reference1Relation" required  value={(formData as any)["reference1Relation"]} onChange={handleChange} />
            </div>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
              <InputField label="Full Name" placeholder="Full Name" name="reference1Name" required  value={(formData as any)["reference1Name"]} onChange={handleChange} />
              <InputField label="Email Address" placeholder="Email Address" name="reference1Email"  value={(formData as any)["reference1Email"]} onChange={handleChange} />
              <InputField label="Phone Number" placeholder="Phone Number" name="reference1Phone" required  value={(formData as any)["reference1Phone"]} onChange={handleChange} />
            </div>

            <h4 style={{ fontSize: "16px", marginBottom: "1rem", color: "var(--navy-deep)" }}>Reference 2</h4>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Reference Type *</label>
                <select name="reference2Type" value={formData.reference2Type} onChange={handleChange} required style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(220, 224, 213, 0.8)", background: "#FFFFFF", fontSize: "15px", outline: "none", transition: "all 0.2s", appearance: "none" }}>
                  <option value="General Reference">General Reference</option>
                  <option value="Pastor's Recommendation">Pastor's Recommendation</option>
                </select>
              </div>
              <InputField label="Relation" placeholder="Relation" name="reference2Relation" required  value={(formData as any)["reference2Relation"]} onChange={handleChange} />
            </div>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <InputField label="Full Name" placeholder="Full Name" name="reference2Name" required  value={(formData as any)["reference2Name"]} onChange={handleChange} />
              <InputField label="Email Address" placeholder="Email Address" name="reference2Email"  value={(formData as any)["reference2Email"]} onChange={handleChange} />
              <InputField label="Phone Number" placeholder="Phone Number" name="reference2Phone" required  value={(formData as any)["reference2Phone"]} onChange={handleChange} />
            </div>
          </div>

          {/* Section 7: Declaration */}
          <div style={{ marginBottom: "3rem", padding: "2.5rem", background: "rgba(184,134,69,0.05)", borderLeft: "4px solid var(--gold-dark)", borderRadius: "0 16px 16px 0" }}>
            <h3 style={{ fontSize: "22px", fontFamily: "var(--font-dm-serif), serif", color: "var(--navy-deep)", marginBottom: "1.5rem" }}>Declaration *</h3>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: "2rem" }}>
              I hereby declare that the information provided in this application is true and accurate to the best of my knowledge. I agree to abide by the rules, regulations, and academic requirements of the Academy.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
              <InputField label="" placeholder="First Name (Signature)" name="declarationNameFirst" required  value={(formData as any)["declarationNameFirst"]} onChange={handleChange} />
              <InputField label="" placeholder="Last Name (Signature)" name="declarationNameLast" required  value={(formData as any)["declarationNameLast"]} onChange={handleChange} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", fontWeight: 700, color: "var(--navy-deep)" }}>
              <input type="checkbox" name="agreeToRules" checked={formData.agreeToRules} onChange={handleChange} style={{ width: "24px", height: "24px", accentColor: "var(--gold-dark)", cursor: "pointer" }} />
              I agree to the declaration above
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: "100%", padding: "1.25rem", fontSize: "18px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", letterSpacing: "1px" }}>
            {isSubmitting ? "SUBMITTING APPLICATION..." : "SUBMIT APPLICATION"}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
