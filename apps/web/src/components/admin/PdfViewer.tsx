"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Use standard unpkg worker for Next.js compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(err: any) {
    console.error("Failed to load PDF:", err);
    setError("Failed to load PDF document.");
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl bg-gray-50 border border-gray-300 rounded-lg p-4 print:border-none print:p-0 print:bg-transparent overflow-hidden">
      
      {/* Interactive iframe for normal viewing (hidden during print) */}
      <div className="w-full print:hidden">
        <iframe 
          src={url} 
          className="w-full"
          style={{ height: '800px', minHeight: '800px', border: 'none' }}
          title="PDF Viewer" 
        />
        <div className="mt-6 flex flex-col items-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium shadow-sm">
            Open Original PDF in New Tab
          </a>
        </div>
      </div>

      {/* Rendered PDF Pages purely for Printing (hidden during normal view) */}
      <div className="hidden print:flex flex-col items-center w-full">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <Document
            file={typeof window !== 'undefined' ? `${window.location.origin}/api/pdf-proxy?url=${encodeURIComponent(url)}` : ''}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex flex-col items-center w-full"
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} className="flex justify-center w-full mb-8 break-inside-avoid print:break-inside-avoid">
                <div className="border border-gray-300 shadow-sm bg-white">
                  <Page 
                    pageNumber={index + 1} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={750} 
                  />
                </div>
              </div>
            ))}
          </Document>
        )}
      </div>

    </div>
  );
}
