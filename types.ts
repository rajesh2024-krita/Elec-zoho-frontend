
export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  GROQ = 'GROQ'
}

// Add these to your existing types.ts file

export enum AppMode {
  CLAIM = 'CLAIM',
  VENDOR = 'VENDOR'
}

export interface VendorData {
  // Basic Information
  Vendor_Name: string;
  Email: string;
  Phone: string;
  Website: string;
  Owner_Name: string;
  CompanyBrand: string;
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
}

export interface VendorFileData {
  fileName: string;
  mimeType: string;
  previewUrl: string;
  originalFile: File;
  base64: string;
  textContent?: string;
}

export interface VendorExtractionResult {
  vendorData: VendorData;
  rawText: string;
  modelUsed: string;
  confidenceScore?: number;
}


// If you have a FileData interface for claims, make sure it's compatible:
export interface FileData {
  fileName: string;
  mimeType: string;
  previewUrl: string;
  originalFile: File;
  base64: string;
  textContent?: string;
}

// Update your existing AIConfig if needed to ensure it has Gemini key:
export interface AIConfig {
  provider: AIProvider;
  modelId: string;
  keys: {
    GEMINI: string;
    OPENAI: string;
    GROQ: string;
    // Add other providers if needed
  };
}

export type ClaimType =
  | 'General Information'
  | 'Price Drop'
  | 'Price List'
  | 'Monthly Scheme'
  | 'Goods Return'
  | 'Target Scheme'
  | 'DOA'
  | 'Other';

export type SchemeType = 'Sell In' | 'Sell Out' | '';

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface ClaimData {
  supplierName?: string;
  vendorName?: string;
  companyBrandName: string;
  claimType: ClaimType;
  schemeType: SchemeType;
  schemeStartDate: Date;
  schemeEndDate: Date;
  claimDetails: string;
  additionalFields?: CustomField[];
  claimMadeBy?: string;
  brandModel?: string;
  // NEW FIELDS FOR CALCULATIONS
  discountModels?: DiscountModel[];
  monthlySchemes?: MonthlyScheme[];
  calculations?: CalculationResult;

}
export interface ClaimDataAI {
  companyBrandName: string;
  claimType: ClaimType;
  schemeType: SchemeType;
  schemeStartDate: string;
  schemeEndDate: string;
  claimDetails: string;
  additionalFields?: CustomField[];
  claimMadeBy?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: AIProvider;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  VENDOR_RESULT = 'VENDOR_RESULT', // Add this
  PROCESSING_VENDOR = 'PROCESSING_VENDOR',
  ERROR = 'ERROR'
}

export interface ExtractionResult {
  claimData: ClaimData;
  rawText: string;
  modelUsed: string;
  brandModel?: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
  textContent?: string; // For .txt files
  originalFile: File; // 🔥 REQUIRED
}

export interface AIKeys {
  GEMINI?: string;
  OPENAI?: string;
  GROQ?: string;
}

// export interface AIConfig {
//   provider: AIProvider;
//   modelId: string;
//   keys: AIKeys;
// }

export const PROVIDER_MODELS: Record<AIProvider, ModelOption[]> = {
  [AIProvider.GEMINI]: [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fastest)', provider: AIProvider.GEMINI },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Most Accurate)', provider: AIProvider.GEMINI },
    { id: 'gemini-2.5-flash-lite-latest', name: 'Gemini 2.5 Flash Lite', provider: AIProvider.GEMINI }
  ],
  [AIProvider.OPENAI]: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: AIProvider.OPENAI },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: AIProvider.OPENAI }
  ],
  [AIProvider.GROQ]: [
    { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B Vision', provider: AIProvider.GROQ },
    { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', provider: AIProvider.GROQ }
  ]
};

export interface DiscountModel {
  sku?: string;
  modelName: string;
  fullPrice: number;
  discountPercentage: number;
  payoutAmount: number;
}

export interface MonthlyScheme {
  month: string;
  targetQuantity: number;
  achievedQuantity: number;
  payoutPerUnit: number;
  totalPayout: number;
}

export interface CalculationResult {
  fullPayment: number;
  totalDiscount: number;
  netPayment: number;
  monthlyPayouts: MonthlyScheme[];
  totalMonthlyPayout: number;
  finalPayment: number; // netPayment - totalMonthlyPayout
}

// In your types.ts file, add:
export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  loginTime: number | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}