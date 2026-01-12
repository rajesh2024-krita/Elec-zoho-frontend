// vendorTypes.ts
export interface VendorData {
  // Basic Information
  Vendor_Name: string;
  Email: string;
  Phone: string;
  Website: string;
  Owner_Name: string;
  CompanyBrand: number;
  Supplier_Code: string;
  Vendor_Owner: string;
  Payment_Terms: string;
  Currency: string;
  Source: string;
  
  // Tax Information
  GSTIN_NUMBER: string;
  Type_of_Supplier: string;
  
  // Address
  Street: string;
  City: string;
  State: string;
  Zip_Code: string;
  Country: string;
  
  // Additional
  Description: string;
  extractedText?: string;
  originalFile?: File;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  gstin: string;
}

export interface VendorExtractionResult {
  vendorData: VendorData;
  rawText: string;
  modelUsed: string;
  confidenceScore?: number;
}

export interface VendorFileData {
  fileName: string;
  mimeType: string;
  previewUrl: string;
  originalFile: File;
  base64: string;
  textContent?: string;
}