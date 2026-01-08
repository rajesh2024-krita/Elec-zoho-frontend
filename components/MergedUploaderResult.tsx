import React, { useState, useRef } from "react";
import VendorSearchSelect from "./VendorSearchSelect";
import {
  FileData,
  ClaimData,
  ClaimType,
  CustomField,
  SchemeType
} from "../types";

/* ================= CONSTANTS ================= */

const CLAIM_MADE_BY_OPTIONS = [
  "ANKIT (LG)",
  "Ajay Rathore (BPL)",
  "Arif (GODREJ)",
  "Atiksha Ji",
  "Bhaskar Mishra (VOLTAS)",
  "Bhawani Singh (LIEBHERR)",
  "Mahender Singh (Samsung)",
  "Mukesh Dholi (BOSCH)",
  "Sunil Hunsaliya (TCL)",
  "Suresh Singh (Apple)"
];

const CLAIM_TYPES: ClaimType[] = [
  "General Information",
  "Price Drop",
  "Price List",
  "Monthly Scheme",
  "Goods Return",
  "Target Scheme",
  "DOA",
  "Other"
];

const SCHEME_TYPES: SchemeType[] = ["Sell In", "Sell Out"];

/* ================= FRONTEND EXTRACTION ================= */

const extractClaimDataFrontend = async (
  file: FileData,
  vendorName: string
) => {
  return {
    claimData: {
      supplierName: vendorName,
      vendorName: vendorName,
      companyBrandName: "",
      claimType: "General Information",
      schemeType: "",
      schemeStartDate: "",
      schemeEndDate: "",
      claimDetails: file.textContent || "",
      additionalFields: []
    }
  };
};

/* ================= COMPONENT ================= */

export const MergedUploaderResult: React.FC<{
  onSubmit?: (data: ClaimData, file: FileData) => Promise<void>;
}> = ({ onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"vendor" | "upload" | "review">("vendor");
  const [vendorName, setVendorName] = useState("");
  const [claimMadeBy, setClaimMadeBy] = useState("");
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [formData, setFormData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= FILE HANDLER ================= */

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files[0]) return;

    setLoading(true);
    const file = files[0];

    const fileData: FileData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          base64: e.target?.result as string,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    });

    setFileData(fileData);

    const result = await extractClaimDataFrontend(fileData, vendorName);
    setFormData(result?.claimData);
    setStep("review");
    setLoading(false);
  };

  /* ================= FORM HELPERS ================= */

  const handleFieldChange = (field: keyof ClaimData, value: string) => {
    setFormData((prev) => prev && { ...prev, [field]: value });
  };

  const addCustomField = () => {
    if (!formData) return;
    const label = prompt("Enter field label");
    if (!label) return;

    const field: CustomField = {
      id: Math.random().toString(36).substring(2),
      label,
      value: ""
    };

    setFormData({
      ...formData,
      additionalFields: [...(formData.additionalFields || []), field]
    });
  };

  const submitData = async () => {
    if (!formData || !fileData || !claimMadeBy) return;

    const finalData = {
      ...formData,
      vendorName,
      claimMadeBy
    };

    if (onSubmit) {
      await onSubmit(finalData, fileData);
    }

    alert("Claim submitted successfully");
    reset();
  };

  const reset = () => {
    setStep("vendor");
    setVendorName("");
    setClaimMadeBy("");
    setFileData(null);
    setFormData(null);
  };

  /* ================= RENDER ================= */

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* STEP 1 – VENDOR */}
      {step === "vendor" && (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Select Vendor</h2>

          <VendorSearchSelect
            value={vendorName}
            onChange={setVendorName}
            onSelect={(v) => setVendorName(v.Vendor_Name)}
          />

          <button
            disabled={!vendorName}
            onClick={() => setStep("upload")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:bg-gray-300"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2 – UPLOAD */}
      {step === "upload" && (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Upload Document</h2>
          <p className="text-gray-500">Vendor: {vendorName}</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-3xl p-16 cursor-pointer hover:border-blue-500"
          >
            {loading ? "Extracting..." : "Click or drop file here"}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*,.pdf,.txt,.doc,.docx"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <button
            onClick={() => setStep("vendor")}
            className="text-sm underline"
          >
            Back
          </button>
        </div>
      )}

      {/* STEP 3 – REVIEW */}
      {step === "review" && formData && (
        <div className="space-y-6">

          <h2 className="text-3xl font-bold">Review Extracted Data</h2>

          <select
            value={claimMadeBy}
            onChange={(e) => setClaimMadeBy(e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option value="">Claim Made By</option>
            {CLAIM_MADE_BY_OPTIONS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          <input
            value={formData.supplierName}
            onChange={(e) => handleFieldChange("supplierName", e.target.value)}
            className="w-full border p-3 rounded-xl"
            placeholder="Supplier Name"
          />

          <textarea
            value={formData.claimDetails}
            onChange={(e) => handleFieldChange("claimDetails", e.target.value)}
            className="w-full border p-3 rounded-xl"
            rows={4}
          />

          <button
            onClick={addCustomField}
            className="border-dashed border-2 p-3 rounded-xl w-full"
          >
            + Add Custom Field
          </button>

          <button
            onClick={submitData}
            disabled={!claimMadeBy}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:bg-gray-300"
          >
            Submit Claim
          </button>

        </div>
      )}
    </div>
  );
};
