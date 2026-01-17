
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

export type LocationKey = 'DB' | 'DG' | 'DH' | 'DRS' | 'DT' | 'SM';

export interface BillingState {
  customer: Contact;
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
  schemeNo: string;
  giftAmount: number;
  paymentMode: string;
  paymentOther: string;
  bank: string;
  additionalInfo: string;
  isSearching: boolean;
  isSubmitting: boolean;
}
