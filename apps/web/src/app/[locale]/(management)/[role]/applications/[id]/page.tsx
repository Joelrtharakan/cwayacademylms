"use client";
import React, { useState } from "react";
import { useManagementPath } from "@/hooks/useManagementPath";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "react-hot-toast";
import { Download, Check, X, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("@/components/admin/PdfViewer").then((mod) => mod.PdfViewer),
  { ssr: false }
);

export default function ApplicationDetailsPage() {
  const basePath = useManagementPath();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: app, isLoading } = useQuery({
    queryKey: ["adminApplication", id],
    queryFn: () => api.get(`/admin/applications/${id}`).then(res => res.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/admin/applications/${id}/approve`),
    onSuccess: () => {
      toast.success("Application approved. Student enrolled and email sent.");
      queryClient.invalidateQueries({ queryKey: ["adminApplication", id] });
      router.push(`${basePath}/applications`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve application");
    },
    onSettled: () => setIsProcessing(false)
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.post(`/admin/applications/${id}/reject`),
    onSuccess: () => {
      toast.success("Application rejected.");
      queryClient.invalidateQueries({ queryKey: ["adminApplication", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reject application");
    },
    onSettled: () => setIsProcessing(false)
  });

  const handleApprove = () => {
    if (confirm("Are you sure you want to approve this application? This will create an account, enroll the student, and send them an email.")) {
      setIsProcessing(true);
      approveMutation.mutate();
    }
  };

  const handleReject = () => {
    if (confirm("Are you sure you want to reject this application?")) {
      setIsProcessing(true);
      rejectMutation.mutate();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#8A9E8C" }}>
        Loading application details...
      </div>
    );
  }
  if (!app) return <div className="p-8">Application not found.</div>;

  const permanentAddress = app.permanentAddress ? JSON.parse(app.permanentAddress) : {};
  const currentAddress = app.currentAddress ? JSON.parse(app.currentAddress) : {};
  const churchAddress = app.churchAddress ? JSON.parse(app.churchAddress) : {};
  const certificates = app.certificatesUrls ? JSON.parse(app.certificatesUrls) : [];

  return (
    <div className="p-8">
      {/* Hide this header when printing */}
      <div className="print:hidden flex justify-between items-center" style={{ marginBottom: "48px" }}>
        <div className="flex items-center gap-4">
          <Link href={`${basePath}/applications`} className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-sm text-gray-500">Review {app.fullName}'s application for {app.program?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all" style={{ padding: "10px 24px", borderRadius: "9999px", fontWeight: "600" }}>
            <Download size={18} /> Download PDF
          </button>

          {certificates?.map((url: string, i: number) => 
            url.toLowerCase().includes('.pdf') ? (
              <a 
                key={i} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all" 
                style={{ padding: "10px 24px", borderRadius: "9999px", fontWeight: "600", textDecoration: "none" }}
              >
                <FileText size={18} /> Open PDF {certificates.length > 1 ? i + 1 : ''}
              </a>
            ) : null
          )}
          
          {app.status === "PENDING" && (
            <>
              <button 
                onClick={handleReject} 
                disabled={isProcessing}
                className="flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-all"
                style={{ padding: "10px 24px", borderRadius: "9999px", fontWeight: "600" }}
              >
                <X size={18} /> Reject
              </button>
              <button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm"
                style={{ padding: "10px 24px", borderRadius: "9999px", fontWeight: "600" }}
              >
                <Check size={18} /> {isProcessing ? "Processing..." : "Approve & Enroll"}
              </button>
            </>
          )}
          
          {app.status !== "PENDING" && (
            <span className={`font-bold shadow-sm ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} style={{ padding: "10px 24px", borderRadius: "9999px" }}>
              Status: {app.status}
            </span>
          )}
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 print:w-full print:m-0" style={{ padding: "32px", fontFamily: "var(--font-plus-jakarta), sans-serif" }} id="application-document">
        
        {/* Header (Print visible) */}
        <div className="flex justify-between items-start pb-8 border-b border-gray-200" style={{ marginBottom: "40px" }}>
          {/* Left Spacer for balance (matches photo width) */}
          <div className="w-[100px] hidden sm:block print:block"></div>
          
          {/* Center Content */}
          <div className="flex-1 text-center px-4">
            <img src="/logo.png" alt="CWAY Academy" style={{ height: "64px", margin: "0 auto 12px auto", objectFit: "contain" }} />
            <h2 className="text-xl mb-2 text-gray-900 tracking-wide uppercase leading-tight" style={{ fontFamily: "var(--font-cinzel), Georgia, serif", fontWeight: 700 }}>CWAY Academy Admission Application</h2>
            <p className="text-gray-600 text-sm">Program: <strong className="text-gray-900">{app.program?.title}</strong> <span className="mx-2 text-gray-300">|</span> Medium: <strong className="text-gray-900">{app.mediumOfStudy}</strong></p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Submitted on {format(new Date(app.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
          </div>
          
          {/* Right Passport Photo */}
          <div className="bg-white border border-gray-300 p-1 rounded shadow-sm shrink-0" style={{ width: "100px" }}>
            <img src={app.passportPhotoUrl} alt="Passport" style={{ width: "100%", height: "120px", objectFit: "cover" }} />
          </div>
        </div>

        <div className="space-y-12 max-w-5xl mx-auto">
            
            {/* Personal Details */}
            <section className="break-inside-avoid" style={{ marginBottom: "32px" }}>
              <h3 className="text-lg border-b border-gray-200 pb-2 mb-4 text-[#1A261D] tracking-wide" style={{ fontFamily: "var(--font-cinzel), Georgia, serif", fontWeight: 700 }}>Personal Details</h3>
              <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "24px" }}>
                <div><span className="text-gray-500 block text-xs">Full Name</span><span className="font-medium text-sm">{app.fullName}</span></div>
                <div><span className="text-gray-500 block text-xs">Date of Birth</span><span className="font-medium text-sm">{format(new Date(app.dob), "MMM d, yyyy")}</span></div>
                <div><span className="text-gray-500 block text-xs">Gender</span><span className="font-medium text-sm">{app.gender}</span></div>
                <div><span className="text-gray-500 block text-xs">Marital Status</span><span className="font-medium text-sm">{app.maritalStatus}</span></div>
                <div><span className="text-gray-500 block text-xs">Nationality</span><span className="font-medium text-sm">{app.nationality}</span></div>
                {app.aadhaarNumber && <div><span className="text-gray-500 block text-xs">Aadhaar Number</span><span className="font-medium text-sm">{app.aadhaarNumber}</span></div>}
              </div>
            </section>

            {/* Contact Details */}
            <section className="break-inside-avoid" style={{ marginBottom: "32px" }}>
              <h3 className="text-lg border-b border-gray-200 pb-2 mb-4 text-[#1A261D] tracking-wide" style={{ fontFamily: "var(--font-cinzel), Georgia, serif", fontWeight: 700 }}>Contact Details</h3>
              <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "24px", marginBottom: "24px" }}>
                <div><span className="text-gray-500 block text-xs mb-0.5">Email Address</span><span className="font-medium text-sm text-gray-900">{app.email}</span></div>
                <div><span className="text-gray-500 block text-xs mb-0.5">Mobile Number</span><span className="font-medium text-sm text-gray-900">{app.mobileNumber}</span></div>
                <div><span className="text-gray-500 block text-xs mb-0.5">WhatsApp Number</span><span className="font-medium text-sm text-gray-900">{app.whatsappNumber}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "24px" }}>
                <div>
                  <span className="text-gray-500 block text-xs">Permanent Address</span>
                  <div className="font-medium text-sm mt-0.5">
                    {permanentAddress.line1}<br/>
                    {permanentAddress.line2 && <>{permanentAddress.line2}<br/></>}
                    {permanentAddress.city}, {permanentAddress.state} {permanentAddress.postalCode}<br/>
                    {permanentAddress.country}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Current Address</span>
                  <div className="font-medium text-sm mt-0.5">
                    {currentAddress.line1}<br/>
                    {currentAddress.line2 && <>{currentAddress.line2}<br/></>}
                    {currentAddress.city}, {currentAddress.state} {currentAddress.postalCode}<br/>
                    {currentAddress.country}
                  </div>
                </div>
              </div>
            </section>

            {/* Educational Background */}
            <section className="break-inside-avoid" style={{ marginBottom: "32px" }}>
              <h3 className="text-lg border-b border-gray-200 pb-2 mb-4 text-[#1A261D] tracking-wide" style={{ fontFamily: "var(--font-cinzel), Georgia, serif", fontWeight: 700 }}>Educational Background</h3>
              <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "24px", marginBottom: "16px" }}>
                <div><span className="text-gray-500 block text-xs mb-0.5">Highest Qualification</span><span className="font-medium text-sm text-gray-900">{app.highestQualification}</span></div>
                <div><span className="text-gray-500 block text-xs mb-0.5">Previous Institution</span><span className="font-medium text-sm text-gray-900">{app.previousInstitution}</span></div>
                <div><span className="text-gray-500 block text-xs">Year of Completion</span><span className="font-medium text-sm">{app.yearOfCompletion}</span></div>
                <div><span className="text-gray-500 block text-xs">Marks / Grade</span><span className="font-medium text-sm">{app.marksOrGrade}</span></div>
              </div>
            </section>

            {/* Church & Ministry */}
            <section className="break-inside-avoid" style={{ marginBottom: "32px" }}>
              <h3 className="text-lg border-b border-gray-200 pb-2 mb-4 text-[#1A261D] tracking-wide" style={{ fontFamily: "var(--font-cinzel), Georgia, serif", fontWeight: 700 }}>Church & Ministry</h3>
              <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "24px", marginBottom: "24px" }}>
                <div><span className="text-gray-500 block text-xs mb-0.5">Born-again believer?</span><span className="font-medium text-sm text-gray-900">{app.isBornAgain ? 'Yes' : 'No'}</span></div>
                <div><span className="text-gray-500 block text-xs mb-0.5">Church Name</span><span className="font-medium text-sm text-gray-900">{app.churchName}</span></div>
                <div><span className="text-gray-500 block text-xs mb-0.5">Pastor's Name</span><span className="font-medium text-sm text-gray-900">{app.pastorName}</span></div>
                <div><span className="text-gray-500 block text-xs mb-0.5">Ministry Experience</span><span className="font-medium text-sm text-gray-900">{app.ministryExperience || "N/A"}</span></div>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <span className="text-gray-500 block text-xs">Church Address</span>
                <div className="font-medium text-sm mt-0.5">
                  {churchAddress.line1}, {churchAddress.city}, {churchAddress.state} {churchAddress.postalCode}, {churchAddress.country}
                </div>
              </div>
              <div className="break-inside-avoid">
                <span className="text-gray-500 block text-xs mb-0.5">Calling / Purpose Statement</span>
                <p className="font-medium text-sm mt-1 italic whitespace-pre-wrap text-gray-800 leading-relaxed">"{app.callingStatement}"</p>
              </div>
            </section>

            {/* References Overview */}
            <section className="break-inside-avoid" style={{ marginBottom: "32px" }}>
              <h3 className="text-lg border-b border-gray-200 pb-2 mb-4 text-[#1A261D] tracking-wide" style={{ fontFamily: "var(--font-cinzel), Georgia, serif", fontWeight: 700 }}>References</h3>
              <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "24px" }}>
                <div>
                  <span className="font-medium block text-sm">{app.reference1Name}</span>
                  <span className="text-gray-500 text-xs">{app.reference1Relation} | {app.reference1Phone}</span>
                  <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full inline-block w-max ${app.reference1Status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Status: {app.reference1Status}</span>
                </div>
                <div>
                  <span className="font-medium block text-sm">{app.reference2Name}</span>
                  <span className="text-gray-500 text-xs">{app.reference2Relation} | {app.reference2Phone}</span>
                  <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full inline-block w-max ${app.reference2Status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Status: {app.reference2Status}</span>
                </div>
              </div>
            </section>

            {/* Render Detailed Submitted Reference Forms */}
            {app.referenceForms && app.referenceForms.map((refForm: any, idx: number) => {
              const ratings = refForm.ratings ? JSON.parse(refForm.ratings) : {};
              return (
                <section key={refForm.id} className="mt-6 pt-6 border-t border-gray-200 break-inside-avoid print:mt-6 print:pt-6" style={{ marginBottom: "16px" }}>
                  <h3 className="text-2xl font-bold text-center text-[#1A261D] uppercase" style={{ marginBottom: "24px", fontFamily: "var(--font-cinzel), Georgia, serif", letterSpacing: "0.05em" }}>
                    {refForm.type === 'PASTOR' ? "Pastor's Recommendation Form" : "General Reference Form"}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "12px", marginBottom: "16px" }}>
                    <div><span className="text-gray-500 block text-[10px] mb-0.5">Referee Name</span><span className="font-medium text-xs text-gray-900">{refForm.refereeName}</span></div>
                    <div><span className="text-gray-500 block text-[10px] mb-0.5">Position / Title</span><span className="font-medium text-xs text-gray-900">{refForm.refereePosition}</span></div>
                    {refForm.type === 'PASTOR' && (
                      <>
                        <div><span className="text-gray-500 block text-[10px] mb-0.5">Church Name</span><span className="font-medium text-xs text-gray-900">{refForm.churchName}</span></div>
                        <div><span className="text-gray-500 block text-[10px] mb-0.5">Denomination</span><span className="font-medium text-xs text-gray-900">{refForm.denomination}</span></div>
                      </>
                    )}
                    <div><span className="text-gray-500 block text-[10px] mb-0.5">Contact</span><span className="font-medium text-xs text-gray-900">{refForm.email} | {refForm.phone}</span></div>
                    <div><span className="text-gray-500 block text-[10px] mb-0.5">Known Applicant For</span><span className="font-medium text-xs text-gray-900">{refForm.yearsKnown} as {refForm.capacityKnown}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8" style={{ rowGap: "12px", marginBottom: "16px" }}>
                    <div><span className="text-gray-500 block text-[10px] mb-0.5">Church Engagement</span><span className="font-medium text-xs text-gray-900">{refForm.churchEngagement}</span></div>
                    <div><span className="text-gray-500 block text-[10px] mb-0.5">Spiritual Influence</span><span className="font-medium text-xs text-gray-900">{refForm.spiritualInfluence}</span></div>
                    <div><span className="text-gray-500 block text-[10px] mb-0.5">Financial Ability</span><span className="font-medium text-xs text-gray-900">{refForm.financialAbility}</span></div>
                    {refForm.type === 'PASTOR' && (
                      <div><span className="text-gray-500 block text-[10px] mb-0.5">Church Financial Help</span><span className="font-medium text-xs text-gray-900">{refForm.financialHelp || 'N/A'}</span></div>
                    )}
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <span className="text-gray-500 block text-[10px] mb-1">Evaluation Ratings</span>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-[11px] bg-gray-50 rounded-lg" style={{ padding: "12px 16px" }}>
                      {Object.entries(ratings).map(([area, rating]) => (
                        <div key={area} className="flex justify-between border-b border-gray-200 pb-1 pt-1">
                          <span className="text-gray-600">{area}</span>
                          <span className="font-medium text-gray-900">{String(rating)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <span className="text-gray-500 block text-[10px] mb-0.5">General Comments</span>
                      <p className="font-medium italic whitespace-pre-wrap text-[11px] text-gray-800 leading-snug">"{refForm.comments}"</p>
                    </div>
                    {refForm.attentionAreas && (
                      <div>
                        <span className="text-gray-500 block text-[10px] mb-0.5">Areas Needing Attention</span>
                        <p className="font-medium italic whitespace-pre-wrap text-[11px] text-gray-800 leading-snug">"{refForm.attentionAreas}"</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#fdf8ef] rounded-lg flex justify-between items-center border border-[#C9973A]/30" style={{ marginBottom: "16px", padding: "12px 16px" }}>
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">Overall Recommendation</span>
                      <span className="font-bold text-base text-[#1C2B1E]">{refForm.recommendation}</span>
                    </div>
                    {refForm.discussFurther && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">Requested Phone Discussion</span>
                    )}
                  </div>

                  <div className="flex justify-between items-end" style={{ marginTop: "16px" }}>
                    <div>
                      <span className="text-gray-500 block text-[9px] mb-0.5">Electronically Signed By</span>
                      <span className="font-medium text-lg" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>{refForm.signatureUrl}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[9px] mb-0.5">Date Submitted</span>
                      <span className="font-medium text-xs">{format(new Date(refForm.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </section>
              );
            })}

            {/* Declaration */}
            <section className="bg-gray-50 border-l-4 border-[#C9973A] rounded-r-md print:break-inside-avoid" style={{ marginBottom: "16px", padding: "16px 20px", marginTop: "8px" }}>
              <h3 className="text-base font-bold text-[#1C2B1E]" style={{ marginBottom: "6px" }}>Declaration</h3>
              <p className="text-gray-700 italic text-[11px] leading-snug" style={{ marginBottom: "12px" }}>
                "I hereby declare that the information provided in this application is true and accurate to the best of my knowledge. I agree to abide by the rules, regulations, and academic requirements of CWAY Academy."
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-gray-500 block text-[9px]" style={{ marginBottom: "2px" }}>Digitally Signed By</span>
                  <span className="font-medium text-sm">{app.declarationName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px]" style={{ marginBottom: "2px" }}>Date</span>
                  <span className="font-medium text-[11px]">{format(new Date(app.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </section>

            {/* Attached Documents */}
            {certificates && certificates.length > 0 && (
              <section className="mt-12 pt-12 border-t border-gray-200 print:mt-4 print:pt-4 print:border-none print:break-before-page">
                <h3 className="text-2xl font-bold text-center text-[#1A261D] print:break-after-avoid print:mb-4" style={{ marginBottom: "32px", fontFamily: "var(--font-cinzel), Georgia, serif", letterSpacing: "0.05em" }}>
                  ATTACHED DOCUMENTS
                </h3>
                <div className="flex flex-col gap-8 print:gap-4">
                  {certificates.map((url: string, i: number) => {
                    const isPdf = url.toLowerCase().includes('.pdf');
                    return (
                      <div key={i} className="flex flex-col items-center print:break-inside-avoid print:mb-2 mb-6">
                        <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-semibold print:hidden">Document {i + 1}</p>
                        {isPdf ? (
                          <PdfViewer url={url} />
                        ) : (
                          <img 
                            src={url} 
                            alt={`Attached Document ${i + 1}`} 
                            className="max-w-full h-auto border border-gray-300 rounded-lg shadow-sm print:max-h-[800px]"
                            style={{ maxHeight: "600px", objectFit: "contain" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
        </div>
      </div>
      
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 15mm 12mm;
            size: portrait;
          }
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:m-0 {
            margin: 0 !important;
          }
          .print\\:w-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          .react-pdf__Page__canvas {
            max-width: 100% !important;
            max-height: 20.5cm !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
          }
          .react-pdf__Page {
            margin: 0 !important;
            padding: 0 !important;
          }
          #application-document {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Prevent unnecessary empty trailing pages */
          #application-document section:last-child,
          #application-document div:last-child,
          #application-document *:last-child {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}} />
    </div>
  );
}
