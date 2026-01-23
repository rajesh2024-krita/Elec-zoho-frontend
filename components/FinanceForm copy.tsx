import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Banknote,
  Percent,
  Gift,
  Truck,
  FileText,
  ChevronRight,
  Phone,
  Mail,
  Building,
  Home,
  Package,
  Truck as TruckIcon,
  Award,
  FileCheck,
  Tag,
  Smartphone,
  Monitor,
  Tv,
  Wind,
  ShoppingBag,
  Percent as PercentIcon,
  Package2,
  Target,
  Gift as GiftIcon
} from 'lucide-react';

// Types for Trail Record
interface TrailRecord {
  id: string;
  Name: string;
  Last_Name: string;
  Fathers_Name: string;
  Mobile_Number: string;
  Contact_Number: string;
  Email: string;
  Secondary_Email: string;
  Address: string;
  District: string;
  Location: string;
  Office_Name: string;
  Office_Address: string;
  Bill_Amount: number;
  Approx_Advance: number;
  Balance: number;
  Bank_Amt: number;
  Total_Cash_Received: number;
  Other_Payment_mode_recd: number;
  Cheque_Amt: number;
  Down_Payment_1: number;
  Down_Payment_2: number;
  Down_Payment_3: number;
  Down_Payment_4: number;
  Down_Payment_5: number;
  Mode_Of_Payment: string;
  Finance_By1: string;
  Finance_By: string;
  EMI_Start_Date: string;
  EMI_End_Date: string;
  Limit: number;
  Limit_Approved: boolean;
  SKU1: string;
  SKU2: string;
  SKU3: string;
  SKU4: string;
  SKU5: string;
  Model_No: string;
  Model_No_2: string;
  Model_No_3: string;
  Model_No_4: string;
  Model_No_5: string;
  Serial_No: string;
  Serial_Number_2: string;
  Serial_No_3: string;
  Serial_No_4: string;
  Serial_No_5: string;
  Rate_1: number;
  Rate_2: number;
  Rate_3: number;
  Rate_4: number;
  Rate_5: number;
  Prod_Category: string;
  Multi_Product: boolean;
  Delivery: boolean;
  Delivery_On: string;
  Delivery_Later: boolean;
  Delivered: boolean;
  Ok_for_Delivery: boolean;
  Location_Of_Delivery: string;
  Scheme_Offered: string;
  Scheme_Number: string;
  Gift_Name: string;
  Gift_Number: string;
  Gifts_on_Air: string;
  Spin_Wheel_Gifts: string;
  Rs_1000_Cashback: boolean;
  Rs_2000_Cashback: boolean;
  Redeemed: boolean;
  Redeemed_Cashback: number;
  Claim_No_1: string;
  Claim_No_2: string;
  Claim_No_3: string;
  Claim_No_4: string;
  Claim_No_5: string;
  Delivered_Company_Scheme: boolean;
  Delivered_DDS: boolean;
  Toeken_number: string;
  Trial_ID: string;
  INVOICE_NUMBER: string;
  Sales_Order_Number: string;
  Owner: string;
  Stage: string;
  Contacts: string;
  // NEW FIELDS FROM FORM NO. 26 (Existing Customer)
  Date_Of_Birth: string;
  Alternate_Number: string;
  Address_Type: string;
  Salesman_Name: string;
  Salesman_Name_2: string;
  Company_Brand: string;
  Discount1: boolean;
  Under_Exchange: boolean;
  Previous_Loan: boolean;
  One_Assist: string;
  One_Assist_Amount: number;
  Diwali_2024_Spin: string;
  Gift_Contribution: string;
  Gift_Offer: string | string[];
}

interface FinanceState {
  // Customer Details
  Name: string;
  Last_Name: string;
  Fathers_Name: string;
  Mobile_Number: string;
  Contact_Number: string;
  Email: string;
  Secondary_Email: string;
  Address: string;
  District: string;
  Location: string;
  Office_Name: string;
  Office_Address: string;
  Contacts: string;
  Date_Of_Birth: string;
  Alternate_Number: string;
  Address_Type: string;
  Salesman_Name: string;
  Salesman_Name_2: string;

  // Financial Details
  Bill_Amount: number;
  Approx_Advance: number;
  Balance: number;
  Bank_Amt: number;
  Total_Cash_Received: number;
  Other_Payment_mode_recd: number;
  Cheque_Amt: number;
  Down_Payment_1: number;
  Down_Payment_2: number;
  Down_Payment_3: number;
  Down_Payment_4: number;
  Down_Payment_5: number;
  Mode_Of_Payment: string;
  Finance_By1: string;
  Finance_By: string[];
  EMI_Start_Date: string;
  EMI_End_Date: string;
  Limit: number;
  Limit_Approved: boolean;

  // Product Details
  SKU1: string;
  SKU2: string;
  SKU3: string;
  SKU4: string;
  SKU5: string;
  Model_No: string;
  Model_No_2: string;
  Model_No_3: string;
  Model_No_4: string;
  Model_No_5: string;
  Serial_No: string;
  Serial_Number_2: string;
  Serial_No_3: string;
  Serial_No_4: string;
  Serial_No_5: string;
  Rate_1: number;
  Rate_2: number;
  Rate_3: number;
  Rate_4: number;
  Rate_5: number;
  Prod_Category: string;
  Multi_Product: boolean;
  Company_Brand: string;
  Discount1: boolean;
  Under_Exchange: boolean;
  Previous_Loan: boolean;
  One_Assist: string;
  One_Assist_Amount: number;
  Diwali_2024_Spin: string;

  // Delivery Details
  Delivery: boolean;
  Delivery_On: string;
  Delivery_Later: boolean;
  Delivered: boolean;
  Ok_for_Delivery: boolean;
  Location_Of_Delivery: string;

  // Scheme & Gift Details
  Scheme_Offered: string;
  Scheme_Number: string;
  Gift_Name: string;
  Gift_Number: string;
  Gifts_on_Air: string;
  Spin_Wheel_Gifts: string;
  Rs_1000_Cashback: boolean;
  Rs_2000_Cashback: boolean;
  Redeemed: boolean;
  Redeemed_Cashback: number;
  Gift_Contribution: string;
  Gift_Offer: string[];

  // Claim Details
  Claim_No_1: string;
  Claim_No_2: string;
  Claim_No_3: string;
  Claim_No_4: string;
  Claim_No_5: string;
  Delivered_Company_Scheme: boolean;
  Delivered_DDS: boolean;

  // Metadata
  Toeken_number: string;
  Trial_ID: string;
  INVOICE_NUMBER: string;
  Sales_Order_Number: string;
  Owner: string;
  Stage: string;

  // File
  Record_Image: File | null;

  // UI State
  isSearching: boolean;
  isSubmitting: boolean;
  selectedRecordId: string | null;
  searchMessage: string;
}

const FinanceForm: React.FC = () => {
  const [state, setState] = useState<FinanceState>({
    // Customer Details
    Name: '',
    Last_Name: '',
    Fathers_Name: '',
    Mobile_Number: '',
    Contact_Number: '',
    Email: '',
    Secondary_Email: '',
    Address: '',
    District: '',
    Location: '',
    Office_Name: '',
    Office_Address: '',
    Contacts: '',
    Date_Of_Birth: '',
    Alternate_Number: '',
    Address_Type: '',
    Salesman_Name: '',
    Salesman_Name_2: '',

    // Financial Details
    Bill_Amount: 0,
    Approx_Advance: 0,
    Balance: 0,
    Bank_Amt: 0,
    Total_Cash_Received: 0,
    Other_Payment_mode_recd: 0,
    Cheque_Amt: 0,
    Down_Payment_1: 0,
    Down_Payment_2: 0,
    Down_Payment_3: 0,
    Down_Payment_4: 0,
    Down_Payment_5: 0,
    Mode_Of_Payment: 'Cash',
    Finance_By1: '',
    Finance_By: [],
    EMI_Start_Date: '',
    EMI_End_Date: '',
    Limit: 0,
    Limit_Approved: false,

    // Product Details
    SKU1: '',
    SKU2: '',
    SKU3: '',
    SKU4: '',
    SKU5: '',
    Model_No: '',
    Model_No_2: '',
    Model_No_3: '',
    Model_No_4: '',
    Model_No_5: '',
    Serial_No: '',
    Serial_Number_2: '',
    Serial_No_3: '',
    Serial_No_4: '',
    Serial_No_5: '',
    Rate_1: 0,
    Rate_2: 0,
    Rate_3: 0,
    Rate_4: 0,
    Rate_5: 0,
    Prod_Category: '',
    Multi_Product: false,
    Company_Brand: '',
    Discount1: false,
    Under_Exchange: false,
    Previous_Loan: false,
    One_Assist: '',
    One_Assist_Amount: 0,
    Diwali_2024_Spin: '',

    // Delivery Details
    Delivery: false,
    Delivery_On: '',
    Delivery_Later: false,
    Delivered: false,
    Ok_for_Delivery: false,
    Location_Of_Delivery: '',

    // Scheme & Gift Details
    Scheme_Offered: '',
    Scheme_Number: '',
    Gift_Name: '',
    Gift_Number: '',
    Gifts_on_Air: '',
    Spin_Wheel_Gifts: '',
    Rs_1000_Cashback: false,
    Rs_2000_Cashback: false,
    Redeemed: false,
    Redeemed_Cashback: 0,
    Gift_Contribution: '',
    Gift_Offer: [],

    // Claim Details
    Claim_No_1: '',
    Claim_No_2: '',
    Claim_No_3: '',
    Claim_No_4: '',
    Claim_No_5: '',
    Delivered_Company_Scheme: false,
    Delivered_DDS: false,

    // Metadata
    Toeken_number: generateTokenNumber(),
    Trial_ID: '',
    INVOICE_NUMBER: '',
    Sales_Order_Number: '',
    Owner: '',
    Stage: 'New',

    // File
    Record_Image: null,

    // UI State
    isSearching: false,
    isSubmitting: false,
    selectedRecordId: null,
    searchMessage: ''
  });

  const [trailSuggestions, setTrailSuggestions] = useState<TrailRecord[]>([]);
  const [showTrailDropdown, setShowTrailDropdown] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate Token Number
  function generateTokenNumber() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `TR${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  // Calculate Balance
  useEffect(() => {
    const balance = state.Bill_Amount - state.Approx_Advance;
    setState(prev => ({ ...prev, Balance: balance }));
  }, [state.Bill_Amount, state.Approx_Advance]);

  // Search Trail Records by Mobile Number
  const handleTrailSearch = async () => {
    if (state.Mobile_Number.length !== 10) {
      setState(prev => ({ ...prev, searchMessage: 'Please enter a valid 10-digit mobile number' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      searchMessage: '',
      selectedRecordId: null
    }));
    setTrailSuggestions([]);
    setShowTrailDropdown(false);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://elec-zoho-backend-snowy.vercel.app/api'}/trail/search?mobile=${state.Mobile_Number}`
      );

      const data = await response.json();

      if (data.success) {
        if (data.records && data.records.length > 0) {
          setTrailSuggestions(data.records);
          setShowTrailDropdown(true);

          if (data.records.length === 1) {
            // Auto-select if only one record found
            handleSelectTrailRecord(data.records[0]);
          } else {
            setState(prev => ({
              ...prev,
              searchMessage: `Found ${data.records.length} records in Trail. Select one to load data.`
            }));
          }
        } else {
          setTrailSuggestions([]);
          setShowTrailDropdown(false);
          setState(prev => ({
            ...prev,
            searchMessage: 'No existing record found in Trail. Fill details to create new.'
          }));
        }
      } else {
        setState(prev => ({ ...prev, searchMessage: 'Error searching Trail records' }));
      }
    } catch (error) {
      console.error('Trail search error:', error);
      setState(prev => ({ ...prev, searchMessage: 'Error connecting to server' }));
    } finally {
      setState(prev => ({ ...prev, isSearching: false }));
    }
  };

  const handleSelectTrailRecord = (record: TrailRecord) => {
    // Helper function to convert Zoho's "Yes"/"No" to boolean
    const formatTextToBoolean = (value: any): boolean => {
      if (typeof value === 'string') {
        return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
      }
      return !!value;
    };

    // Helper to parse Gift_Offer (could be string or array)
    const parseGiftOffer = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          return value.split(',').map((v: string) => v.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Populate fields from existing record BUT generate new token
    setState(prev => ({
      ...prev,
      // Customer Details (from existing record)
      Name: record.Name || '',
      Last_Name: record.Last_Name || '',
      Fathers_Name: record.Fathers_Name || '',
      Mobile_Number: record.Mobile_Number || '',
      Contact_Number: record.Contact_Number || '',
      Email: record.Email || '',
      Secondary_Email: record.Secondary_Email || '',
      Address: record.Address || '',
      District: record.District || '',
      Location: record.Location || '',
      Office_Name: record.Office_Name || '',
      Office_Address: record.Office_Address || '',
      Contacts: record.Contacts || '',
      Date_Of_Birth: record.Date_Of_Birth || '',
      Alternate_Number: record.Alternate_Number || '',
      Address_Type: record.Address_Type || '',
      Salesman_Name: record.Salesman_Name || '',
      Salesman_Name_2: record.Salesman_Name_2 || '',

      // Financial Details
      Bill_Amount: record.Bill_Amount || 0,
      Approx_Advance: record.Approx_Advance || 0,
      Balance: record.Balance || 0,
      Bank_Amt: record.Bank_Amt || 0,
      Total_Cash_Received: record.Total_Cash_Received || 0,
      Other_Payment_mode_recd: record.Other_Payment_mode_recd || 0,
      Cheque_Amt: record.Cheque_Amt || 0,
      Down_Payment_1: record.Down_Payment_1 || 0,
      Down_Payment_2: record.Down_Payment_2 || 0,
      Down_Payment_3: record.Down_Payment_3 || 0,
      Down_Payment_4: record.Down_Payment_4 || 0,
      Down_Payment_5: record.Down_Payment_5 || 0,
      Mode_Of_Payment: record.Mode_Of_Payment || 'Cash',
      Finance_By1: record.Finance_By1 || '',
      Finance_By: record.Finance_By ? record.Finance_By.split(',').map((item: string) => item.trim()) : [],
      EMI_Start_Date: record.EMI_Start_Date || '',
      EMI_End_Date: record.EMI_End_Date || '',
      Limit: record.Limit || 0,
      Limit_Approved: formatTextToBoolean(record.Limit_Approved),

      // Product Details
      SKU1: record.SKU1 || '',
      SKU2: record.SKU2 || '',
      SKU3: record.SKU3 || '',
      SKU4: record.SKU4 || '',
      SKU5: record.SKU5 || '',
      Model_No: record.Model_No || '',
      Model_No_2: record.Model_No_2 || '',
      Model_No_3: record.Model_No_3 || '',
      Model_No_4: record.Model_No_4 || '',
      Model_No_5: record.Model_No_5 || '',
      Serial_No: record.Serial_No || '',
      Serial_Number_2: record.Serial_Number_2 || '',
      Serial_No_3: record.Serial_No_3 || '',
      Serial_No_4: record.Serial_No_4 || '',
      Serial_No_5: record.Serial_No_5 || '',
      Rate_1: record.Rate_1 || 0,
      Rate_2: record.Rate_2 || 0,
      Rate_3: record.Rate_3 || 0,
      Rate_4: record.Rate_4 || 0,
      Rate_5: record.Rate_5 || 0,
      Prod_Category: record.Prod_Category || '',
      Multi_Product: formatTextToBoolean(record.Multi_Product),
      Company_Brand: record.Company_Brand || '',
      Discount1: formatTextToBoolean(record.Discount1),
      Under_Exchange: formatTextToBoolean(record.Under_Exchange),
      Previous_Loan: formatTextToBoolean(record.Previous_Loan),
      One_Assist: record.One_Assist || '',
      One_Assist_Amount: record.One_Assist_Amount || 0,
      Diwali_2024_Spin: record.Diwali_2024_Spin || '',

      // Delivery Details - convert from text to boolean
      Delivery: formatTextToBoolean(record.Delivery),
      Delivery_On: record.Delivery_On || '',
      Delivery_Later: formatTextToBoolean(record.Delivery_Later),
      Delivered: formatTextToBoolean(record.Delivered),
      Ok_for_Delivery: formatTextToBoolean(record.Ok_for_Delivery),
      Location_Of_Delivery: record.Location_Of_Delivery || '',

      // Scheme Details
      Scheme_Offered: record.Scheme_Offered || '',
      Scheme_Number: record.Scheme_Number || '',
      Gift_Name: record.Gift_Name || '',
      Gift_Number: record.Gift_Number || '',
      Gifts_on_Air: record.Gifts_on_Air || '',
      Spin_Wheel_Gifts: record.Spin_Wheel_Gifts || '',
      Rs_1000_Cashback: formatTextToBoolean(record.Rs_1000_Cashback),
      Rs_2000_Cashback: formatTextToBoolean(record.Rs_2000_Cashback),
      Redeemed: formatTextToBoolean(record.Redeemed),
      Redeemed_Cashback: record.Redeemed_Cashback || 0,
      Gift_Contribution: record.Gift_Contribution || '',
      Gift_Offer: parseGiftOffer(record.Gift_Offer),

      // Claim Details
      Claim_No_1: record.Claim_No_1 || '',
      Claim_No_2: record.Claim_No_2 || '',
      Claim_No_3: record.Claim_No_3 || '',
      Claim_No_4: record.Claim_No_4 || '',
      Claim_No_5: record.Claim_No_5 || '',
      Delivered_Company_Scheme: formatTextToBoolean(record.Delivered_Company_Scheme),
      Delivered_DDS: formatTextToBoolean(record.Delivered_DDS),

      // Generate NEW token number for the new record
      Toeken_number: generateTokenNumber(),

      // Reset other metadata fields to avoid updating existing record
      Trial_ID: '',
      INVOICE_NUMBER: '',
      Sales_Order_Number: '',
      Owner: '', // Reset Owner to avoid issues
      Stage: 'New',

      // Reset file
      Record_Image: null,

      searchMessage: `✓ Loaded details from existing record. Creating NEW record with new token: ${generateTokenNumber()}`
    }));

    setShowTrailDropdown(false);
  };

  const handleNewRecord = () => {
    // Reset form but keep mobile number
    const mobile = state.Mobile_Number;

    setState({
      // Reset all fields
      Name: '',
      Last_Name: '',
      Fathers_Name: '',
      Mobile_Number: mobile, // Keep mobile
      Contact_Number: '',
      Email: '',
      Secondary_Email: '',
      Address: '',
      District: '',
      Location: '',
      Office_Name: '',
      Office_Address: '',
      Contacts: '',
      Date_Of_Birth: '',
      Alternate_Number: '',
      Address_Type: '',
      Salesman_Name: '',
      Salesman_Name_2: '',

      Bill_Amount: 0,
      Approx_Advance: 0,
      Balance: 0,
      Bank_Amt: 0,
      Total_Cash_Received: 0,
      Other_Payment_mode_recd: 0,
      Cheque_Amt: 0,
      Down_Payment_1: 0,
      Down_Payment_2: 0,
      Down_Payment_3: 0,
      Down_Payment_4: 0,
      Down_Payment_5: 0,
      Mode_Of_Payment: 'Cash',
      Finance_By1: '',
      Finance_By: [],
      EMI_Start_Date: '',
      EMI_End_Date: '',
      Limit: 0,
      Limit_Approved: false,

      SKU1: '',
      SKU2: '',
      SKU3: '',
      SKU4: '',
      SKU5: '',
      Model_No: '',
      Model_No_2: '',
      Model_No_3: '',
      Model_No_4: '',
      Model_No_5: '',
      Serial_No: '',
      Serial_Number_2: '',
      Serial_No_3: '',
      Serial_No_4: '',
      Serial_No_5: '',
      Rate_1: 0,
      Rate_2: 0,
      Rate_3: 0,
      Rate_4: 0,
      Rate_5: 0,
      Prod_Category: '',
      Multi_Product: false,
      Company_Brand: '',
      Discount1: false,
      Under_Exchange: false,
      Previous_Loan: false,
      One_Assist: '',
      One_Assist_Amount: 0,
      Diwali_2024_Spin: '',

      Delivery: false,
      Delivery_On: '',
      Delivery_Later: false,
      Delivered: false,
      Ok_for_Delivery: false,
      Location_Of_Delivery: '',

      Scheme_Offered: '',
      Scheme_Number: '',
      Gift_Name: '',
      Gift_Number: '',
      Gifts_on_Air: '',
      Spin_Wheel_Gifts: '',
      Rs_1000_Cashback: false,
      Rs_2000_Cashback: false,
      Redeemed: false,
      Redeemed_Cashback: 0,
      Gift_Contribution: '',
      Gift_Offer: [],

      Claim_No_1: '',
      Claim_No_2: '',
      Claim_No_3: '',
      Claim_No_4: '',
      Claim_No_5: '',
      Delivered_Company_Scheme: false,
      Delivered_DDS: false,

      Toeken_number: generateTokenNumber(),
      Trial_ID: '',
      INVOICE_NUMBER: '',
      Sales_Order_Number: '',
      Owner: '',
      Stage: 'New',

      Record_Image: null,

      isSearching: false,
      isSubmitting: false,
      selectedRecordId: null,
      searchMessage: 'Creating new Trail record. Fill details below.'
    });

    setShowTrailDropdown(false);
    setTrailSuggestions([]);
  };

  // Handle File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setState(prev => ({ ...prev, Record_Image: e.target.files![0] }));
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!state.Mobile_Number || state.Mobile_Number.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!state.Name) {
      alert('Please enter customer name');
      return;
    }

    if (!state.Bill_Amount || state.Bill_Amount <= 0) {
      alert('Please enter valid bill amount');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Prepare FormData
      const formData = new FormData();

      // Add all fields to FormData
      Object.keys(state).forEach(key => {
        if (key !== 'Record_Image' && key !== 'isSearching' && key !== 'isSubmitting' &&
          key !== 'selectedRecordId' && key !== 'searchMessage') {
          const value = state[key as keyof FinanceState];
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      if (state.Record_Image) {
        formData.append('Record_Image', state.Record_Image);
      }

      // Determine endpoint based on whether updating or creating
      const endpoint = '/trail/create';

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://elec-zoho-backend-snowy.vercel.app/api'}${endpoint}`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const inputClass = "w-full border border-gray-300 px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-gray-500 rounded-sm";
  const labelClass = "block mb-1 font-semibold text-gray-800 text-sm";
  const selectClass = "w-full border border-gray-300 px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer rounded-sm";
  const checkboxLabelClass = "flex items-center gap-2 cursor-pointer text-gray-800 font-medium select-none";
  const sectionHeaderClass = "text-xl font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-2xl p-10 text-center rounded-sm border border-gray-200">
          <CheckCircle2 size={60} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {state.selectedRecordId ? 'Trail Record Updated!' : 'New Trail Record Created!'}
          </h2>
          <p className="text-gray-700 mb-6">
            Form No. 26 has been successfully {state.selectedRecordId ? 'updated in' : 'added to'} Trail.
          </p>
          <div className="space-y-3 mb-6">
            <div className="text-left bg-gray-50 p-4 rounded">
              <div className="font-bold">Token Number:</div>
              <div className="text-lg font-mono text-green-600">{state.Toeken_number}</div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded shadow-md hover:bg-green-700 transition-colors"
          >
            Create New Record
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-sm overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#1a472a] text-white px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Wallet size={24} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Form No. 26 - Finance</h1>
              <div className="text-sm opacity-90">Complete Trail Module</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {state.selectedRecordId && (
              <div className="text-sm bg-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={14} /> Updating Record
              </div>
            )}
            <div className="text-sm bg-gray-700 px-3 py-1 rounded-full">
              Token: {state.Toeken_number}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Mobile Search Section */}
          <div className="border border-gray-300 rounded-sm p-6 bg-green-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search size={20} /> Search in Trail
            </h2>
            <div className="mb-4 relative">
              <label className={`${labelClass} text-lg`}>Mobile Number <span className="text-red-600">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Enter 10 digit mobile number to search in Trail"
                    value={state.Mobile_Number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setState(prev => ({ ...prev, Mobile_Number: value }));

                        // Clear suggestions when typing
                        if (value.length === 10) {
                          setTrailSuggestions([]);
                          setShowTrailDropdown(false);
                          setState(prev => ({ ...prev, searchMessage: '' }));
                        } else {
                          setTrailSuggestions([]);
                          setShowTrailDropdown(false);
                        }
                      }
                    }}
                    maxLength={10}
                    onBlur={() => {
                      if (state.Mobile_Number.length === 10 && !state.selectedRecordId) {
                        handleTrailSearch();
                      }
                    }}
                  />
                  {state.isSearching && (
                    <Loader2 className="absolute right-10 top-2.5 animate-spin text-green-500" size={18} />
                  )}
                  {!state.isSearching && state.Mobile_Number.length === 10 && (
                    <button
                      type="button"
                      onClick={handleTrailSearch}
                      className="absolute right-3 top-2.5 text-green-600 hover:text-green-800 transition-colors"
                      title="Search in Trail"
                    >
                      <Search size={18} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNewRecord}
                  className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 rounded-sm font-medium transition-colors"
                >
                  New Record
                </button>
              </div>

              {/* Trail Suggestions Dropdown */}
              {showTrailDropdown && trailSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 shadow-2xl rounded-sm overflow-hidden animate-in fade-in duration-200">
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-700">
                      Found {trailSuggestions.length} record(s) in Trail
                    </div>
                    {trailSuggestions.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => handleSelectTrailRecord(record)}
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">
                              {record.Name} {record.Last_Name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                              <div className="flex items-center gap-1">
                                <Phone size={12} />
                                {record.Mobile_Number}
                                {record.Contact_Number && ` / ${record.Contact_Number}`}
                              </div>
                              {record.Email && (
                                <div className="flex items-center gap-1">
                                  <Mail size={12} />
                                  {record.Email}
                                </div>
                              )}
                              {record.Address && (
                                <div className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {record.Address.substring(0, 40)}{record.Address.length > 40 ? '...' : ''}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              <div className="flex gap-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Bill: ₹{record.Bill_Amount}</span>
                                {record.Toeken_number && (
                                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Token: {record.Toeken_number}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded">
                              Limit Approved: {record.Limit_Approved || '0'}
                            </div>
                            {/* <div className="text-xs text-gray-400 mt-1">
                              Click to load
                            </div> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Message */}
              {state.searchMessage && !showTrailDropdown && (
                <div className={`mt-2 text-xs font-semibold px-3 py-2 rounded ${state.searchMessage.includes('✓')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                  {state.searchMessage}
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Customer Details */}
          <div className="border border-gray-300 rounded-sm p-6">
            <h2 className={sectionHeaderClass}>
              <User size={20} /> Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>First Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="First name"
                  value={state.Name}
                  onChange={(e) => setState(prev => ({ ...prev, Name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Last Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Last name"
                  value={state.Last_Name}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, Last_Name: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Father's Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Father's name"
                  required
                  value={state.Fathers_Name}
                  onChange={(e) => setState(prev => ({ ...prev, Fathers_Name: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    className={inputClass}
                    value={state.Date_Of_Birth}
                    onChange={(e) => setState(prev => ({ ...prev, Date_Of_Birth: e.target.value }))}
                  />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Mobile Number <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="10 digit mobile"
                  value={state.Mobile_Number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setState(prev => ({ ...prev, Mobile_Number: value }));
                    }
                  }}
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Alternate Number <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Alternate contact"
                  value={state.Alternate_Number}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, Alternate_Number: e.target.value.replace(/\D/g, '') }))}
                  maxLength={10}
                />
              </div>

              <div>
                <label className={labelClass}>Contact Number</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Additional contact"
                  value={state.Contact_Number}
                  onChange={(e) => setState(prev => ({ ...prev, Contact_Number: e.target.value.replace(/\D/g, '') }))}
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="demo@email.com"
                  value={state.Email}
                  onChange={(e) => setState(prev => ({ ...prev, Email: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Address <span className="text-red-600">*</span></label>
                <textarea
                  className={`${inputClass} h-24`}
                  placeholder="Complete address"
                  value={state.Address}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, Address: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Address Type <span className="text-red-600">*</span></label>
                <select
                  className={selectClass}
                  value={state.Address_Type}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, Address_Type: e.target.value }))}
                >
                  <option value="">-Select-</option>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>District</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="District"
                  value={state.District}
                  onChange={(e) => setState(prev => ({ ...prev, District: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Location <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="City/Location"
                  value={state.Location}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, Location: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Salesman Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Primary salesman"
                  value={state.Salesman_Name}
                  onChange={(e) => setState(prev => ({ ...prev, Salesman_Name: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Salesman Name 2</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Secondary salesman"
                  value={state.Salesman_Name_2}
                  onChange={(e) => setState(prev => ({ ...prev, Salesman_Name_2: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Office Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Company/Office name"
                  value={state.Office_Name}
                  onChange={(e) => setState(prev => ({ ...prev, Office_Name: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Office Address</label>
                <textarea
                  className={`${inputClass} h-20`}
                  placeholder="Complete office address"
                  value={state.Office_Address}
                  onChange={(e) => setState(prev => ({ ...prev, Office_Address: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product & Purchase Details */}
          <div className="border border-gray-300 rounded-sm p-6">
            <h2 className={sectionHeaderClass}>
              <ShoppingBag size={20} /> Product & Purchase Details
            </h2>

            {/* Additional Options */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Under_Exchange}
                    onChange={(e) => setState(prev => ({ ...prev, Under_Exchange: e.target.checked }))}
                  />
                  <span>Under Exchange?</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Previous_Loan}
                    onChange={(e) => setState(prev => ({ ...prev, Previous_Loan: e.target.checked }))}
                  />
                  <span>Previous Loan?</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Discount1}
                    onChange={(e) => setState(prev => ({ ...prev, Discount1: e.target.checked }))}
                  />
                  <span>Discount?</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Company/Brand <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Brand name"
                    required
                    value={state.Company_Brand}
                    onChange={(e) => setState(prev => ({ ...prev, Company_Brand: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelClass}>One Assist</label>
                  <select
                    className={selectClass}
                    value={state.One_Assist}
                    onChange={(e) => setState(prev => ({ ...prev, One_Assist: e.target.value }))}
                  >
                    <option value="">-Select-</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>One Assist Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                    value={state.One_Assist_Amount || ''}
                    onChange={(e) => setState(prev => ({ ...prev, One_Assist_Amount: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Diwali 2024 Spin %</label>
                <select
                  className={selectClass}
                  value={state.Diwali_2024_Spin}
                  onChange={(e) => setState(prev => ({ ...prev, Diwali_2024_Spin: e.target.value }))}
                >
                  <option value="">-Select-</option>
                  <option value="10%">10%</option>
                  <option value="20%">20%</option>
                  <option value="30%">30%</option>
                  <option value="50%">50%</option>
                  <option value="100%">100%</option>
                </select>
              </div>
            </div>

            {/* Multi Product Option */}
            <label className={`${checkboxLabelClass} mb-6`}>
              <input
                type="checkbox"
                className="w-4 h-4 text-green-600"
                checked={state.Multi_Product}
                onChange={(e) => setState(prev => ({ ...prev, Multi_Product: e.target.checked }))}
              />
              <span className="font-bold">Multi Product (Show Additional Products)</span>
            </label>

            {/* Product 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded">
              <div>
                <label className={labelClass}>Product 1 <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Product}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, Product: e.target.value }))}
                />
              </div>
              
              <div>
                <label className={labelClass}>SKU 1 <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.SKU1}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, SKU1: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Model No. 1  <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Model_No}
                  required
                  onChange={(e) => setState(prev => ({ ...prev, Model_No: e.target.value }))}
                />
              </div>

              {/* <div>
                <label className={labelClass}>Serial No. 1</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Serial_No}
                  onChange={(e) => setState(prev => ({ ...prev, Serial_No: e.target.value }))}
                />
              </div> */}

              <div>
                <label className={labelClass}>Rate 1 <span className="text-red-600">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                    required
                    value={state.Rate_1 || ''}
                    onChange={(e) => setState(prev => ({ ...prev, Rate_1: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {/* Additional Products (conditional) */}
            {state.Multi_Product && (
              <div className="space-y-6 mt-6">
                {[2, 3, 4, 5].map((num) => (
                  <div key={num} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded bg-blue-50">
                    <div>
                      <label className={labelClass}>SKU {num}</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={state[`SKU${num}` as keyof FinanceState] as string || ''}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          [`SKU${num}`]: e.target.value
                        }))}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Model No. {num}</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={state[`Model_No_${num}` as keyof FinanceState] as string || ''}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          [`Model_No_${num}`]: e.target.value
                        }))}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Serial No. {num}</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={state[`Serial_No_${num}` as keyof FinanceState] as string || ''}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          [`Serial_No_${num}`]: e.target.value
                        }))}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Rate {num}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                        <input
                          type="number"
                          className={`${inputClass} pl-8`}
                          placeholder="0.00"
                          value={state[`Rate_${num}` as keyof FinanceState] as number || ''}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            [`Rate_${num}`]: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Category */}
            <div className="mt-6">
              <label className={labelClass}>Product Category <span className="text-red-600">*</span></label>
              <select
                className={selectClass}
                value={state.Prod_Category}
                required
                onChange={(e) => setState(prev => ({ ...prev, Prod_Category: e.target.value }))}
              >
                <option value="">-Select-</option>
                <option value="IV & BT">IV & BT</option>
                <option value="LED">LED</option>
                <option value="Laptop">Laptop</option>
                <option value="Microwave Oven">Microwave Oven</option>
                <option value="Mixy">Mixy</option>
                <option value="Smartphone">Smartphone</option>
                <option value="Air Conditioner">Air Conditioner</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="Television">Television</option>
              </select>
            </div>
          </div>

          {/* Section 3: Financial Details */}
          <div className="border border-gray-300 rounded-sm p-6">
            <h2 className={sectionHeaderClass}>
              <Banknote size={20} /> Financial Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bill Amount */}
              <div>
                <label className={labelClass}>Bill Amount <span className="text-red-600">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                    value={state.Bill_Amount || ''}
                    onChange={(e) => setState(prev => ({ ...prev, Bill_Amount: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              {/* Approx Advance */}
              <div>
                <label className={labelClass}>Approx Advance <span className="text-red-600">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                    required
                    value={state.Approx_Advance || ''}
                    onChange={(e) => setState(prev => ({ ...prev, Approx_Advance: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Balance (Read-only) */}
              <div>
                <label className={labelClass}>Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    className={`${inputClass} pl-8 bg-gray-50`}
                    value={state.Balance || ''}
                    readOnly
                  />
                </div>
              </div>

              {/* Down Payments */}
              <div className="md:col-span-3 pt-6 border-t">
                <h3 className="font-bold text-gray-700 mb-4">Down Payments</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num}>
                      <label className={labelClass}>Down Payment {num}</label>
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="0.00"
                        value={state[`Down_Payment_${num}` as keyof FinanceState] || ''}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          [`Down_Payment_${num}`]: Number(e.target.value)
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Finance Details */}
              <div className="md:col-span-3 pt-6 border-t">
                <h3 className="font-bold text-gray-700 mb-4">Finance Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Mode of Payment</label>
                    <select
                      className={selectClass}
                      value={state.Mode_Of_Payment}
                      onChange={(e) => setState(prev => ({ ...prev, Mode_Of_Payment: e.target.value }))}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Finance By</label>
                    <select
                      className={selectClass}
                      value={state.Finance_By1}
                      onChange={(e) => setState(prev => ({ ...prev, Finance_By1: e.target.value }))}
                    >
                      <option value="">-Select-</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Bajaj Finance">Bajaj Finance</option>
                      <option value="Home Credit">Home Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>EMI Start Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        className={inputClass}
                        value={state.EMI_Start_Date}
                        onChange={(e) => setState(prev => ({ ...prev, EMI_Start_Date: e.target.value }))}
                      />
                      <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>EMI End Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        className={inputClass}
                        value={state.EMI_End_Date}
                        onChange={(e) => setState(prev => ({ ...prev, EMI_End_Date: e.target.value }))}
                      />
                      <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                    </div>
                  </div>

                  {/* <div>
                    <label className={labelClass}>Limit</label>
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="0.00"
                      value={state.Limit || ''}
                      onChange={(e) => setState(prev => ({ ...prev, Limit: Number(e.target.value) }))}
                    />
                  </div> */}

                  {/* <div>
                    <label className={labelClass}>Limit Approved</label>
                    <select
                      className={selectClass}
                      value={state.Limit_Approved ? "1" : "0"}
                      onChange={(e) => setState(prev => ({ ...prev, Limit_Approved: e.target.value === "1" }))}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Scheme & Gift Details */}
          <div className="border border-gray-300 rounded-sm p-6">
            <h2 className={sectionHeaderClass}>
              <GiftIcon size={20} /> Scheme & Gift Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Scheme Offered</label>
                <select
                  className={selectClass}
                  value={state.Scheme_Offered}
                  onChange={(e) => setState(prev => ({ ...prev, Scheme_Offered: e.target.value }))}
                >
                  <option value="">-Select-</option>
                  <option value="Platinum Membership Service">Platinum Membership Service</option>
                  <option value="Stabilizer Installation Combo Offer">Stabilizer Installation Combo Offer</option>
                  <option value="test">Test Scheme</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Scheme Number</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Scheme_Number}
                  onChange={(e) => setState(prev => ({ ...prev, Scheme_Number: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Gift Contribution Amount</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Gift contribution"
                  value={state.Gift_Contribution}
                  onChange={(e) => setState(prev => ({ ...prev, Gift_Contribution: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Assured Gifts List</label>
                <select
                  className={selectClass}
                  multiple
                  value={state.Gift_Offer}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setState(prev => ({ ...prev, Gift_Offer: selected }));
                  }}
                >
                  <option value="Branded Shoes">Branded Shoes</option>
                  <option value="Comforter Set">Comforter Set</option>
                  <option value="Gionee Ear Buds">Gionee Ear Buds</option>
                  <option value="Intex Iron">Intex Iron</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</div>
              </div>

              <div>
                <label className={labelClass}>Gift Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Gift_Name}
                  onChange={(e) => setState(prev => ({ ...prev, Gift_Name: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Gift Number</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Gift_Number}
                  onChange={(e) => setState(prev => ({ ...prev, Gift_Number: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Gifts on Air</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Gifts_on_Air}
                  onChange={(e) => setState(prev => ({ ...prev, Gifts_on_Air: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Spin Wheel Gifts</label>
                <select
                  className={selectClass}
                  value={state.Spin_Wheel_Gifts}
                  onChange={(e) => setState(prev => ({ ...prev, Spin_Wheel_Gifts: e.target.value }))}
                >
                  <option value="">-Select-</option>
                  <option value="10%">10%</option>
                  <option value="20%">20%</option>
                  <option value="30%">30%</option>
                  <option value="50%">50%</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Rs_1000_Cashback}
                    onChange={(e) => setState(prev => ({ ...prev, Rs_1000_Cashback: e.target.checked }))}
                  />
                  <span>Rs. 1000 Cashback</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Rs_2000_Cashback}
                    onChange={(e) => setState(prev => ({ ...prev, Rs_2000_Cashback: e.target.checked }))}
                  />
                  <span>Rs. 2000 Cashback</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Redeemed}
                    onChange={(e) => setState(prev => ({ ...prev, Redeemed: e.target.checked }))}
                  />
                  <span>Redeemed</span>
                </label>
              </div>

              <div>
                <label className={labelClass}>Redeemed Cashback</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                    value={state.Redeemed_Cashback || ''}
                    onChange={(e) => setState(prev => ({ ...prev, Redeemed_Cashback: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Delivery Details */}
          <div className="border border-gray-300 rounded-sm p-6">
            <h2 className={sectionHeaderClass}>
              <TruckIcon size={20} /> Delivery Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Delivery}
                    onChange={(e) => setState(prev => ({ ...prev, Delivery: e.target.checked }))}
                  />
                  <span>Delivery Required</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Delivery_Later}
                    onChange={(e) => setState(prev => ({ ...prev, Delivery_Later: e.target.checked }))}
                  />
                  <span>Delivery Later</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Delivered}
                    onChange={(e) => setState(prev => ({ ...prev, Delivered: e.target.checked }))}
                  />
                  <span>Delivered</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Ok_for_Delivery}
                    onChange={(e) => setState(prev => ({ ...prev, Ok_for_Delivery: e.target.checked }))}
                  />
                  <span>OK for Delivery</span>
                </label>
              </div>

              <div className="space-y-4">
                {state.Delivery && (
                  <>
                    <div>
                      <label className={labelClass}>Delivery On</label>
                      <div className="relative">
                        <input
                          type="date"
                          className={inputClass}
                          value={state.Delivery_On}
                          onChange={(e) => setState(prev => ({ ...prev, Delivery_On: e.target.value }))}
                        />
                        <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Location of Delivery</label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Delivery address"
                        value={state.Location_Of_Delivery}
                        onChange={(e) => setState(prev => ({ ...prev, Location_Of_Delivery: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Claim Details */}
          <div className="border border-gray-300 rounded-sm p-6">
            <h2 className={sectionHeaderClass}>
              <FileCheck size={20} /> Claim Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num}>
                  <label className={labelClass}>Claim No. {num}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={state[`Claim_No_${num}` as keyof FinanceState] as string || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      [`Claim_No_${num}`]: e.target.value
                    }))}
                  />
                </div>
              ))}

              <div className="md:col-span-2 space-y-4">
                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Delivered_Company_Scheme}
                    onChange={(e) => setState(prev => ({ ...prev, Delivered_Company_Scheme: e.target.checked }))}
                  />
                  <span>Delivered Company Scheme</span>
                </label>

                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    checked={state.Delivered_DDS}
                    onChange={(e) => setState(prev => ({ ...prev, Delivered_DDS: e.target.checked }))}
                  />
                  <span>Delivered DDS</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 7: Metadata */}
          <div className="border border-gray-300 rounded-sm p-6">
            <h2 className={sectionHeaderClass}>
              <Tag size={20} /> Metadata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Token Number</label>
                <input
                  type="text"
                  className={`${inputClass} bg-gray-50`}
                  value={state.Toeken_number}
                  readOnly
                />
              </div>

              <div>
                <label className={labelClass}>Trial ID</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Trial_ID}
                  onChange={(e) => setState(prev => ({ ...prev, Trial_ID: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Invoice Number</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.INVOICE_NUMBER}
                  onChange={(e) => setState(prev => ({ ...prev, INVOICE_NUMBER: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Sales Order Number</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Sales_Order_Number}
                  onChange={(e) => setState(prev => ({ ...prev, Sales_Order_Number: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Owner</label>
                <input
                  type="text"
                  className={inputClass}
                  value={state.Owner}
                  onChange={(e) => setState(prev => ({ ...prev, Owner: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Stage</label>
                <select
                  className={selectClass}
                  value={state.Stage}
                  onChange={(e) => setState(prev => ({ ...prev, Stage: e.target.value }))}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* <div className="md:col-span-2">
                <label className={labelClass}>Record Image</label>
                <input
                  type="file"
                  className={inputClass}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {state.Record_Image && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {state.Record_Image.name}
                  </div>
                )}
              </div> */}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between pt-8 border-t">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-gray-600 text-white font-bold rounded shadow hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="px-12 py-3 bg-green-600 text-white font-bold rounded shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {state.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {state.selectedRecordId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  {state.selectedRecordId ? 'Update Trail Record' : 'Create Trail Record'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceForm;