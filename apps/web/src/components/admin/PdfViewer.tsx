"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";

// Use the CDN for the pdf.js worker to prevent Next.js bundle issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl bg-gray-50 border border-gray-300 rounded-lg p-4 print:border-none print:p-0 print:bg-transparent">
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 print:hidden">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Processing PDF for printing...</p>
        </div>
      )}
      <Document 
        file={`/api/pdf-proxy?url=${encodeURIComponent(url)}`} 
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col gap-6 items-center w-full print:block print:w-auto"
        loading={<div className="h-0" />}
      >
        {Array.from(new Array(numPages || 0), (el, index) => (
          <div key={`page_${index + 1}`} className="shadow-lg print:shadow-none border border-gray-200 print:border-none flex justify-center print:block print:text-center bg-white print:break-inside-avoid mb-6">
             <Page 
               pageNumber={index + 1} 
               renderTextLayer={false}
               renderAnnotationLayer={false}
               className="max-w-full print:max-w-none print:w-full print:flex print:justify-center"
               width={750}
             />
          </div>
        ))}
      </Document>
      
      {!loading && (
        <div className="mt-8 flex flex-col items-center print:hidden">
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium">
            Open Original PDF in New Tab
          </a>
        </div>
      )}
    </div>
  );
}
