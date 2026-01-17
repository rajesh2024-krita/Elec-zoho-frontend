
import { LocationKey } from './saletypes';

export const LOCATIONS: LocationKey[] = ['DB', 'DG', 'DH', 'DRS', 'DT', 'SM'];

export const DISCOUNTERS_BY_LOCATION: Record<string, string[]> = {
  'DB': ['DE', 'Bhawani', 'Sahil Khan'],
  'DG': ['DE', 'Bhawani', 'Sahil Khan'],
  'DRS': ['DE', 'Bhawani', 'Sahil Khan'],
  'SM': ['DE', 'Bhawani', 'Sahil Khan'],
  'DH': ['Ajay Rathore', 'Chandni Shrimali', 'Roopsingh Khass', 'Joginder Barasa', 'Dinesh Barasa', 'Yusuf Khan'],
  'DT': ['Milan Ji', 'Shweta', 'Jugal']
};

export const SALESMEN = ['Ankit Kumar', 'Rohan Singh', 'Vikas Sharma', 'Suresh Gupta', 'Priya Verma'];

export const CATEGORIES = ['Air Conditioner', 'Atta Chakki', 'CCTV', 'Chimney', 'Geyser', 'Washing Machine', 'Refrigerator'];

export const SPIN_PERCENTS = ['-Select-', '5%', '10%', '15%', '20%', '25%'];

export const ONE_ASSIST_PLANS = ['-Select-', 'Plan A', 'Plan B', 'Plan C'];

export const PAYMENT_MODES = ['Cash', 'Credit Card', 'Debit Card', 'PayTM', 'Cheque', 'Other'];

export const BANKS = [
  'AXIS Bank', 'Andhra Bank', 'Bank Of India', 'Canara Bank', 'DCB Bank', 'HDFC Bank', 'ICICI Bank',
  'IDFC Bank', 'INDUSIND Bank', 'OTHER', 'PNB Bank', 'SBI Bank', 'Standard Chartered Bank',
  'UNION BANK OF INDIA', 'VIJAYA BANK', 'YES BANK'
];

export const MOCK_PRODUCTS = [
  { name: 'Multimeter Digital', sku: 'DE-MM-001', rate: 1250 },
  { name: 'Oscilloscope 100MHz', sku: 'DE-OSC-100', rate: 24500 },
  { name: 'Soldering Station', sku: 'DE-SS-75W', rate: 3200 },
  { name: 'DC Power Supply', sku: 'DE-PS-30V', rate: 8900 },
  { name: 'Logic Analyzer', sku: 'DE-LA-16CH', rate: 15600 }
];
