// VendorUploader.tsx
import React, { useState, useRef } from 'react';
import { VendorFileData } from '../vendorTypes';

interface VendorUploaderProps {
  onVendorSelected: (data: VendorFileData) => void;
}

export const VendorUploader: React.FC<VendorUploaderProps> = ({ onVendorSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      // Text file handling
      if (file.type === "text/plain") {
        const textReader = new FileReader();

        textReader.onload = (textEvent) => {
          onVendorSelected({
            fileName: file.name,
            mimeType: file.type,
            previewUrl: URL.createObjectURL(file),
            originalFile: file,
            base64,
            textContent: textEvent.target?.result as string
          });
        };

        textReader.readAsText(file);
      } else {
        onVendorSelected({
          fileName: file.name,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
          originalFile: file,
          base64
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-2xl">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Create New Vendor</h2>
        <p className="text-lg text-gray-600">
          Upload vendor documents like invoices, business cards, or registration certificates. 
          Our AI will automatically extract vendor details for quick creation.
        </p>
      </div>

      <div
        className={`w-full max-w-xl aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer relative flex flex-col items-center justify-center p-8 ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-400 hover:bg-gray-50/50 hover:shadow-xl hover:shadow-gray-100'
          }`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept="image/*,.pdf,.txt,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <p className="text-xl font-bold text-gray-900">Drop vendor document here</p>
        <p className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-wider">Invoices • Business Cards • Registration Docs • GST Certificates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
        <FeatureCard
          icon={<svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          title="Multi-Format Support"
          desc="Process invoices, business cards, GST certificates, and registration documents."
        />
        <FeatureCard
          icon={<svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          title="GSTIN Verification"
          desc="Automatically extract and validate 15-digit GSTIN numbers from documents."
        />
        <FeatureCard
          icon={<svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          title="Address Parsing"
          desc="Intelligently split complete addresses into street, city, state, and zip code."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="mb-4 bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center">{icon}</div>
    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
);