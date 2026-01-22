
export interface Contact {
  mobile: string;
  firstName: string;
  lastName: string;
  email: string;
  alternateNumber: string;
  address: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  rate: string;
}

export type LocationKey = 'DB' | 'DG' | 'DH' | 'DRS' | 'DT' | 'SM';


// Update LineItem type in saletypes.ts
export interface LineItem {
  id: string;
  category: string;
  brand: string;
  productName: string;
  modelNo: string;
  sku: string;
  rate: string;
  quantity: number;
  oneAssist: string;
  oneAssistAmount: number;
  spinPercent: string;
  serialNo: string;
  installationRequired: boolean;
  installationPaidBy: string;
}

export interface BillingState {
  customer: Contact;
  selectedContactId: string | null;
  gstInputClaim: boolean;
  gstNumber: string;
  multiProduct: boolean;
  salesman1: string;
  salesman2: string;
  salesman3: string;
  deliveryLater: boolean;
  deliveryDate: string;
  underExchange: boolean;
  exchangeInfo: string;
  diwaliSpinWin: boolean;
  discount: boolean;
  discountAmount: number;
  discountApprover: string;
  discountSignature: string;
  products: LineItem[];
  // Add additional product fields for multi-product
  product2?: string;
  product3?: string;
  product4?: string;
  product5?: string;
  modelNo2?: string;
  modelNo3?: string;
  modelNo4?: string;
  modelNo5?: string;
  rate2?: string;
  rate3?: string;
  rate4?: string;
  rate5?: string;
  sku2?: string;
  sku3?: string;
  sku4?: string;
  sku5?: string;
  schemeNo: string;
  giftAmount: number;
  paymentMode: string;
  paymentOther: string;
  bank: string;
  additionalInfo: string;
  isSearching: boolean;
  isSubmitting: boolean;
}