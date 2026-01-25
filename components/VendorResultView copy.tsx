// VendorResultView.tsx
import React, { useState, useEffect } from 'react';
import { VendorExtractionResult, VendorFileData, VendorData, PurchaseRequestItem } from '../vendorTypes';
import axios from 'axios';

interface VendorResultViewProps {
  result: VendorExtractionResult;
  file: VendorFileData;
  onReset: () => void;
}

// Options arrays
const PAYMENT_TERMS_OPTIONS = [
  "Default",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
  "Immediate",
  "End of Month",
  "Cash on Delivery",
  "Advance Payment",
  "Net 45",
  "Net 90",
  "2% 10 Net 30",
  "50% Advance, 50% on Delivery"
];

const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP", "AED", "SAR", "JPY", "CNY", "AUD", "CAD"];
const SUPPLIER_TYPES = ["Registered", "Unregistered", "Composition", "SEZ", "Deemed Export", "Import"];
const COUNTRIES = ["India", "USA", "UK", "UAE", "Singapore", "Other", "Germany", "China", "Japan", "Australia", "Canada"];
const UNIT_OPTIONS = ["Nos", "Kg", "Ltr", "Meter", "Box", "Set", "Pair", "Unit", "Dozen", "Pack", "Bag", "Roll", "Bottle", "Can", "Jar", "Tube", "Carton", "Piece", "Gram", "Milliliter"];
const WAREHOUSE_OPTIONS = ["Default", "Main Warehouse", "North Warehouse", "South Warehouse", "East Warehouse", "West Warehouse", "Central Warehouse"];
const VENDOR_CATEGORIES = ["Manufacturer", "Distributor", "Wholesaler", "Retailer", "Service Provider", "Consultant", "Contractor", "Other"];
const SHIPPING_METHODS = ["Surface", "Air", "Sea", "Courier", "Express", "Pickup", "Other"];
const PURCHASE_ORDER_TYPES = ["Standard", "Urgent", "Blanket", "Contract", "Service", "Capital", "Consumable", "Other"];

// Tax rates for quick selection
const TAX_RATES = [0, 5, 12, 18, 28];

export const VendorResultView: React.FC<VendorResultViewProps> = ({ result, file, onReset }) => {
  // Vendor data state
  const [data, setData] = useState<VendorData>({
    Vendor_Name: result.vendorData.Vendor_Name || '',
    Email: result.vendorData.Email || '',
    Phone: result.vendorData.Phone || '',
    Website: result.vendorData.Website || '',
    Owner_Name: result.vendorData.Owner_Name || '',
    Supplier_Code: result.vendorData.Supplier_Code || generateSupplierCode(result.vendorData.Vendor_Name || ''),
    Vendor_Owner: result.vendorData.Vendor_Owner || '',
    Payment_Terms: result.vendorData.Payment_Terms || 'Default',
    Currency: result.vendorData.Currency || 'INR',
    Source: result.vendorData.Source || 'Document Upload',
    GSTIN_NUMBER: result.vendorData.GSTIN_NUMBER || '',
    Type_of_Supplier: result.vendorData.Type_of_Supplier || 'Registered',
    Street: result.vendorData.Street || '',
    City: result.vendorData.City || '',
    State: result.vendorData.State || '',
    Zip_Code: result.vendorData.Zip_Code || '',
    Country: result.vendorData.Country || 'India',
    Description: result.vendorData.Description || 'Vendor extracted from uploaded document',
    accountNumber: result.vendorData.accountNumber || '',
    ifscCode: result.vendorData.ifscCode || '',
    bankName: result.vendorData.bankName || '',
    branch: result.vendorData.branch || '',
    gstin: result.vendorData.gstin || result.vendorData.GSTIN_NUMBER || '',
  });

  // Additional vendor fields state
  const [additionalVendorData, setAdditionalVendorData] = useState({
    panNumber: '',
    tanNumber: '',
    msmeRegistered: false,
    msmeNumber: '',
    creditLimit: '',
    creditPeriod: '',
    vendorCategory: '',
    bankDetails: [],
    contactPersons: []
  });

  // Purchase request data state
  const [purchaseRequestData, setPurchaseRequestData] = useState({
    items: result.purchaseRequestData?.items || [],
    warehouse: result.purchaseRequestData?.warehouse || 'Default',
    expected_delivery_date: result.purchaseRequestData?.expected_delivery_date || '',
    tag: result.purchaseRequestData?.tag || 'From Vendor Creation',
    exchange_rate: result.purchaseRequestData?.exchange_rate || 1,
    // Additional fields
    purchase_order_type: 'Standard',
    requisition_number: '',
    project: '',
    department: '',
    approved_by: '',
    terms_and_conditions: '',
    shipping_method: '',
    shipping_terms: '',
    notes: ''
  });
  
  // UI state
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPurchaseSection, setShowPurchaseSection] = useState(
    result.purchaseRequestData?.items && result.purchaseRequestData.items.length > 0
  );
  const [aiExtractionSummary, setAiExtractionSummary] = useState({
    vendorFields: 0,
    itemsExtracted: result.purchaseRequestData?.items?.length || 0,
    hasItems: result.purchaseRequestData?.items && result.purchaseRequestData.items.length > 0,
    confidence: result.confidenceScore || 0.85
  });

  // Check vendor existence state
  const [checkingVendor, setCheckingVendor] = useState(false);
  const [vendorExists, setVendorExists] = useState<boolean | null>(null);
  const [existingVendorInfo, setExistingVendorInfo] = useState<any>(null);

  // Calculate extracted vendor fields count
  useEffect(() => {
    const vendorFields = Object.keys(result.vendorData).filter(key => {
      const value = result.vendorData[key as keyof VendorData];
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    setAiExtractionSummary(prev => ({
      ...prev,
      vendorFields,
      itemsExtracted: result.purchaseRequestData?.items?.length || 0,
      hasItems: result.purchaseRequestData?.items && result.purchaseRequestData.items.length > 0
    }));

    // Auto-show purchase section if items were extracted
    if (result.purchaseRequestData?.items && result.purchaseRequestData.items.length > 0) {
      setShowPurchaseSection(true);
    }

    // Check if vendor already exists
    if (result.vendorData.GSTIN_NUMBER || result.vendorData.Vendor_Name) {
      checkVendorExists();
    }
  }, [result]);

  // Check if vendor exists
  const checkVendorExists = async () => {
    const gstin = data.GSTIN_NUMBER || data.gstin;
    const vendorName = data.Vendor_Name;
    
    if (!gstin && !vendorName) return;

    setCheckingVendor(true);
    try {
      const response = await axios.get('https://elec-zoho-backend-snowy.vercel.app/api/vendors/search', {
        params: { gstin, vendorName }
      });

      if (response.data.exists) {
        setVendorExists(true);
        setExistingVendorInfo(response.data.vendor);
      } else {
        setVendorExists(false);
      }
    } catch (error) {
      console.error('Failed to check vendor:', error);
      setVendorExists(null);
    } finally {
      setCheckingVendor(false);
    }
  };

  const handleFieldChange = (field: keyof VendorData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // If GSTIN changes, re-check vendor existence
    if (field === 'GSTIN_NUMBER' || field === 'gstin') {
      setTimeout(checkVendorExists, 500);
    }
  };

  const handleAdditionalFieldChange = (field: keyof typeof additionalVendorData, value: any) => {
    setAdditionalVendorData(prev => ({ ...prev, [field]: value }));
  };

  const handlePurchaseItemChange = (index: number, field: keyof PurchaseRequestItem, value: any) => {
    setPurchaseRequestData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handlePurchaseRequestChange = (field: keyof typeof purchaseRequestData, value: any) => {
    if (field === 'items') return;
    setPurchaseRequestData(prev => ({ ...prev, [field]: value }));
  };

  const addPurchaseItem = () => {
    setPurchaseRequestData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: '',
          sku: generateSKU(),
          quantity: 1,
          rate: 0,
          tax_percentage: 18,
          hsn_sac: '',
          description: '',
          unit: 'Nos'
        }
      ]
    }));
  };

  const removePurchaseItem = (index: number) => {
    if (purchaseRequestData.items.length > 1) {
      setPurchaseRequestData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const clearAllItems = () => {
    setPurchaseRequestData(prev => ({
      ...prev,
      items: []
    }));
  };

  const loadSampleItems = () => {
    const sampleItems = [
      {
        name: 'Laptop Dell XPS 13',
        sku: 'DLXPS1301',
        quantity: 5,
        rate: 85000,
        tax_percentage: 18,
        hsn_sac: '8471',
        description: 'Dell XPS 13 Laptop with 16GB RAM, 512GB SSD',
        unit: 'Nos'
      },
      {
        name: 'Wireless Mouse',
        sku: 'WM001',
        quantity: 10,
        rate: 1200,
        tax_percentage: 18,
        hsn_sac: '8471',
        description: 'Wireless Bluetooth Mouse',
        unit: 'Nos'
      },
      {
        name: 'USB-C Hub',
        sku: 'USBCHUB01',
        quantity: 8,
        rate: 2500,
        tax_percentage: 18,
        hsn_sac: '8543',
        description: '7-in-1 USB-C Hub with HDMI, USB ports',
        unit: 'Nos'
      }
    ];
    
    setPurchaseRequestData(prev => ({
      ...prev,
      items: [...sampleItems]
    }));
  };

  // Calculation functions
  const calculateItemTotal = (item: PurchaseRequestItem) => {
    const subtotal = item.quantity * item.rate;
    const tax = subtotal * (item.tax_percentage / 100);
    return subtotal + tax;
  };

  const calculateGrandTotal = () => {
    return purchaseRequestData.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateSubtotal = () => {
    return purchaseRequestData.items.reduce((total, item) => total + (item.quantity * item.rate), 0);
  };

  const calculateTotalTax = () => {
    return purchaseRequestData.items.reduce((total, item) => {
      const subtotal = item.quantity * item.rate;
      return total + (subtotal * (item.tax_percentage / 100));
    }, 0);
  };

  const copyJSON = () => {
    const allData = {
      vendorData: { ...data, ...additionalVendorData },
      purchaseRequestData: purchaseRequestData
    };
    navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateGSTIN = (gstin: string): boolean => {
    if (!gstin) return true;
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
        missing.push(field.replace(/_/g, ' '));
      }
    });

    // Validate purchase items if section is shown
    if (showPurchaseSection) {
      purchaseRequestData.items.forEach((item, index) => {
        if (!item.name || item.name.trim() === "") {
          missing.push(`Item ${index + 1} Name`);
        }
        if (item.quantity <= 0) {
          missing.push(`Item ${index + 1} Quantity (must be > 0)`);
        }
        if (item.rate < 0) {
          missing.push(`Item ${index + 1} Rate (must be >= 0)`);
        }
      });
    }

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
      
      // Combine vendor data with additional fields
      const completeVendorData = { ...data, ...additionalVendorData };
      formData.append("vendorData", JSON.stringify(completeVendorData));
      
      // Only send purchase request data if section is shown and has items
      if (showPurchaseSection && purchaseRequestData.items.some(item => item.name.trim() !== "")) {
        formData.append("purchaseRequestData", JSON.stringify(purchaseRequestData));
      }
      
      formData.append("processed_at", new Date().toISOString());

      const response = await axios.post(API_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" }
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

  // Helper functions
  const generateSupplierCode = (name: string): string => {
    if (!name) return "SUP";
    const parts = name.toUpperCase().split(/\s+/);
    return parts.slice(0, 3).map(w => w.charAt(0)).join("") || "SUP";
  };

  const generateSKU = (): string => {
    return 'SKU' + Math.floor(1000 + Math.random() * 9000);
  };

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6 relative">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Vendor "{data.Vendor_Name}" has been {vendorExists ? 'updated' : 'created'} successfully.
              {showPurchaseSection && purchaseRequestData.items.length > 0 && 
                ` Purchase request with ${purchaseRequestData.items.length} item(s) has also been created.`}
            </p>
            <div className="mb-8 p-4 bg-gray-50 rounded-xl text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">GSTIN:</span>
                <span className="font-bold">{data.GSTIN_NUMBER || 'Not provided'}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Supplier Code:</span>
                <span className="font-bold">{data.Supplier_Code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ${vendorExists ? 'text-blue-600' : 'text-green-600'}`}>
                  {vendorExists ? 'Updated Existing Vendor' : 'Created New Vendor'}
                </span>
              </div>
            </div>
            <button
              onClick={onReset}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-lg active:scale-95"
            >
              Create Another Vendor
            </button>
          </div>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Vendor Creation</h2>
          <p className="text-gray-500 text-sm font-medium">Extracted from: <span className="text-green-600 italic">{file.fileName}</span></p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-green-600 font-medium">
              ✓ AI extracted {aiExtractionSummary.vendorFields} vendor fields
              {aiExtractionSummary.itemsExtracted > 0 && ` and ${aiExtractionSummary.itemsExtracted} item(s)`}
            </p>
            {vendorExists !== null && (
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${vendorExists ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {vendorExists ? '⚠ Vendor Exists (Will Update)' : '✓ New Vendor'}
              </span>
            )}
          </div>
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
            disabled={submitting || checkingVendor}
            className={`px-8 py-2.5 ${vendorExists ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-100 text-sm flex items-center gap-2 ${submitting || checkingVendor ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {checkingVendor ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {vendorExists ? 'Updating...' : 'Creating...'}
              </>
            ) : vendorExists ? 'Update Vendor' : 'Create Vendor'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 font-medium">{submitError}</p>
        </div>
      )}

      {/* Vendor Exists Warning */}
      {vendorExists && existingVendorInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-yellow-800 mb-1">Vendor Already Exists!</p>
            <p className="text-sm text-yellow-700">
              Vendor with GSTIN <span className="font-bold">{data.GSTIN_NUMBER}</span> already exists in the system. 
              Clicking "Update Vendor" will update the existing record.
            </p>
            <div className="mt-2 text-xs text-yellow-600 space-y-1">
              <p>Existing Vendor: <span className="font-bold">{existingVendorInfo.Vendor_Name}</span></p>
              <p>Vendor ID: <span className="font-bold">{existingVendorInfo.id}</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Source Preview & Summary */}
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
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-green-800">AI Extraction Summary</span>
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Vendor Fields Extracted:</span>
                <span className="font-bold text-green-600">{aiExtractionSummary.vendorFields}/20</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Purchase Items Found:</span>
                <span className="font-bold text-blue-600">{aiExtractionSummary.itemsExtracted}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">AI Confidence:</span>
                <span className="font-bold">{Math.round(aiExtractionSummary.confidence * 100)}%</span>
              </div>
              {aiExtractionSummary.itemsExtracted > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs font-bold text-green-700 mb-2">Extracted Items Preview:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                    {result.purchaseRequestData?.items?.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border">
                        <div className="flex-1 truncate mr-2">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₹{item.rate.toLocaleString()}</span>
                          <span className="text-gray-500">× {item.quantity}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${item.tax_percentage > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {item.tax_percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {result.purchaseRequestData?.items && result.purchaseRequestData.items.length > 5 && (
                      <p className="text-xs text-gray-500 text-center pt-1">
                        + {result.purchaseRequestData.items.length - 5} more items
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Request Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm font-bold text-gray-700">Purchase Request</span>
                {aiExtractionSummary.itemsExtracted > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {aiExtractionSummary.itemsExtracted} items auto-extracted
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPurchaseSection}
                  onChange={(e) => setShowPurchaseSection(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              {showPurchaseSection 
                ? "Purchase request will be created with vendor"
                : "Only vendor will be created"}
            </p>
            {showPurchaseSection && (
              <div className="flex gap-2">
                <button
                  onClick={addPurchaseItem}
                  className="flex-1 text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
                {purchaseRequestData.items.length > 0 && (
                  <button
                    onClick={clearAllItems}
                    className="text-xs bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyJSON}
                className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Data
              </button>
              <button
                onClick={loadSampleItems}
                className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Sample Items
              </button>
            </div>
          </div>
        </div>

        {/* Right: Vendor Form & Purchase Request */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vendor Information Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Vendor Information</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  Auto-Extracted
                </span>
                {vendorExists && (
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">
                    Will Update
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <Section title="Basic Details">
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
                    required
                  />
                  <FormField
                    label="Website"
                    value={data.Website}
                    onChange={(v) => handleFieldChange("Website", v)}
                    placeholder="https://www.example.com"
                  />
                </div>
              </Section>

              {/* Tax Information */}
              <Section title="Tax & Registration">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <FormField
                    label="PAN Number"
                    value={additionalVendorData.panNumber}
                    onChange={(v) => handleAdditionalFieldChange("panNumber", v.toUpperCase())}
                    placeholder="ABCDE1234F"
                  />
                  <FormField
                    label="TAN Number"
                    value={additionalVendorData.tanNumber}
                    onChange={(v) => handleAdditionalFieldChange("tanNumber", v.toUpperCase())}
                    placeholder="ABCD12345E"
                  />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="msmeRegistered"
                      checked={additionalVendorData.msmeRegistered}
                      onChange={(e) => handleAdditionalFieldChange("msmeRegistered", e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <label htmlFor="msmeRegistered" className="text-sm text-gray-700">
                      MSME Registered
                    </label>
                  </div>
                  {additionalVendorData.msmeRegistered && (
                    <div className="flex-1">
                      <FormField
                        label="MSME Number"
                        value={additionalVendorData.msmeNumber}
                        onChange={(v) => handleAdditionalFieldChange("msmeNumber", v)}
                        placeholder="MSME registration number"
                      />
                    </div>
                  )}
                </div>
              </Section>

              {/* Address */}
              <Section title="Address Details">
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
              </Section>

              {/* Financial Details */}
              <Section title="Financial Settings">
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
                  <FormField
                    label="Credit Limit (₹)"
                    value={additionalVendorData.creditLimit}
                    onChange={(v) => handleAdditionalFieldChange("creditLimit", v)}
                    placeholder="0.00"
                    type="number"
                  />
                  <FormField
                    label="Credit Period (days)"
                    value={additionalVendorData.creditPeriod}
                    onChange={(v) => handleAdditionalFieldChange("creditPeriod", v)}
                    placeholder="30"
                    type="number"
                  />
                </div>
                <div className="space-y-1.5 mt-4">
                  <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Source</label>
                  <input
                    type="text"
                    value={data.Source}
                    onChange={(e) => handleFieldChange("Source", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="How was this vendor sourced?"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Vendor Category</label>
                    <select
                      value={additionalVendorData.vendorCategory}
                      onChange={(e) => handleAdditionalFieldChange("vendorCategory", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      <option value="">Select Category</option>
                      {VENDOR_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5 mt-4">
                  <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Description</label>
                  <textarea
                    value={data.Description}
                    onChange={(e) => handleFieldChange("Description", e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Additional notes about this vendor"
                  />
                </div>
              </Section>

              {/* Bank Details */}
              <Section title="Bank Details">
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
                </div>
              </Section>
            </div>
          </div>

          {/* Purchase Request Section */}
          {showPurchaseSection && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm font-bold text-gray-700">Purchase Request Details</span>
                  {aiExtractionSummary.itemsExtracted > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {aiExtractionSummary.itemsExtracted} items auto-extracted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600">
                    Total: ₹{calculateGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Purchase Request Settings */}
                <Section title="Purchase Request Settings">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Purchase Order Type</label>
                      <select
                        value={purchaseRequestData.purchase_order_type}
                        onChange={(e) => handlePurchaseRequestChange("purchase_order_type", e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        {PURCHASE_ORDER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Warehouse</label>
                      <select
                        value={purchaseRequestData.warehouse}
                        onChange={(e) => handlePurchaseRequestChange("warehouse", e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        {WAREHOUSE_OPTIONS.map(wh => <option key={wh} value={wh}>{wh}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Expected Delivery Date</label>
                      <input
                        type="date"
                        value={purchaseRequestData.expected_delivery_date}
                        onChange={(e) => handlePurchaseRequestChange("expected_delivery_date", e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Shipping Method</label>
                      <select
                        value={purchaseRequestData.shipping_method}
                        onChange={(e) => handlePurchaseRequestChange("shipping_method", e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">Select Method</option>
                        {SHIPPING_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <FormField
                      label="Requisition Number"
                      value={purchaseRequestData.requisition_number}
                      onChange={(v) => handlePurchaseRequestChange("requisition_number", v)}
                      placeholder="Internal requisition number"
                    />
                    <FormField
                      label="Project"
                      value={purchaseRequestData.project}
                      onChange={(v) => handlePurchaseRequestChange("project", v)}
                      placeholder="Project reference"
                    />
                    <FormField
                      label="Department"
                      value={purchaseRequestData.department}
                      onChange={(v) => handlePurchaseRequestChange("department", v)}
                      placeholder="Department reference"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <FormField
                      label="Approved By"
                      value={purchaseRequestData.approved_by}
                      onChange={(v) => handlePurchaseRequestChange("approved_by", v)}
                      placeholder="Approver name"
                    />
                    <FormField
                      label="Tag"
                      value={purchaseRequestData.tag}
                      onChange={(v) => handlePurchaseRequestChange("tag", v)}
                      placeholder="Purchase Request Tag"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <FormField
                      label="Exchange Rate"
                      value={purchaseRequestData.exchange_rate.toString()}
                      onChange={(v) => handlePurchaseRequestChange("exchange_rate", parseFloat(v) || 1)}
                      placeholder="1.0"
                      type="number"
                    />
                    <FormField
                      label="Shipping Terms"
                      value={purchaseRequestData.shipping_terms}
                      onChange={(v) => handlePurchaseRequestChange("shipping_terms", v)}
                      placeholder="Shipping terms"
                    />
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Terms & Conditions</label>
                    <textarea
                      value={purchaseRequestData.terms_and_conditions}
                      onChange={(e) => handlePurchaseRequestChange("terms_and_conditions", e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      placeholder="Terms and conditions"
                    />
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Notes</label>
                    <textarea
                      value={purchaseRequestData.notes}
                      onChange={(e) => handlePurchaseRequestChange("notes", e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      placeholder="Additional notes"
                    />
                  </div>
                </Section>

                {/* Purchase Items */}
                <Section title={`Purchase Items (${purchaseRequestData.items.length})`}>
                  {purchaseRequestData.items.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium mb-2">No items added yet</p>
                      <p className="text-sm text-gray-400 mb-6">Add items manually or AI will extract from document</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={addPurchaseItem}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          Add First Item
                        </button>
                        <button
                          onClick={loadSampleItems}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                          Load Sample Items
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {purchaseRequestData.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <h5 className="text-sm font-bold text-gray-700">
                                {item.name || `Item ${index + 1}`}
                              </h5>
                              {item.sku && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  SKU: {item.sku}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-green-600">
                                ₹{calculateItemTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              {purchaseRequestData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePurchaseItem(index)}
                                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                  title="Remove item"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Item Name *</label>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handlePurchaseItemChange(index, 'name', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter item name"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">SKU</label>
                              <input
                                type="text"
                                value={item.sku}
                                onChange={(e) => handlePurchaseItemChange(index, 'sku', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter SKU"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Unit</label>
                              <select
                                value={item.unit}
                                onChange={(e) => handlePurchaseItemChange(index, 'unit', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              >
                                {UNIT_OPTIONS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Quantity *</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) => handlePurchaseItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter quantity"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Rate (₹) *</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) => handlePurchaseItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter rate"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">Tax %</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={item.tax_percentage}
                                  onChange={(e) => handlePurchaseItemChange(index, 'tax_percentage', parseFloat(e.target.value) || 0)}
                                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  placeholder="Enter tax percentage"
                                />
                                <div className="flex gap-1">
                                  {TAX_RATES.map(rate => (
                                    <button
                                      key={rate}
                                      type="button"
                                      onClick={() => handlePurchaseItemChange(index, 'tax_percentage', rate)}
                                      className={`px-2 py-1 text-xs rounded-lg ${item.tax_percentage === rate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                      {rate}%
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">HSN/SAC Code</label>
                              <input
                                type="text"
                                value={item.hsn_sac}
                                onChange={(e) => handlePurchaseItemChange(index, 'hsn_sac', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter HSN/SAC code"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
                              Description
                            </label>
                            <textarea
                              value={item.description}
                              onChange={(e) => handlePurchaseItemChange(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                              placeholder="Item description"
                            />
                          </div>

                          {/* Item Summary */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-gray-500 text-xs">Quantity</p>
                                <p className="font-bold text-lg">{item.quantity} {item.unit}</p>
                              </div>
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-gray-500 text-xs">Rate</p>
                                <p className="font-bold text-lg">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                              </div>
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-gray-500 text-xs">Subtotal</p>
                                <p className="font-bold text-lg">₹{(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                              </div>
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-gray-500 text-xs">Tax ({item.tax_percentage}%)</p>
                                <p className="font-bold text-lg">₹{(item.quantity * item.rate * item.tax_percentage / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Item Button */}
                      <button
                        onClick={addPurchaseItem}
                        className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Another Item
                      </button>

                      {/* Grand Total Summary */}
                      {purchaseRequestData.items.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                          <h5 className="text-sm font-bold text-gray-700 mb-4">Purchase Request Summary</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">Total Items</p>
                              <p className="text-3xl font-bold text-blue-600">{purchaseRequestData.items.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                              <p className="text-3xl font-bold text-gray-800">₹{calculateSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">Total Tax</p>
                              <p className="text-3xl font-bold text-red-600">₹{calculateTotalTax().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                          <div className="pt-6 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-600">Grand Total</p>
                                <p className="text-4xl font-bold text-green-600">
                                  ₹{calculateGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Including {purchaseRequestData.items.length} item(s)</p>
                                <p className="text-xs text-gray-500 mt-1">Warehouse: {purchaseRequestData.warehouse}</p>
                                <p className="text-xs text-gray-500">Type: {purchaseRequestData.purchase_order_type}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Section>
              </div>
            </div>
          )}

          {/* Bottom Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || checkingVendor}
              className={`w-full py-5 ${vendorExists ? 'bg-yellow-600 shadow-yellow-100 hover:bg-yellow-700' : showPurchaseSection ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' : 'bg-green-600 shadow-green-100 hover:bg-green-700'} text-white font-extrabold rounded-3xl transition-all shadow-xl flex items-center justify-center gap-3 text-lg uppercase tracking-wider active:scale-[0.98] ${submitting || checkingVendor ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {checkingVendor ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking Vendor...
                </>
              ) : submitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {vendorExists 
                    ? showPurchaseSection ? 'Updating Vendor & Creating Purchase Request...' : 'Updating Vendor...'
                    : showPurchaseSection ? 'Creating Vendor & Purchase Request...' : 'Creating Vendor...'
                  }
                </>
              ) : (
                <>
                  {vendorExists 
                    ? showPurchaseSection ? 'Update Vendor & Create Purchase Request' : 'Update Vendor'
                    : showPurchaseSection ? 'Create Vendor & Purchase Request' : 'Create Vendor in System'
                  }
                  {showPurchaseSection && purchaseRequestData.items.length > 0 && (
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                      ₹{calculateGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>

          {/* Info Note */}
          <div className="bg-green-50/30 border border-green-100 p-4 rounded-2xl flex gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                <strong>Note:</strong> AI automatically extracts vendor details from the document. Review and edit any fields as needed. Required fields are marked with *.
              </p>
              {showPurchaseSection && aiExtractionSummary.itemsExtracted > 0 && (
                <p className="text-xs text-blue-600 leading-relaxed font-medium mt-1">
                  <strong>✓ Items Extracted:</strong> AI found {aiExtractionSummary.itemsExtracted} item(s) in the document. You can edit or add more items.
                </p>
              )}
              {vendorExists && (
                <p className="text-xs text-yellow-600 leading-relaxed font-medium mt-1">
                  <strong>⚠ Vendor Exists:</strong> This vendor already exists in the system. Clicking submit will update the existing vendor record.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Section Component
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider border-b pb-2">{title}</h4>
    {children}
  </div>
);

// Form Field Component
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