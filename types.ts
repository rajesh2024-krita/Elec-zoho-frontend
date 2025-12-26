
export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  GROQ = 'GROQ'
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
  supplierName: string;
  vendorName: string;
  companyBrandName: string;
  claimType: ClaimType;
  schemeType: SchemeType;
  schemeStartDate: string;
  schemeEndDate: string;
  claimDetails: string;
  additionalFields?: CustomField[];
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
  ERROR = 'ERROR'
}

export interface ExtractionResult {
  claimData: ClaimData;
  rawText: string;
  modelUsed: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
  textContent?: string; // For .txt files
}

export interface AIKeys {
  GEMINI?: string;
  OPENAI?: string;
  GROQ?: string;
}

export interface AIConfig {
  provider: AIProvider;
  modelId: string;
  keys: AIKeys;
}

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
