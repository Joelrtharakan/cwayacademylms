"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Percent, Save, X, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, Column } from "@/components/admin/DataTable";
import { getInstructors, updateInstructorPayout, createInstructor } from "@/lib/api/admin";

export default function AdminInstructorsPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payoutVal, setPayoutVal] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInstructor, setNewInstructor] = useState({ name: "", email: "" });

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: getInstructors,
  });

  const createMut = useMutation({
    mutationFn: createInstructor,
    onSuccess: () => {
      toast.success("Instructor created and email sent!");
      qc.invalidateQueries({ queryKey: ["admin-instructors"] });
      setIsModalOpen(false);
      setNewInstructor({ name: "", email: "" });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create instructor"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, percentage }: { id: string; percentage: number }) =>
      updateInstructorPayout(id, percentage),
    onSuccess: () => {
      toast.success("Payout percentage updated");
      qc.invalidateQueries({ queryKey: ["admin-instructors"] });
      setEditingId(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const columns: Column<any>[] = [
    {
      key: "instructor",
      header: "Instructor",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              background: "rgba(61,122,75,0.1)",
              color: "#3D7A4B",
              border: "1px solid rgba(61,122,75,0.2)",
            }}
          >
            {row.name?.slice(0, 2) || "IN"}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D", margin: 0 }}>{row.name}</p>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "#8F9E93", margin: "2px 0 0 0" }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "courses",
      header: "Courses Published",
      render: (row) => (
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#1A261D" }}>
          {row._count?.coursesCreated ?? 0}
        </span>
      ),
    },
    {
      key: "students",
      header: "Total Students",
      render: (row) => (
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#8F9E93" }}>
          {row.totalStudents ?? 0}
        </span>
      ),
    },
    {
      key: "payout",
      header: "Revenue Share",
      render: (row) =>
        editingId === row.id ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="number"
              min="0"
              max="100"
              value={payoutVal}
              onChange={(e) => setPayoutVal(e.target.value)}
              style={{
                width: "64px",
                padding: "6px 0",
                fontSize: "13px",
                fontFamily: "monospace",
                textAlign: "center",
                borderRadius: "8px",
                outline: "none",
                background: "#FFFFFF",
                border: "1.5px solid #B88645",
                color: "#1A261D",
                boxShadow: "0 0 0 3px rgba(184,134,69,0.1)",
              }}
              autoFocus
            />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#8F9E93" }}>%</span>
          </div>
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              background: "rgba(184,134,69,0.08)",
              color: "#B88645",
              border: "1px solid rgba(184,134,69,0.15)",
            }}
          >
            <Percent size={11} />
            {row.payoutPercentage ?? 70}
          </div>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        editingId === row.id ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setEditingId(null)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                background: "#F7F8F5",
                color: "#8F9E93",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,58,46,0.08)"; e.currentTarget.style.color = "#B03A2E"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#F7F8F5"; e.currentTarget.style.color = "#8F9E93"; }}
            >
              <X size={14} />
            </button>
            <button
              onClick={() => updateMut.mutate({ id: row.id, percentage: parseFloat(payoutVal) })}
              disabled={updateMut.isPending}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                background: "rgba(61,122,75,0.1)",
                color: "#3D7A4B",
                border: "none",
                cursor: updateMut.isPending ? "not-allowed" : "pointer",
                opacity: updateMut.isPending ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if(!updateMut.isPending) e.currentTarget.style.background = "rgba(61,122,75,0.2)"; }}
              onMouseLeave={(e) => { if(!updateMut.isPending) e.currentTarget.style.background = "rgba(61,122,75,0.1)"; }}
            >
              <Save size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingId(row.id); setPayoutVal((row.payoutPercentage ?? 70).toString()); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              transition: "all 0.15s",
              background: "rgba(184,134,69,0.08)",
              color: "#B88645",
              border: "1px solid rgba(184,134,69,0.15)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(184,134,69,0.08)"; }}
          >
            <Percent size={12} /> Adjust
          </button>
        ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PageHeader
          title="Instructors"
          subtitle="Manage faculty accounts and revenue share percentages"
        />
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#1A261D",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#2C4A3B"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#1A261D"}
        >
          <UserPlus size={16} />
          Add Instructor
        </button>
      </div>
      <DataTable
        columns={columns}
        data={instructors}
        loading={isLoading}
        rowKey={(r) => r.id}
        emptyMessage="No instructors found"
      />

      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(26,38,29,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: "16px", padding: "32px", width: "400px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#1A261D", fontFamily: "Georgia, serif" }}>Add New Instructor</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#8F9E93" }}>A secure password will be generated and emailed to them.</p>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#1A261D" }}>Full Name</label>
              <input 
                type="text" 
                value={newInstructor.name}
                onChange={(e) => setNewInstructor({...newInstructor, name: e.target.value})}
                placeholder="Dr. John Doe"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#1A261D" }}>Email Address</label>
              <input 
                type="email" 
                value={newInstructor.email}
                onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                placeholder="john.doe@example.com"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "transparent", color: "#8F9E93", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={() => createMut.mutate(newInstructor)}
                disabled={!newInstructor.name || !newInstructor.email || createMut.isPending}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "none", background: "#B88645", color: "#FFFFFF", fontWeight: 600, cursor: "pointer", opacity: (!newInstructor.name || !newInstructor.email || createMut.isPending) ? 0.5 : 1 }}
              >
                {createMut.isPending ? "Creating..." : "Create & Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
