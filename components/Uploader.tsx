
import React, { useState, useRef } from 'react';
import { FileData } from '../types';

interface UploaderProps {
  onImageSelected: (data: FileData) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelected }) => {
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
          onImageSelected({
            fileName: file.name,
            mimeType: file.type,
            previewUrl: URL.createObjectURL(file),
            originalFile: file,       // ✅ THIS IS THE FIX
            base64,
            textContent: textEvent.target?.result as string
          });
        };

        textReader.readAsText(file);
      } else {
        onImageSelected({
          fileName: file.name,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
          originalFile: file,        // ✅ THIS IS THE FIX
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
        <h2 className="text-xl font-extrabold text-gray-900 mb-4 tracking-tight uppercase">Extract Claim Data</h2>
        <p className="text-lg text-gray-600 text-sm">
          Upload images, PDFs, or text documents. Our AI will automatically identify the fields data.
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
