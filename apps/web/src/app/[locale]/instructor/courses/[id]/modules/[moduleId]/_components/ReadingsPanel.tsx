import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createReadingMaterial, getReadingMaterials, deleteReadingMaterial } from "@/lib/api/modules";
import { BookOpen, Plus, X, UploadCloud, Trash2, GripVertical, FileText, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/shared/ConfirmContext";

export default function ReadingsPanel({ module }: { module: any }) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: materials, isLoading } = useQuery({
    queryKey: ["readings", module.id],
    queryFn: () => getReadingMaterials(module.id),
  });

  const createMut = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error("File is required");
      setUploadError(null);
      return createReadingMaterial(module.id, form.title, form.description, selectedFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setIsCreating(false);
      setForm({ title: "", description: "" });
      setSelectedFile(null);
      setUploadError(null);
      toast.success("Reading material uploaded!");
    },
    onError: (err: any) => {
      // Prefer the server's specific error message over the generic axios one
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Upload failed. Please try again.";
      setUploadError(message);
      toast.error(message);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteReadingMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings", module.id] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Reading material deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedFile) return;
    createMut.mutate();
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap", marginBottom: 28, width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0", color: "#1A261D", fontFamily: "Georgia, serif" }}>Reading Materials</h2>
          <p style={{ margin: 0, color: "#7F8E82", fontSize: 13, lineHeight: 1.4 }}>Upload PDFs, Word documents, or other reference files.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 20px", background: "linear-gradient(135deg, #B88645 0%, #A3763A 100%)",
              color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 800,
              cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 4px 14px rgba(184,134,69,0.25)"
            }}
          >
            <Plus size={16} /> <span style={{ whiteSpace: "nowrap" }}>Add Material</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E4E8E0", marginBottom: "32px", boxShadow: "0 10px 30px rgba(26,38,29,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1A261D" }}>Upload Reading Material</h3>
            <button onClick={() => { setIsCreating(false); setUploadError(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9E93" }}><X size={20} /></button>
          </div>
          
          {uploadError && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", background: "rgba(229,62,62,0.06)", border: "1px solid rgba(229,62,62,0.25)", borderRadius: "8px", marginBottom: "16px" }}>
              <AlertCircle size={16} color="#E53E3E" style={{ marginTop: "2px", flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: "13px", color: "#C53030", fontWeight: 500 }}>{uploadError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Chapter 1 Reading"
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Description (Optional)</label>
              <textarea 
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Briefly describe this document"
                rows={3}
                data-lenis-prevent="true"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E4E8E0", background: "#F7F8F5", fontSize: "14px", resize: "vertical", overflowY: "auto", minHeight: "120px", maxHeight: "300px" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8F9E93", marginBottom: "6px" }}>Upload File</label>
              <div style={{ border: "2px dashed rgba(184,134,69,0.4)", borderRadius: "12px", padding: "32px", textAlign: "center", background: "rgba(184,134,69,0.02)" }}>
                <UploadCloud size={32} color="#B88645" style={{ margin: "0 auto 12px auto" }} />
                <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#8F9E93", fontWeight: 500 }}>
                  {selectedFile ? selectedFile.name : "PDF, DOCX, PPTX formats supported."}
                </p>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.ppt,.pptx" 
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  id="doc-upload" 
                  style={{ display: "none" }} 
                />
                <label htmlFor="doc-upload" style={{ display: "inline-block", padding: "8px 16px", background: "#FFFFFF", border: "1px solid #E4E8E0", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#1A261D" }}>
                  {selectedFile ? "Change File" : "Select Document"}
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid #E4E8E0" }}>
              <button 
                type="submit"
                disabled={createMut.isPending || !selectedFile}
                style={{ padding: "10px 24px", background: "#B88645", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: (createMut.isPending || !selectedFile) ? 0.7 : 1 }}
              >
                {createMut.isPending ? "Uploading..." : "Save Material"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#B88645" }} /></div>
      ) : !materials || materials.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #E4E8E0" }}>
          <BookOpen size={28} color="#A0AEC0" style={{ margin: "0 auto 16px auto" }} />
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#1A261D" }}>No reading materials</h3>
          <p style={{ margin: 0, color: "#8F9E93", fontSize: "14px" }}>Provide supplemental documents for your students.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" }}>
          {materials.map((mat: any) => (
            <div key={mat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "16px 20px", background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E4E8E0", flexWrap: "wrap", width: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "180px" }}>
                <GripVertical size={18} color="#A0AEC0" style={{ cursor: "grab", flexShrink: 0 }} />
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(184,134,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B88645", flexShrink: 0 }}>
                  <FileText size={18} fill="currentColor" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#1A261D", wordBreak: "break-word", lineHeight: 1.4 }}>{mat.title}</h4>
                  <div style={{ fontSize: "12px", color: "#8F9E93", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>{mat.fileType}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{(mat.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "auto" }}>
                <button onClick={() => window.open(mat.fileUrl, "_blank")} style={{ padding: "8px 14px", background: "#F7F8F5", border: "1px solid #E4E8E0", color: "#B88645", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>View</button>
                <button onClick={async () => { if(await confirm("Delete material?")) deleteMut.mutate(mat.id); }} style={{ width: "34px", height: "34px", background: "rgba(220,74,74,0.06)", border: "1px solid rgba(220,74,74,0.2)", color: "#DC4A4A", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Delete Material">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
