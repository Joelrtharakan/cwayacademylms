"use client";

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl bg-gray-50 border border-gray-300 rounded-lg p-4 print:border-none print:p-0 print:bg-transparent">
      <iframe src={url} className="w-full h-[800px] print:hidden" title="PDF Viewer" />
      <div className="mt-8 flex flex-col items-center">
        <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium">
          Open Original PDF in New Tab
        </a>
      </div>
    </div>
  );
}
