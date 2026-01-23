// ResultView.tsx - FOCUSED on manual full price entry only
import React, { useState, useEffect } from 'react';
import { ExtractionResult, FileData, ClaimData, ClaimType, CustomField, SchemeType, DiscountModel, MonthlyScheme, CalculationResult } from '../types';
import VendorSearchSelect from './VendorSearchSelect';
import { CalculationPanel } from './CalculationPanel';
import axios from 'axios';

interface ResultViewProps {
  result: ExtractionResult;
  file: FileData;
  onReset: () => void;
}

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

const CLAIM_TYPES: ClaimType[] = [
  'General Information', 'Price Drop', 'Price List', 'Monthly Scheme',
  'Goods Return', 'Target Scheme', 'DOA', 'Other'
];

const SCHEME_TYPES: SchemeType[] = ['Sell In', 'Sell Out'];

export const ResultView: React.FC<ResultViewProps> = ({ result, file, onReset }) => {
  const [data, setData] = useState<ClaimData>(result.claimData);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCalculations, setShowCalculations] = useState(true); // Auto-show calculations

  // Initialize and auto-calculate everything
  useEffect(() => {
    if (data.discountModels && data.discountModels.length > 0) {
      const updatedModels = data.discountModels.map(model => {
        const fullPrice = Number(model.fullPrice) || 0;
        const discountPercentage = Number(model.discountPercentage) || 0;
        const payoutAmount = Number(model.payoutAmount) || 0;

        // Auto-calculate based on what we have
        let calculatedPayout = payoutAmount;
        let calculatedDiscount = discountPercentage;

        if (fullPrice > 0) {
          if (discountPercentage > 0 && payoutAmount === 0) {
            calculatedPayout = fullPrice * (discountPercentage / 100);
          } else if (payoutAmount > 0 && discountPercentage === 0) {
            calculatedDiscount = (payoutAmount / fullPrice) * 100;
          }
        }

        return {
          ...model,
          payoutAmount: calculatedPayout,
          discountPercentage: calculatedDiscount,
          afterDiscount: fullPrice - calculatedPayout,
        };

      });

      if (JSON.stringify(updatedModels) !== JSON.stringify(data.discountModels)) {
        setData(prev => ({ ...prev, discountModels: updatedModels }));
      }

    }
  }, [data.discountModels]);

  // Recalculate totals whenever data changes
  useEffect(() => {
    recalculateTotals();
  }, [JSON.stringify(data.discountModels), JSON.stringify(data.monthlySchemes)]);


  const recalculateTotals = () => {
    // Calculate discount models totals
    let fullPayment = 0;
    let totalDiscount = 0;
    let totalPayoutAmount = 0;

    data.discountModels?.forEach(model => {
      const price = Number(model.fullPrice) || 0;
      const discountPerc = Number(model.discountPercentage) || 0;
      const payout = Number(model.payoutAmount) || 0;

      fullPayment += price;
      totalDiscount += (price * discountPerc) / 100;
      totalPayoutAmount += payout;
    });

    // Calculate monthly schemes totals
    const updatedMonthlySchemes = data.monthlySchemes?.map(scheme => {
      const achieved = Number(scheme.achievedQuantity) || 0;
      const payoutPerUnit = Number(scheme.payoutPerUnit) || 0;
      const total = achieved * payoutPerUnit;

      return {
        ...scheme,
        totalPayout: total
      };
    }) || [];

    const totalMonthlyPayout = updatedMonthlySchemes.reduce((sum, scheme) => sum + scheme.totalPayout, 0);

    const calculations: CalculationResult = {
      fullPayment,
      totalDiscount,
      netPayment: fullPayment - totalDiscount,
      monthlyPayouts: updatedMonthlySchemes,
      totalMonthlyPayout,
      finalPayment: (fullPayment - totalDiscount) - totalMonthlyPayout
    };

    setData(prev => ({
      ...prev,
      calculations,
      monthlySchemes: updatedMonthlySchemes
    }));
  };

  const handleFieldChange = (field: keyof ClaimData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDiscountModelChange = (index: number, field: keyof DiscountModel, value: any) => {
    setData(prev => {
      const updatedModels = [...(prev.discountModels || [])];

      // Only allow editing fullPrice - other fields auto-calculate
      if (field === 'fullPrice') {
        const fullPrice = Number(value) || 0;
        const currentModel = updatedModels[index];
        const discountPercentage = Number(currentModel.discountPercentage) || 0;
        const payoutAmount = Number(currentModel.payoutAmount) || 0;

        let newPayout = payoutAmount;
        let newDiscount = discountPercentage;

        // Auto-calculate based on existing discount or payout
        if (fullPrice > 0) {
          if (discountPercentage > 0) {
            newPayout = fullPrice * (discountPercentage / 100);
          } else if (payoutAmount > 0) {
            newDiscount = (payoutAmount / fullPrice) * 100;
          }
        }

        updatedModels[index] = {
          ...currentModel,
          [field]: fullPrice,
          discountPercentage: newDiscount,
          payoutAmount: newPayout,
          afterDiscount: fullPrice - newPayout,
        };

      } else if (field === 'modelName' || field === 'sku') {
        // Allow editing model name
        updatedModels[index] = { ...updatedModels[index], [field]: value };
      }
      // Note: discountPercentage and payoutAmount are read-only - they auto-calculate

      return { ...prev, discountModels: updatedModels };
    });
  };

  const handleMonthlySchemeChange = (index: number, field: keyof MonthlyScheme, value: any) => {
    setData(prev => {
      const updatedSchemes = [...(prev.monthlySchemes || [])];
      updatedSchemes[index] = { ...updatedSchemes[index], [field]: value };
      return { ...prev, monthlySchemes: updatedSchemes };
    });
  };

  const addDiscountModel = () => {
    const newModel: DiscountModel = {
      modelName: `Model ${(data.discountModels?.length || 0) + 1}`,
      sku: "",
      fullPrice: 0,
      discountPercentage: 0,
      payoutAmount: 0
    };
    setData(prev => ({
      ...prev,
      discountModels: [...(prev.discountModels || []), newModel]
    }));
  };

  const addMonthlyScheme = () => {
    const newScheme: MonthlyScheme = {
      month: `Month ${(data.monthlySchemes?.length || 0) + 1}`,
      targetQuantity: 0,
      achievedQuantity: 0,
      payoutPerUnit: 0,
      totalPayout: 0
    };
    setData(prev => ({
      ...prev,
      monthlySchemes: [...(prev.monthlySchemes || []), newScheme]
    }));
  };

  const removeDiscountModel = (index: number) => {
    setData(prev => ({
      ...prev,
      discountModels: prev.discountModels?.filter((_, i) => i !== index)
    }));
  };

  const removeMonthlyScheme = (index: number) => {
    setData(prev => ({
      ...prev,
      monthlySchemes: prev.monthlySchemes?.filter((_, i) => i !== index)
    }));
  };

  const handleCustomFieldChange = (id: string, value: string) => {
    setData(prev => ({
      ...prev,
      additionalFields: prev.additionalFields?.map(f => f.id === id ? { ...f, value } : f)
    }));
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const REQUIRED_FIELDS: (keyof ClaimData)[] = [
    "supplierName",
    "vendorName",
    "claimType",
    "schemeType",
    "claimDetails",
    "claimMadeBy"
  ];

  const validateRequiredFields = (data: ClaimData) => {
    const missingFields: string[] = [];

    REQUIRED_FIELDS.forEach((field) => {
      const value = (data as any)[field];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        missingFields.push(field);
      }
    });

    return missingFields;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const missingFields = validateRequiredFields(data);
    if (missingFields.length > 0) {
      setSubmitError(
        `Please fill all required fields: ${missingFields.join(", ")}`
      );
      setSubmitting(false);
      return;
    }

    try {
      const API_ENDPOINT = "https://elec-zoho-backend-snowy.vercel.app/api/claims";

      const formData = new FormData();
      formData.append("file", file.originalFile);

      // Build final model array with all calculated values
      const finalModels = (data.discountModels || []).map(m => ({
        modelName: m.modelName,
        sku: m.sku,
        fullPrice: m.fullPrice,
        discountPercentage: m.discountPercentage,
        payoutAmount: m.payoutAmount,
        afterDiscount: m.afterDiscount,
      }));

      const finalPayload = {
        ...data,
        discountModels: finalModels,
      };

      // Append everything
      Object.entries(finalPayload).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });


      // Object.entries(data).forEach(([key, value]) => {
      //   if (value !== undefined && value !== null) {
      //     if (Array.isArray(value)) {
      //       formData.append(key, JSON.stringify(value));
      //     } else {
      //       formData.append(key, String(value));
      //     }
      //   }
      // });

      formData.append("processed_at", new Date().toISOString());
      formData.append("original_file", file.fileName);

      console.log("formData =", formData);

      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        throw new Error(`Server responded ${response.status}`);
      }

      setShowSuccess(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(
        err.response?.data?.message ||
        err.message ||
        "Failed to send data to the API."
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted!</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              The extracted claim data has been successfully sent to your API for processing.
            </p>
            <button
              onClick={onReset}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-colors shadow-lg active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Processing Result</h2>
          <p className="text-gray-500 text-sm font-medium">Reviewing: <span className="text-blue-600 italic">{file.fileName}</span></p>
          <p className="text-xs text-green-600 font-medium">
            ✓ AI has automatically extracted models and calculated discounts/payouts
          </p>
        </div>
        <div className="flex gap-2">
          {/* <button
            onClick={() => setShowCalculations(!showCalculations)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all tracking-widest ${showCalculations ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {showCalculations ? 'HIDE CALC' : 'SHOW CALC'}
          </button> */}
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
            className={`px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 text-sm flex items-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Sending...
              </>
            ) : 'Submit Claim'}
          </button>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm text-red-700 font-medium">{submitError}</p>
        </div>
      )}

      {/* {showCalculations && data.calculations && (
        <CalculationPanel calculations={data.calculations} />
      )} */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Source Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Source View</h3>
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm sticky top-24 min-h-[400px] flex items-center justify-center overflow-hidden">
            {isImage ? (
              <img
                src={file.previewUrl}
                alt="Source"
                className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
              />
            ) : isPdf ? (
              <iframe
                src={file.previewUrl}
                className="w-full h-[70vh] rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <div className="flex flex-col items-center p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900">{file.fileName}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{file.mimeType.split('/')[1] || 'Document'}</p>
              </div>
            )}
          </div>

          {/* AI Extracted Models Summary */}
          {data.discountModels && data.discountModels.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold text-green-700 uppercase">AI Extracted Models</span>
              </div>
              <p className="text-sm text-green-600">
                Found {data.discountModels.length} model(s) in the document.
                {data.discountModels.some(m => m.fullPrice === 0) &&
                  " Please enter full prices for accurate calculations."}
              </p>
            </div>
          )}
        </div>

        {/* Right: Structured Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Claim Details</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
                {data.discountModels && data.discountModels.length > 0
                  ? `${data.discountModels.length} Models Auto-Extracted`
                  : 'Manual Entry'}
              </span>
            </div>

            <div className="p-6 space-y-5">
              {/* Basic Claim Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VendorSearchSelect
                  label="Supplier Name *"
                  value={data.supplierName}
                  onSelect={(vendor) => {
                    handleFieldChange("supplierName", vendor.Vendor_Name);
                    handleFieldChange("vendorName", vendor.Vendor_Name);
                  }}
                />

                <FormField
                  label="Vendor Name"
                  value={data.vendorName}
                  readOnly
                  onChange={() => { }}
                  placeholder="Auto-filled from supplier"
                />

                <FormField
                  label="Company/Brand Name"
                  value={data.companyBrandName}
                  onChange={(v) => handleFieldChange('companyBrandName', v)}
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Claim Type</label>
                  <select
                    value={data.claimType}
                    onChange={(e) => handleFieldChange('claimType', e.target.value as ClaimType)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {CLAIM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Scheme Type</label>
                  <select
                    value={data.schemeType}
                    onChange={(e) => handleFieldChange('schemeType', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select Scheme Type</option>
                    {SCHEME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <FormField
                  label="Scheme Start Date"
                  type="date"
                  value={data.schemeStartDate}
                  onChange={(v) => handleFieldChange('schemeStartDate', v)}
                />
                <FormField
                  label="Scheme End Date"
                  type="date"
                  value={data.schemeEndDate}
                  onChange={(v) => handleFieldChange('schemeEndDate', v)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Claim Details</label>
                <textarea
                  value={data.claimDetails}
                  onChange={(e) => handleFieldChange('claimDetails', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Describe the claim extracted from the document..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
                  Claim Made By *
                </label>
                <select
                  value={data.claimMadeBy || ""}
                  required
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

              {/* Auto-Extracted Models Section */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model-wise Discount/Payout</h4>
                    {/* <p className="text-xs text-gray-500 mt-1">
                      ✓ Discounts & payouts auto-calculated • Enter full prices only
                    </p> */}
                  </div>
                  <button
                    onClick={addDiscountModel}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    ADD MODEL
                  </button>
                </div>

                {data.discountModels?.map((model, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 items-end p-4 bg-gradient-to-r from-blue-50/30 to-green-50/30 rounded-2xl border border-blue-100">
                    <div className="">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={model.sku || ""}
                        onChange={(e) => handleDiscountModelChange(index, 'sku', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder="Enter SKU"
                      />
                    </div>

                    <div className="">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Model Name</label>
                      <input
                        type="text"
                        value={model.modelName}
                        onChange={(e) => handleDiscountModelChange(index, 'modelName', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder="e.g., Samsung QLED 55"
                      />
                    </div>
                    {/* <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
                        Full Price *
                        <span className="text-red-500 ml-1">✓</span>
                      </label>
                      <input
                        type="number"
                        value={model.fullPrice || ''}
                        onChange={(e) => handleDiscountModelChange(index, 'fullPrice', e.target.value)}
                        className="w-full bg-white border-2 border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 outline-none"
                        placeholder="0"
                      />
                      <p className="text-[9px] text-gray-400 mt-1">Enter only</p>
                    </div> */}
                    <div className="">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Discount %</label>
                      <input
                        type="text"
                        value={model.discountPercentage.toFixed(2)}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                      <p className="text-[9px] text-gray-400 mt-1">Auto-calculated</p>
                    </div>
                    <div className="">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Payout</label>
                      <input
                        type="text"
                        value={`₹${model.payoutAmount.toLocaleString()}`}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                      <p className="text-[9px] text-gray-400 mt-1">Auto-calculated</p>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      {/* <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">After Discount</label>
                        <input
                          type="text"
                          value={`₹${(model.fullPrice - model.payoutAmount).toLocaleString()}`}
                          readOnly
                          className="w-full bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-bold text-green-700 cursor-not-allowed"
                        />
                      </div> */}
                      <button
                        onClick={() => removeDiscountModel(index)}
                        className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {(!data.discountModels || data.discountModels.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No models extracted. AI will extract from documents automatically.</p>
                  </div>
                )}
              </div>

              {/* Monthly Schemes Section */}
              {/* <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Target Scheme</h4>
                    <p className="text-xs text-gray-500 mt-1">Enter monthly targets and achievements</p>
                  </div>
                  <button
                    onClick={addMonthlyScheme}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    ADD MONTH
                  </button>
                </div>

                {data.monthlySchemes?.map((scheme, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 bg-gradient-to-r from-purple-50/30 to-pink-50/30 rounded-2xl border border-purple-100">
                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Month</label>
                      <input
                        type="text"
                        value={scheme.month}
                        onChange={(e) => handleMonthlySchemeChange(index, 'month', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Target Qty</label>
                      <input
                        type="number"
                        value={scheme.targetQuantity}
                        onChange={(e) => handleMonthlySchemeChange(index, 'targetQuantity', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Achieved Qty</label>
                      <input
                        type="number"
                        value={scheme.achievedQuantity}
                        onChange={(e) => handleMonthlySchemeChange(index, 'achievedQuantity', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Payout/Unit</label>
                      <input
                        type="number"
                        value={scheme.payoutPerUnit}
                        onChange={(e) => handleMonthlySchemeChange(index, 'payoutPerUnit', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Total Payout</label>
                      <input
                        type="text"
                        value={`₹${scheme.totalPayout.toLocaleString()}`}
                        readOnly
                        className="w-full bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeMonthlyScheme(index)}
                        className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div> */}

              {/* Custom Fields Section */}
              {data.additionalFields && data.additionalFields.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Additional Fields</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {data.additionalFields.map((field) => (
                      <div key={field.id} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <FormField
                            label={field.label}
                            value={field.value}
                            onChange={(v) => handleCustomFieldChange(field.id, v)}
                          />
                        </div>
                        <button
                          // onClick={() => deleteField(field.id)}
                          className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-5 bg-blue-600 text-white font-extrabold rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 text-lg uppercase tracking-wider active:scale-[0.98] ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Submitting Claim...
                </>
              ) : 'Submit Claim Data'}
            </button>
          </div>

          <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-2xl flex gap-3">
            <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              <strong>Note:</strong> AI automatically extracts model names, discounts, and payouts. You only need to enter the <strong>full price</strong> for each model. All calculations update in real-time.
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
  readOnly?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, type = "text", placeholder, readOnly = false }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all ${label.includes('*') && !value ? 'border-red-200 bg-red-50/50' : ''
        } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  </div>
);
