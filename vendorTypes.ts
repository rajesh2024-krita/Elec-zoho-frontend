// vendorTypes.ts
export interface VendorData {
  Vendor_Name: string;
  Email: string;
  Phone: string;
  Website: string;
  Owner_Name: string;
  Supplier_Code: string;
  Vendor_Owner: string;
  Payment_Terms: string;
  Currency: string;
  Source: string;
  GSTIN_NUMBER: string;
  Type_of_Supplier: string;
  Street: string;
  City: string;
  State: string;
  Zip_Code: string;
  Country: string;
  Description: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  gstin: string;
}

export interface PurchaseRequestItem {
  name: string;
  sku: string;
  quantity: number;
  rate: number;
  tax_percentage: number;
  hsn_sac: string;
  description: string;
  unit: string;
  total?: number;
}

export interface PurchaseRequestData {
  items: PurchaseRequestItem[];
  warehouse: string;
  expected_delivery_date: string;
  tag: string;
  exchange_rate: number;
}

export interface VendorFileData {
  fileName: string;
  fileSize: number;
  mimeType: string;
  previewUrl: string;
  originalFile: File;
  base64: string;
  textContent?: string;
}

export interface VendorExtractionResult {
  vendorData: VendorData;
  purchaseRequestData: PurchaseRequestData;
  rawText: string;
  modelUsed: string;
  confidenceScore: number;
  extractedText?: string;
}