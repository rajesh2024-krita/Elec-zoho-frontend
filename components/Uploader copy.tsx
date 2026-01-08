
import React, { useState, useRef } from 'react';
import { ClaimData, FileData } from '../types';
import VendorSearchSelect from './VendorSearchSelect';


interface UploaderProps {
  onImageSelected: (data: FileData) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<ClaimData>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        // For text files, we also want the raw string content
        if (file.type === 'text/plain') {
          const textReader = new FileReader();
          textReader.onload = (textEvent) => {
            onImageSelected({
              base64,
              mimeType: file.type,
              previewUrl: URL.createObjectURL(file),
              fileName: file.name,
              textContent: textEvent.target?.result as string
            });
          };
          textReader.readAsText(file);
        } else {
          onImageSelected({
            base64,
            mimeType: file.type,
            previewUrl: URL.createObjectURL(file),
            fileName: file.name
          });
        }
      };
      reader.readAsDataURL(file);
    }
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

  const CLAIM_MADE_BY_OPTIONS = [
    "ANKIT (LG)",
    "Ajay Rathore (BPL)",
    "Arif (GODREJ)",
    "Atiksha Ji",
    "Bhaskar Mishra (VOLTAS)",
    "Bhawani Singh (liebhrr)",
    "Bhawani Singh Sisodiya (LIEBHERR)",
    "Mahender Singh (Samsung)",
    "Manisha Chouhan",
    "Mohan Kumar (Bosch)",
    "Mohsin Khan",
    "Mukesh Dholi (BOSCH)",
    "Pradeep sawami (OPPO)",
    "Praveen Khichi",
    "Rahul Singadiya (LIEBHERR)",
    "Ram Ganesh",
    "Sadhana Chundawat",
    "Seema Saxena",
    "Sunil Hunsaliya (TCL)",
    "Sunita Kumari (CROMPTON)",
    "Suresh Singh (Apple)",
    "Yudhister Ji (LIEBHERR)"
  ];

  const handleFieldChange = (field: keyof ClaimData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-2xl">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Extract Claim Data</h2>
        <p className="text-lg text-gray-600">
          Upload images, PDFs, or text documents. Our AI will automatically identify supplier names, dates, and claim types.
        </p>
      </div>

      <div
        className={`w-full max-w-xl aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer relative flex flex-col items-center justify-center p-8 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-gray-50/50 hover:shadow-xl hover:shadow-gray-100'
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

        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <p className="text-xl font-bold text-gray-900">Drop your document here</p>
        <p className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-wider">Images • PDF • Word • Text</p>
      </div>

      <VendorSearchSelect
        onSelect={(vendor) => {
          console.log("Selected Vendor:", vendor);
        }}
      />

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
          Claim Made By
        </label>
        <select
          value={data.claimMadeBy || ""}
          onChange={(e) => handleFieldChange("claimMadeBy", e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">- Select -</option>
          {CLAIM_MADE_BY_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
        <FeatureCard
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          title="Multi-Format OCR"
          desc="Process PDFs and images seamlessly with native document intelligence."
        />
        <FeatureCard
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" /></svg>}
          title="Structured Data"
          desc="Extract dates, vendors, and claim types into organized fields instantly."
        />
        <FeatureCard
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          title="Fully Editable"
          desc="Manually adjust extracted details and add custom fields as needed."
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
