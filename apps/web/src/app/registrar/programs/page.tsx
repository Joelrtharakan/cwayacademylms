"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPrograms, createProgram } from "@/lib/api/registrar";
import { toast } from "sonner";
import { Plus, BookOpen, Clock, ChevronRight, Layers, Search } from "lucide-react";
import Link from "next/link";
import { CreateProgramModal } from "@/components/registrar/lms/CreateProgramModal";
import { SkeletonCard } from "@/components/shared/SkeletonLoader";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PUBLISHED: { bg: "rgba(74,140,92,0.12)", color: "#4A8C5C" },
    DRAFT: { bg: "rgba(138,158,140,0.15)", color: "#8A9E8C" },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 999, padding: "2px 10px", fontSize: 11,
      fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {status}
    </span>
  );
}

function ProgramCard({ program }: { program: any }) {
  const courseCount = program._count?.courses || program.courses?.length || 0;
  const publishedCount = program.courses?.filter((c: any) => c.status === "PUBLISHED").length || 0;

  return (
    <Link
      href={`/registrar/programs/${program.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #E8EAE4",
          boxShadow: "0 1px 4px rgba(28,43,30,0.04)",
          overflow: "hidden",
          transition: "box-shadow 0.2s, transform 0.2s",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(28,43,30,0.10)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,43,30,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Thumbnail strip */}
        <div style={{
          height: 6,
          background: "linear-gradient(90deg, #C9973A, #E8B85A)",
        }} />

        <div style={{ padding: "22px 22px 20px" }}>
          {/* Icon + status */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(201,151,58,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C9973A",
            }}>
              <Layers size={20} />
            </div>
            <StatusBadge status={program.status} />
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: "Georgia, serif",
            fontSize: 17,
            fontWeight: 700,
            color: "#1C2B1E",
            margin: "0 0 6px 0",
            lineHeight: 1.3,
          }}>
            {program.title}
          </h3>
          {program.description && (
            <p style={{
              fontSize: 13,
              color: "#8A9E8C",
              margin: "0 0 16px 0",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {program.description}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 14, borderTop: "1px solid #EEF0EA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8A9E8C", fontSize: 12, fontWeight: 500 }}>
              <BookOpen size={13} color="#C9973A" />
              <span>{courseCount} course{courseCount !== 1 ? "s" : ""}</span>
            </div>
            {publishedCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#4A8C5C", fontSize: 12, fontWeight: 600 }}>
                <span>·</span>
                <span>{publishedCount} published</span>
              </div>
            )}
            {program.duration && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8A9E8C", fontSize: 12, fontWeight: 500 }}>
                <Clock size={12} color="#8A9E8C" />
                <span>{program.duration}</span>
              </div>
            )}
            <div style={{ marginLeft: "auto", color: "#C9973A" }}>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AdminProgramsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["programs", { search }],
    queryFn: () => getPrograms({ search: search || undefined }),
  });

  const programs: any[] = data?.programs || [];

  const createMut = useMutation({
    mutationFn: (d: any) => createProgram(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program created successfully");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create program"),
  });

  return (
    <div style={{ maxWidth: 1300 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: "#1C2B1E", margin: "0 0 6px 0" }}>
            Programs
          </h1>
          <p style={{ fontSize: 14, color: "#8A9E8C", margin: 0 }}>
            Organize courses into structured learning programs
          </p>
        </div>
        <button
          id="create-program-btn"
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            background: "#C9973A",
            border: "none",
            borderRadius: 10,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(201,151,58,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#E8B85A"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#C9973A"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus size={18} />
          Create Program
        </button>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 28, maxWidth: 360 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A9E8C" }} />
        <input
          type="text"
          placeholder="Search programs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px 10px 36px",
            background: "#FFFFFF",
            border: "1px solid #D4D9CE",
            borderRadius: 10,
            fontSize: 14,
            color: "#1C2B1E",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#C9973A"; }}
          onBlur={(e) => { e.target.style.borderColor = "#D4D9CE"; }}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : programs.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 40px",
          background: "#FFFFFF",
          borderRadius: 20,
          border: "1px dashed #D4D9CE",
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(201,151,58,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <Layers size={32} color="#C9973A" />
          </div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1C2B1E", margin: "0 0 8px 0" }}>
            {search ? "No programs found" : "Create your first program"}
          </h3>
          <p style={{ fontSize: 14, color: "#8A9E8C", margin: "0 0 24px 0", maxWidth: 360, marginInline: "auto" }}>
            {search ? "Try adjusting your search" : "Programs group related courses into a structured curriculum for your students."}
          </p>
          {!search && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 24px", background: "#C9973A", border: "none",
                borderRadius: 10, color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              <Plus size={16} /> Create Program
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {programs.map((p) => <ProgramCard key={p.id} program={p} />)}
        </div>
      )}

      <CreateProgramModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(d) => createMut.mutateAsync(d)}
      />
    </div>
  );
}
