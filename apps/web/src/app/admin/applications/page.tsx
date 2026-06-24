"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminApplicationsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["adminApplications"],
    queryFn: () => api.get("/admin/applications").then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#8A9E8C" }}>
        Loading applications...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Applications</h1>
          <p className="text-sm text-gray-500" style={{ marginTop: "0.25rem" }}>Review and manage student admissions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: "1000px" }}>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ padding: "16px 24px" }}>Applicant</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ padding: "16px 24px" }}>Program</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ padding: "16px 24px" }}>Applied On</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ padding: "16px 24px" }}>References</th>
                <th scope="col" className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ padding: "16px 24px" }}>Status</th>
                <th scope="col" className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ padding: "16px 24px" }}>Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications?.map((app: any) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap" style={{ padding: "20px 24px" }}>
                    <div className="flex items-center gap-4">
                      <img src={app.passportPhotoUrl} alt="" className="h-12 w-12 rounded-full object-cover shadow-sm border border-gray-100" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{app.fullName}</span>
                        <span className="text-sm text-gray-500">{app.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap" style={{ padding: "20px 24px" }}>
                    <span className="text-sm font-medium text-gray-800">{app.program?.title}</span>
                  </td>
                  <td className="whitespace-nowrap text-sm text-gray-500" style={{ padding: "20px 24px" }}>
                    {format(new Date(app.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="whitespace-nowrap" style={{ padding: "20px 24px" }}>
                    <div className="flex flex-col gap-2">
                      <span className={`text-[11px] font-bold tracking-wide rounded-md inline-flex items-center w-max ${app.reference1Status === 'SUBMITTED' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-gray-50 text-gray-600 border border-gray-200/50'}`} style={{ padding: "6px 12px" }}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${app.reference1Status === 'SUBMITTED' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        REF 1: {app.reference1Status}
                      </span>
                      <span className={`text-[11px] font-bold tracking-wide rounded-md inline-flex items-center w-max ${app.reference2Status === 'SUBMITTED' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-gray-50 text-gray-600 border border-gray-200/50'}`} style={{ padding: "6px 12px" }}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${app.reference2Status === 'SUBMITTED' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        REF 2: {app.reference2Status}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap" style={{ padding: "20px 24px" }}>
                    <span className={`inline-flex text-xs font-bold uppercase tracking-wider rounded-full 
                      ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`} style={{ padding: "6px 16px" }}>
                      {app.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-right text-sm font-medium" style={{ padding: "20px 24px" }}>
                    <Link href={`/admin/applications/${app.id}`} className="inline-flex items-center justify-center bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm" style={{ padding: "8px 20px" }}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
              {(!applications || applications.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="text-gray-400 mb-2">No applications found</div>
                    <p className="text-sm text-gray-500">When students apply, they will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
