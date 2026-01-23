// VendorResultView.tsx
import React, { useState } from 'react';
import { VendorExtractionResult, VendorFileData, VendorData } from '../vendorTypes';
import axios from 'axios';

interface VendorResultViewProps {
  result: VendorExtractionResult;
  file: VendorFileData;
  onReset: () => void;
}

const PAYMENT_TERMS_OPTIONS = [
  "Default",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
  "Immediate",
  "End of Month",
  "Cash on Delivery",
  "Advance Payment"
];

const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP", "AED", "SAR"];
const SUPPLIER_TYPES = ["Registered", "Unregistered", "Composition", "SEZ", "Deemed Export"];
const COUNTRIES = ["India", "USA", "UK", "UAE", "Singapore", "Other"];

export const VendorResultView: React.FC<VendorResultViewProps> = ({ result, file, onReset }) => {
  const [data, setData] = useState<VendorData>(result.vendorData);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFieldChange = (field: keyof VendorData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateGSTIN = (gstin: string): boolean => {
    if (!gstin) return true; // Empty is okay
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const validateRequiredFields = (): string[] => {
    const required: (keyof VendorData)[] = [
      "Vendor_Name",
      "Supplier_Code",
      "GSTIN_NUMBER",
      "Type_of_Supplier",
      "Street",
      "City",
      "State",
      "Country"
    ];

    const missing: string[] = [];
    required.forEach(field => {
      if (!data[field] || data[field].toString().trim() === "") {
        missing.push(field);
      }
    });

    return missing;
  };

  const handleSubmit = async () => {
    // Validate GSTIN
    if (data.GSTIN_NUMBER && !validateGSTIN(data.GSTIN_NUMBER)) {
      setSubmitError("Invalid GSTIN format. Must be 15 characters (e.g., 08ACAPG1208G1ZI)");
      return;
    }

    // Validate required fields
    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      setSubmitError(`Please fill required fields: ${missingFields.join(", ")}`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const API_ENDPOINT = "https://elec-zoho-backend-snowy.vercel.app/api/vendors";

      const formData = new FormData();
      formData.append("file", file.originalFile);
      formData.append("vendorData", JSON.stringify(data));
      formData.append("processed_at", new Date().toISOString());

      const response = await axios.post(API_ENDPOINT, formData, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.status === 200 || response.status === 201) {
        setShowSuccess(true);
      } else {
        throw new Error(`Server responded ${response.status}`);
      }
    } catch (err: any) {
      console.error("Vendor submission failed:", err);
      setSubmitError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create vendor. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6 relative">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Vendor Created!</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Vendor "{data.Vendor_Name}" has been successfully created in the system.
            </p>
            <button
              onClick={onReset}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-lg active:scale-95"
            >
              Create Another Vendor
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Vendor Creation</h2>
          <p className="text-gray-500 text-sm font-medium">Extracted from: <span className="text-green-600 italic">{file.fileName}</span></p>
          <p className="text-xs text-green-600 font-medium">
            ✓ AI has automatically extracted vendor details from the document
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyJSON}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all tracking-widest ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {copied ? 'JSON COPIED' : 'COPY JSON'}
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-100 text-sm flex items-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating...
              </>
            ) : 'Create Vendor'}
          </button>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm text-red-700 font-medium">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Source Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Source Document</h3>
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm sticky top-24 min-h-[400px] flex items-center justify-center overflow-hidden">
            {isImage ? (
              <img
                src={file.previewUrl}
                alt="Vendor Document"
                className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
              />
            ) : isPdf ? (
              <iframe
                src={file.previewUrl}
                className="w-full h-[70vh] rounded-lg"
                title="Vendor Document Preview"
              />
            ) : (
              <div className="flex flex-col items-center p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900">{file.fileName}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{file.mimeType.split('/')[1] || 'Document'}</p>
              </div>
            )}
          </div>

          {/* AI Extraction Summary */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold text-green-700 uppercase">AI Extracted Details</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Vendor:</span> {data.Vendor_Name}</p>
              <p><span className="font-medium">Supplier Code:</span> {data.Supplier_Code}</p>
              {data.GSTIN_NUMBER && <p><span className="font-medium">GSTIN:</span> {data.GSTIN_NUMBER}</p>}
              {data.City && <p><span className="font-medium">Location:</span> {data.City}, {data.State}</p>}
            </div>
          </div>
        </div>

        {/* Right: Vendor Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Vendor Information</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                Auto-Extracted
              </span>
            </div>

            <div className="p-6 space-y-5">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b pb-2">Basic Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Vendor Name *"
                    value={data.Vendor_Name}
                    onChange={(v) => handleFieldChange("Vendor_Name", v)}
                    placeholder="Company/Business Name"
                    required
                  />
                  <FormField
                    label="Supplier Code *"
                    value={data.Supplier_Code}
                    onChange={(v) => handleFieldChange("Supplier_Code", v)}
                    placeholder="e.g., GVA, INF, REL"
                    required
                  />
                  {/* <FormField
                    label="Company/Brand Name"
                    value={data.CompanyBrand}
                    onChange={(v) => handleFieldChange("CompanyBrand", v)}
                    placeholder="Enter Brand Id (only number)"
                  /> */}
                  <FormField
                    label="Owner Name"
                    value={data.Owner_Name}
                    onChange={(v) => handleFieldChange("Owner_Name", v)}
                    placeholder="Proprietor/Owner name"
                  />
                  <FormField
                    label="Vendor Owner (Contact Person)"
                    value={data.Vendor_Owner}
                    onChange={(v) => handleFieldChange("Vendor_Owner", v)}
                    placeholder="Person in charge"
                  />
                  <FormField
                    label="Email"
                    type="email"
                    value={data.Email}
                    onChange={(v) => handleFieldChange("Email", v)}
                    placeholder="vendor@example.com"
                  />
                  <FormField
                    label="Phone *"
                    value={data.Phone}
                    onChange={(v) => handleFieldChange("Phone", v)}
                    placeholder="+91-XXXXXXXXXX"
                  />
                  <FormField
                    label="Website"
                    value={data.Website}
                    onChange={(v) => handleFieldChange("Website", v)}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              {/* Tax Information */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b pb-2">Tax & Registration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
                      GSTIN Number *
                      {data.GSTIN_NUMBER && !validateGSTIN(data.GSTIN_NUMBER) && (
                        <span className="text-red-500 ml-1">⚠ Invalid format</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={data.GSTIN_NUMBER}
                      onChange={(e) => handleFieldChange("GSTIN_NUMBER", e.target.value.toUpperCase())}
                      placeholder="08ACAPG1208G1ZI"
                      className={`w-full bg-gray-50 border ${validateGSTIN(data.GSTIN_NUMBER) || !data.GSTIN_NUMBER ? 'border-gray-200' : 'border-red-300'} rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">15 characters, e.g., 08ACAPG1208G1ZI</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
                      Type of Supplier *
                    </label>
                    <select
                      value={data.Type_of_Supplier}
                      onChange={(e) => handleFieldChange("Type_of_Supplier", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      <option value="">Select Type</option>
                      {SUPPLIER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b pb-2">Address Details</h4>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Street Address *</label>
                  <textarea
                    value={data.Street}
                    onChange={(e) => handleFieldChange("Street", e.target.value)}
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Building name, street, area"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <FormField
                    label="City *"
                    value={data.City}
                    onChange={(v) => handleFieldChange("City", v)}
                    placeholder="City"
                    required
                  />
                  <FormField
                    label="State *"
                    value={data.State}
                    onChange={(v) => handleFieldChange("State", v)}
                    placeholder="State"
                    required
                  />
                  <FormField
                    label="Zip Code *"
                    value={data.Zip_Code}
                    onChange={(v) => handleFieldChange("Zip_Code", v)}
                    placeholder="PIN Code"
                    required
                  />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Country *</label>
                    <select
                      value={data.Country}
                      onChange={(e) => handleFieldChange("Country", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b pb-2">Financial Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Payment Terms</label>
                    <select
                      value={data.Payment_Terms}
                      onChange={(e) => handleFieldChange("Payment_Terms", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      {PAYMENT_TERMS_OPTIONS.map(term => <option key={term} value={term}>{term}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Currency</label>
                    <select
                      value={data.Currency}
                      onChange={(e) => handleFieldChange("Currency", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      {CURRENCY_OPTIONS.map(currency => <option key={currency} value={currency}>{currency}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Source</label>
                  <input
                    type="text"
                    value={data.Source}
                    onChange={(e) => handleFieldChange("Source", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="How was this vendor sourced?"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Description</label>
                  <textarea
                    value={data.Description}
                    onChange={(e) => handleFieldChange("Description", e.target.value)}
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Additional notes about this vendor"
                  />
                </div>
                {/* Bank Details */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b pb-2">
                    Bank Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Account Number"
                      value={data.accountNumber}
                      onChange={(v) => handleFieldChange("accountNumber", v)}
                      placeholder="Bank account number"
                    />

                    <FormField
                      label="IFSC Code"
                      value={data.ifscCode}
                      onChange={(v) => handleFieldChange("ifscCode", v.toUpperCase())}
                      placeholder="e.g., HDFC0001234"
                    />

                    <FormField
                      label="Bank Name"
                      value={data.bankName}
                      onChange={(v) => handleFieldChange("bankName", v)}
                      placeholder="Bank name"
                    />

                    <FormField
                      label="Branch"
                      value={data.branch}
                      onChange={(v) => handleFieldChange("branch", v)}
                      placeholder="Branch name"
                    />

                    <FormField
                      label="GSTIN (Alt Field)"
                      value={data.gstin}
                      onChange={(v) => handleFieldChange("gstin", v.toUpperCase())}
                      placeholder="08ACAPG1208G1ZI"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-5 bg-green-600 text-white font-extrabold rounded-3xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 text-lg uppercase tracking-wider active:scale-[0.98] ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating Vendor...
                </>
              ) : 'Create Vendor in System'}
            </button>
          </div>

          <div className="bg-green-50/30 border border-green-100 p-4 rounded-2xl flex gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              <strong>Note:</strong> AI automatically extracts vendor details. Review and edit any fields as needed. Required fields are marked with *.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, type = "text", placeholder, required = false }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-gray-50 border ${required && !value ? 'border-red-200 bg-red-50/50' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all`}
    />
  </div>
);