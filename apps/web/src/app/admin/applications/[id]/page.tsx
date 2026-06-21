"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { toast } from "react-hot-toast";
import { Download, Check, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ApplicationDetailsPage() {
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
      router.push("/admin/applications");
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

  if (isLoading) return <div className="p-8">Loading application details...</div>;
  if (!app) return <div className="p-8">Application not found.</div>;

  const permanentAddress = app.permanentAddress ? JSON.parse(app.permanentAddress) : {};
  const currentAddress = app.currentAddress ? JSON.parse(app.currentAddress) : {};
  const churchAddress = app.churchAddress ? JSON.parse(app.churchAddress) : {};
  const certificates = app.certificatesUrls ? JSON.parse(app.certificatesUrls) : [];

  return (
    <div className="p-8">
      {/* Hide this header when printing */}
      <div className="print:hidden flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/applications" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-sm text-gray-500">Review {app.fullName}'s application for {app.program?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <Download size={16} /> Download PDF
          </button>
          
          {app.status === "PENDING" && (
            <>
              <button 
                onClick={handleReject} 
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 disabled:opacity-50"
              >
                <X size={16} /> Reject
              </button>
              <button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Check size={16} /> {isProcessing ? "Processing..." : "Approve & Enroll"}
              </button>
            </>
          )}
          
          {app.status !== "PENDING" && (
            <span className={`px-4 py-2 rounded-md font-semibold ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Status: {app.status}
            </span>
          )}
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white rounded-lg shadow-sm border p-8 print:shadow-none print:border-none print:p-0" id="application-document">
        
        {/* Header (Print visible) */}
        <div className="text-center mb-8 pb-8 border-b">
          <h2 className="text-3xl font-serif mb-2">GIOTS ADMISSION APPLICATION</h2>
          <p className="text-gray-600">Program: <strong>{app.program?.title}</strong> | Medium: <strong>{app.mediumOfStudy}</strong></p>
          <p className="text-sm text-gray-500 mt-2">Submitted on {format(new Date(app.createdAt), "MMMM d, yyyy h:mm a")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Photo Column */}
          <div className="md:col-span-1">
            <div className="bg-gray-100 border p-2 rounded-md inline-block">
              <img src={app.passportPhotoUrl} alt="Passport Photo" className="w-48 h-64 object-cover" />
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-3 space-y-8">
            
            {/* Personal Details */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#1C2B1E]">Personal Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div><span className="text-gray-500 block text-sm">Full Name</span><span className="font-medium">{app.fullName}</span></div>
                <div><span className="text-gray-500 block text-sm">Date of Birth</span><span className="font-medium">{format(new Date(app.dob), "MMM d, yyyy")}</span></div>
                <div><span className="text-gray-500 block text-sm">Gender</span><span className="font-medium">{app.gender}</span></div>
                <div><span className="text-gray-500 block text-sm">Marital Status</span><span className="font-medium">{app.maritalStatus}</span></div>
                <div><span className="text-gray-500 block text-sm">Nationality</span><span className="font-medium">{app.nationality}</span></div>
                {app.aadhaarNumber && <div><span className="text-gray-500 block text-sm">Aadhaar Number</span><span className="font-medium">{app.aadhaarNumber}</span></div>}
              </div>
            </section>

            {/* Contact Details */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#1C2B1E]">Contact Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
                <div><span className="text-gray-500 block text-sm">Email Address</span><span className="font-medium">{app.email}</span></div>
                <div><span className="text-gray-500 block text-sm">Mobile Number</span><span className="font-medium">{app.mobileNumber}</span></div>
                <div><span className="text-gray-500 block text-sm">WhatsApp Number</span><span className="font-medium">{app.whatsappNumber}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <span className="text-gray-500 block text-sm">Permanent Address</span>
                  <div className="font-medium mt-1">
                    {permanentAddress.line1}<br/>
                    {permanentAddress.line2 && <>{permanentAddress.line2}<br/></>}
                    {permanentAddress.city}, {permanentAddress.state} {permanentAddress.postalCode}<br/>
                    {permanentAddress.country}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block text-sm">Current Address</span>
                  <div className="font-medium mt-1">
                    {currentAddress.line1}<br/>
                    {currentAddress.line2 && <>{currentAddress.line2}<br/></>}
                    {currentAddress.city}, {currentState} {currentAddress.postalCode}<br/>
                    {currentAddress.country}
                  </div>
                </div>
              </div>
            </section>

            {/* Educational Background */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#1C2B1E]">Educational Background</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
                <div><span className="text-gray-500 block text-sm">Highest Qualification</span><span className="font-medium">{app.highestQualification}</span></div>
                <div><span className="text-gray-500 block text-sm">Previous Institution</span><span className="font-medium">{app.previousInstitution}</span></div>
                <div><span className="text-gray-500 block text-sm">Year of Completion</span><span className="font-medium">{app.yearOfCompletion}</span></div>
                <div><span className="text-gray-500 block text-sm">Marks / Grade</span><span className="font-medium">{app.marksOrGrade}</span></div>
              </div>
              <div>
                <span className="text-gray-500 block text-sm mb-2">Uploaded Certificates</span>
                <div className="flex flex-wrap gap-4">
                  {certificates.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200 print:border print:border-gray-300">
                      <FileText size={16} /> Certificate {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* Church & Ministry */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#1C2B1E]">Church & Ministry</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
                <div><span className="text-gray-500 block text-sm">Born-again believer?</span><span className="font-medium">{app.isBornAgain ? 'Yes' : 'No'}</span></div>
                <div><span className="text-gray-500 block text-sm">Church Name</span><span className="font-medium">{app.churchName}</span></div>
                <div><span className="text-gray-500 block text-sm">Pastor's Name</span><span className="font-medium">{app.pastorName}</span></div>
                <div><span className="text-gray-500 block text-sm">Ministry Experience</span><span className="font-medium">{app.ministryExperience || "N/A"}</span></div>
              </div>
              <div className="mb-4">
                <span className="text-gray-500 block text-sm">Church Address</span>
                <div className="font-medium mt-1">
                  {churchAddress.line1}, {churchAddress.city}, {churchAddress.state} {churchAddress.postalCode}, {churchAddress.country}
                </div>
              </div>
              <div>
                <span className="text-gray-500 block text-sm">Calling / Purpose Statement</span>
                <p className="font-medium mt-1 italic whitespace-pre-wrap">"{app.callingStatement}"</p>
              </div>
            </section>

            {/* References */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#1C2B1E]">References</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <span className="font-medium block">{app.reference1Name}</span>
                  <span className="text-gray-500 text-sm">{app.reference1Relation} | {app.reference1Phone}</span>
                </div>
                <div>
                  <span className="font-medium block">{app.reference2Name}</span>
                  <span className="text-gray-500 text-sm">{app.reference2Relation} | {app.reference2Phone}</span>
                </div>
              </div>
            </section>

            {/* Declaration */}
            <section className="bg-gray-50 p-6 border-l-4 border-[#C9973A] rounded-r-md">
              <h3 className="text-lg font-bold mb-2 text-[#1C2B1E]">Declaration</h3>
              <p className="text-sm text-gray-700 italic mb-4">
                "I hereby declare that the information provided in this application is true and accurate to the best of my knowledge. I agree to abide by the rules, regulations, and academic requirements of GIOTS."
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-gray-500 block text-xs">Digitally Signed By</span>
                  <span className="font-medium text-lg">{app.declarationName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Date</span>
                  <span className="font-medium">{format(new Date(app.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </section>
            
          </div>
        </div>
      </div>
      
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #application-document, #application-document * {
            visibility: visible;
          }
          #application-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
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
          .print\\:border {
            border-width: 1px !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
        }
      `}} />
    </div>
  );
}
