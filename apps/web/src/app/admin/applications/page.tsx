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

  if (isLoading) return <div className="p-8">Loading applications...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Applications</h1>
          <p className="text-sm text-gray-500">Review and manage student admissions</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied On</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications?.map((app: any) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img src={app.passportPhotoUrl} alt="" className="h-10 w-10 rounded-full object-cover mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{app.program?.title}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(app.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/applications/${app.id}`} className="text-[#C9973A] hover:text-[#B88636]">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
