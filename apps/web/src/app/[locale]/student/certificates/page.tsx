"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import { THEME } from "@/lib/cway-theme";
import { Award, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function CertificatesPage() {
  const t = useTranslations("student.certificates");
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["studentCertificates"],
    queryFn: () => api.get("/student/certificates/my").then(res => res.data.data),
  });

  const handleDownload = async (id: string, slug: string) => {
    try {
      const res = await api.get(`/student/certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${slug}-certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download", error);
      alert(t("downloadError"));
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${THEME.MUTED}`, borderTopColor: THEME.GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 36, color: THEME.HERO, marginBottom: 8 }}>
          {t("title")}
        </h1>
        <p style={{ color: THEME.MUTED, fontSize: 16 }}>
          {t("subtitle")}
        </p>
      </div>

      {!certificates || certificates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)" }}>
          <Award size={48} color={THEME.MUTED} style={{ opacity: 0.5, margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, color: THEME.HERO, marginBottom: 8 }}>{t("empty.title")}</h3>
          <p style={{ color: THEME.MUTED, maxWidth: 400, margin: "0 auto" }}>
            {t("empty.description")}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {certificates.map((cert: any) => {
            const isProgram = cert.type === 'PROGRAM';
            return (
            <div key={cert.id} style={{ display: "flex", background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ width: 240, background: THEME.MUTED, position: "relative" }}>
                 {!isProgram && cert.course.thumbnail && (
                  <img src={cert.course.thumbnail} alt={cert.course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(28,43,30,0.4)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                   <Award size={48} color={THEME.GOLD} />
                </div>
              </div>
              <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: THEME.HERO, marginBottom: 8 }}>
                  {isProgram ? cert.program?.title : cert.course?.title}
                </h3>
                {!isProgram && (
                  <p style={{ color: THEME.MUTED, fontSize: 14, marginBottom: 4 }}>
                    {t("instructor")} {cert.course?.instructor?.name}
                  </p>
                )}
                <p style={{ color: THEME.MUTED, fontSize: 14 }}>
                  {t("issued", { date: format(new Date(cert.issuedAt), "MMMM d, yyyy") })}
                </p>
              </div>
              <div style={{ padding: 24, display: "flex", alignItems: "center", gap: "12px", borderLeft: "1px solid rgba(0,0,0,0.05)" }}>
                {isProgram && (
                  <Link 
                    href={`/student/programs/${cert.programId}/grade-sheet`}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: THEME.HERO, border: `1px solid ${THEME.HERO}`, padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <FileText size={18} /> {t("gradeSheet")}
                  </Link>
                )}
                <button 
                  onClick={() => handleDownload(cert.id, isProgram ? 'program' : cert.course?.slug || 'course')}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: THEME.GOLD, color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <Download size={18} /> {t("downloadPdf")}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
