export interface FinanceCustomer {
  firstName: string;
  lastName: string;
  fathersName: string;
  mobileNumber: string;
  contactNumber: string;
  email: string;
  secondaryEmail: string;
  address: string;
  district: string;
  location: string;
  officeName: string;
  officeAddress: string;
}

export interface FinanceFinancial {
  billAmount: number;
  approxAdvance: number;
  balance: number;
  bankAmount: number;
  cashAmount: number;
  cardAmount: number;
  chequeAmount: number;
  downPayment1: number;
  downPayment2: number;
  downPayment3: number;
  downPayment4: number;
  downPayment5: number;
  modeOfPayment: string;
  financeBy1: string;
  financeBy: string[];
  emiStartDate: string;
  emiEndDate: string;
  limit: number;
  limitApproved: boolean;
}

export interface FinanceProducts {
  sku1: string;
  sku2: string;
  sku3: string;
  sku4: string;
  sku5: string;
  modelNo: string;
  modelNo2: string;
  modelNo3: string;
  modelNo4: string;
  modelNo5: string;
  serialNo: string;
  serialNumber2: string;
  serialNo3: string;
  serialNo4: string;
  serialNo5: string;
  rate1: number;
  rate2: number;
  rate3: number;
  rate4: number;
  rate5: number;
  prodCategory: string;
  multiProduct: boolean;
}

export interface FinanceDelivery {
  delivery: boolean;
  deliveryOn: string;
  deliveryLater: boolean;
  delivered: boolean;
  okForDelivery: boolean;
  locationOfDelivery: string;
}

export interface FinanceSchemes {
  schemeOffered: string;
  schemeNumber: string;
  giftName: string;
  giftNumber: string;
  giftsOnAir: string;
  spinWheelGifts: string;
  rs1000Cashback: boolean;
  rs2000Cashback: boolean;
  redeemed: boolean;
  redeemedCashback: number;
}

export interface FinanceClaims {
  claimNo1: string;
  claimNo2: string;
  claimNo3: string;
  claimNo4: string;
  claimNo5: string;
  deliveredCompanyScheme: boolean;
  deliveredDDS: boolean;
}

export interface FinanceMetadata {
  tokenNumber: string;
  trialID: string;
  invoiceNumber: string;
  salesOrderNumber: string;
  owner: string;
  stage: string;
}

export interface FinanceState {
  customer: FinanceCustomer;
  financial: FinanceFinancial;
  products: FinanceProducts;
  delivery: FinanceDelivery;
  schemes: FinanceSchemes;
  claims: FinanceClaims;
  metadata: FinanceMetadata;
  contactsLookup: string;
  recordImage: File | null;
  isSubmitting: boolean;
}