// App.tsx - Complete Frontend Code with Fixed Dropdown
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  User, 
  MapPin, 
  ShoppingCart, 
  CreditCard, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Calendar,
  Info,
  PenTool,
  Percent,
  Wallet,
  X,
  Phone,
  Sparkles,
  Gift,
  Tag,
  Truck,
  RefreshCw,
  Shield
} from 'lucide-react';

// Types
interface Customer {
  mobile: string;
  firstName: string;
  lastName: string;
  email: string;
  alternateNumber: string;
  address: string;
  location: string;
}

interface LineItem {
  id: string;
  category: string;
  brand: string;
  productName: string;
  modelNo: string;
  sku: string;
  rate: number;
  quantity: number;
  oneAssist: string;
  oneAssistAmount: number;
  spinPercent: string;
  serialNo: string;
  installationRequired: boolean;
  installationPaidBy: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  rate: number;
  category?: string;
}

interface BillingState {
  customer: Customer;
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

interface ContactSuggestion {
  id: string;
  mobile: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  alternateNumber: string;
  address: string;
  location: string;
  gstNumber: string;
  stage1Id: string;
  displayText: string;
}

// Constants
const LOCATIONS = ['DB', 'DH', 'DN', 'DJ', 'Other'];
const DISCOUNTERS_BY_LOCATION: Record<string, string[]> = {
  'DB': ['Manager DB', 'Owner DB'],
  'DH': ['Manager DH', 'Owner DH'],
  'DN': ['Manager DN', 'Owner DN'],
  'DJ': ['Manager DJ', 'Owner DJ'],
  'Other': ['Regional Manager', 'CEO']
};
const BANKS = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Other'];
const SALESMEN = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Mike Brown'];
const CATEGORIES = ['Air Conditioner', 'Refrigerator', 'Washing Machine', 'Television', 'Microwave', 'Other Electronics'];
const SPIN_PERCENTS = ['-Select-', '5%', '10%', '15%', '20%', '25%'];
const ONE_ASSIST_PLANS = ['-Select-', 'Basic Plan - ₹999', 'Standard Plan - ₹1999', 'Premium Plan - ₹2999'];
const PAYMENT_MODES = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Cheque', 'Bank Transfer', 'Other'];

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://elec-zoho-backend-snowy.vercel.app/api';

const Sales: React.FC = () => {
  // Main State
  const [state, setState] = useState<BillingState>({
    customer: {
      mobile: '',
      firstName: '',
      lastName: '',
      email: '',
      alternateNumber: '',
      address: '',
      location: 'DB'
    },
    gstInputClaim: false,
    gstNumber: '',
    multiProduct: false,
    salesman1: '',
    salesman2: '',
    salesman3: '',
    deliveryLater: false,
    deliveryDate: '',
    underExchange: false,
    exchangeInfo: '',
    diwaliSpinWin: false,
    discount: false,
    discountAmount: 0,
    discountApprover: '',
    discountSignature: '',
    products: [{ 
      id: '1', 
      category: 'Air Conditioner', 
      brand: '', 
      productName: '', 
      modelNo: '', 
      sku: '', 
      rate: 0, 
      quantity: 1, 
      oneAssist: '-Select-', 
      oneAssistAmount: 0, 
      spinPercent: '-Select-', 
      serialNo: '', 
      installationRequired: false,
      installationPaidBy: ''
    }],
    schemeNo: '',
    giftAmount: 0,
    paymentMode: 'Cash',
    paymentOther: '',
    bank: 'HDFC Bank',
    additionalInfo: '',
    isSearching: false,
    isSubmitting: false
  });

  // UI State
  const [productSuggestions, setProductSuggestions] = useState<{ [key: string]: Product[] }>({});
  const [contactSuggestions, setContactSuggestions] = useState<ContactSuggestion[]>([]);
  const [success, setSuccess] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  
  // Refs
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowContactDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for contacts when mobile number changes - FIXED VERSION
  const searchContacts = useCallback(async (mobile: string) => {
    if (mobile.length < 4) {
      setContactSuggestions([]);
      setShowContactDropdown(false);
      setSearchMessage(mobile.length > 0 ? 'Type at least 4 digits to search' : '');
      return;
    }

    // Don't search if same query
    if (mobile === lastSearchQuery && contactSuggestions.length > 0) {
      setShowContactDropdown(true);
      return;
    }

    setIsLoadingContacts(true);
    setShowContactDropdown(true);
    setLastSearchQuery(mobile);
    setSearchMessage(`Searching for ${mobile}...`);

    try {
      console.log('🔍 Searching for mobile:', mobile);
      const response = await fetch(
        `${API_BASE_URL}/contacts/search?mobile=${mobile}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Search response:', data);
      
      if (data.success) {
        if (data.suggestions && data.suggestions.length > 0) {
          console.log(`✅ Found ${data.suggestions.length} contacts`);
          setContactSuggestions(data.suggestions);
          setSearchMessage(`Found ${data.suggestions.length} contact(s)`);
        } else {
          console.log('❌ No contacts found');
          setContactSuggestions([]);
          setSearchMessage('No existing contacts found');
        }
      } else {
        console.log('❌ API returned error:', data.message);
        setContactSuggestions([]);
        setSearchMessage(data.message || 'Search failed');
      }
    } catch (error: any) {
      console.error('💥 Contact search error:', error);
      setContactSuggestions([]);
      setSearchMessage('Error searching contacts: ' + error.message);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [lastSearchQuery, contactSuggestions.length]);

  // Debounced search effect
  useEffect(() => {
    const mobile = state.customer.mobile;
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      searchContacts(mobile);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [state.customer.mobile, searchContacts]);

  // Handle mobile input change
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setState(prev => ({ 
        ...prev, 
        customer: { ...prev.customer, mobile: value } 
      }));
      
      // If clearing the field or changing number, clear selected contact
      if (value.length === 0 || !contactId) {
        clearContactSelection();
      } else if (value.length >= 4) {
        // Show dropdown immediately for UX
        setShowContactDropdown(true);
      }
    }
  };

  // Select contact from dropdown
  const selectContact = (contact: ContactSuggestion) => {
    console.log('✅ Selecting contact:', contact);
    
    setContactId(contact.id);
    setState(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        mobile: contact.mobile,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        alternateNumber: contact.alternateNumber || '',
        address: contact.address || '',
        location: contact.location || 'DB'
      },
      gstNumber: contact.gstNumber || '',
      gstInputClaim: !!contact.gstNumber
    }));
    
    setContactSuggestions([]);
    setShowContactDropdown(false);
    setSearchMessage(`✓ Loaded: ${contact.fullName || contact.firstName} ${contact.lastName}`);
  };

  // Clear contact selection
  const clearContactSelection = () => {
    setContactId(null);
    setState(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        firstName: '',
        lastName: '',
        email: '',
        alternateNumber: '',
        address: '',
        location: 'DB'
      },
      gstNumber: '',
      gstInputClaim: false
    }));
    setContactSuggestions([]);
    setShowContactDropdown(false);
    setSearchMessage('');
    setLastSearchQuery('');
    
    // Focus back on mobile input
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  };

  // Search products
  const handleProductSearch = async (rowIndex: number, keyword: string) => {
    if (keyword.length < 2) {
      setProductSuggestions(prev => {
        const copy = { ...prev };
        delete copy[rowIndex];
        return copy;
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`
      );
      
      const data = await response.json();
      
      if (data.success && data.products) {
        setProductSuggestions(prev => ({
          ...prev,
          [rowIndex]: data.products
        }));
      }
    } catch (error) {
      console.error('Product search error:', error);
    }
  };

  // Select product suggestion
  const selectProductSuggestion = (rowIndex: number, productId: string, product: Product) => {
    updateProductRow(productId, {
      productName: product.name,
      sku: product.sku,
      rate: product.rate,
      category: product.category || 'Air Conditioner'
    });
    setProductSuggestions(prev => {
      const copy = { ...prev };
      delete copy[rowIndex];
      return copy;
    });
  };

  // Product row management
  const addProductRow = () => {
    if (state.products.length < 5) {
      const newId = Math.random().toString(36).substr(2, 9);
      setState(prev => ({
        ...prev,
        products: [...prev.products, { 
          id: newId, 
          category: 'Air Conditioner', 
          brand: '', 
          productName: '', 
          modelNo: '', 
          sku: '', 
          rate: 0, 
          quantity: 1, 
          oneAssist: '-Select-', 
          oneAssistAmount: 0, 
          spinPercent: '-Select-', 
          serialNo: '', 
          installationRequired: false,
          installationPaidBy: ''
        }]
      }));
    }
  };

  const removeProductRow = (id: string) => {
    if (state.products.length > 1) {
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    }
  };

  const updateProductRow = (id: string, updates: Partial<LineItem>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!state.customer.mobile || state.customer.mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!state.customer.firstName || !state.customer.lastName) {
      alert('Please enter customer name');
      return;
    }

    if (state.products.some(p => !p.productName || !p.rate || !p.category || !p.brand || !p.modelNo || !p.sku)) {
      alert('Please fill all required product details (marked with *)');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Step 1: Save or Update Contact
      const contactResponse = await fetch(`${API_BASE_URL}/contacts/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: state.customer.mobile,
          firstName: state.customer.firstName,
          lastName: state.customer.lastName,
          email: state.customer.email,
          alternateNumber: state.customer.alternateNumber,
          address: state.customer.address,
          location: state.customer.location,
          gstInputClaim: state.gstInputClaim,
          gstNumber: state.gstNumber,
          contactId: contactId
        })
      });

      const contactData = await contactResponse.json();

      if (!contactData.success) {
        throw new Error(contactData.message || 'Failed to save contact');
      }

      const savedContactId = contactData.data.id || contactId;

      // Step 2: Create Sale/Deal
      const saleResponse = await fetch(`${API_BASE_URL}/sales/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: savedContactId,
          products: state.products,
          gstInputClaim: state.gstInputClaim,
          gstNumber: state.gstNumber,
          multiProduct: state.multiProduct,
          salesman1: state.salesman1,
          salesman2: state.salesman2,
          salesman3: state.salesman3,
          deliveryLater: state.deliveryLater,
          deliveryDate: state.deliveryDate,
          underExchange: state.underExchange,
          exchangeInfo: state.exchangeInfo,
          diwaliSpinWin: state.diwaliSpinWin,
          discount: state.discount,
          discountAmount: state.discountAmount,
          discountApprover: state.discountApprover,
          discountSignature: state.discountSignature,
          schemeNo: state.schemeNo,
          giftAmount: state.giftAmount,
          paymentMode: state.paymentMode,
          paymentOther: state.paymentOther,
          bank: state.bank,
          additionalInfo: state.additionalInfo
        })
      });

      const saleData = await saleResponse.json();

      if (!saleData.success) {
        throw new Error(saleData.message || 'Failed to create sale');
      }

      setSuccess(true);
      setState(prev => ({ ...prev, isSubmitting: false }));
      
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(`Error: ${error.message || 'Something went wrong'}`);
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Calculate totals
  const totalAmount = state.products.reduce((acc, curr) => 
    acc + (curr.rate * curr.quantity) + Number(curr.oneAssistAmount), 0);
  const finalPayable = state.discount ? totalAmount - state.discountAmount : totalAmount;

  // CSS Classes
  const inputClass = "w-full border border-gray-300 px-3 py-2.5 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 rounded-md transition-all text-sm";
  const labelClass = "block mb-1.5 font-semibold text-gray-800 text-sm";
  const selectClass = "w-full border border-gray-300 px-3 py-2.5 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer rounded-md transition-all text-sm";
  const checkboxLabelClass = "flex items-center gap-2 cursor-pointer text-gray-800 font-medium select-none text-sm";

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="max-w-md w-full bg-white shadow-2xl p-10 text-center rounded-xl border border-gray-200 transform transition-all duration-500 scale-100">
          <div className="relative inline-block mb-6">
            <CheckCircle2 size={70} className="text-green-500 mx-auto" />
            <div className="absolute -top-2 -right-2">
              <Sparkles size={24} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Sale Recorded Successfully!</h2>
          <p className="text-gray-700 mb-2">
            {contactId ? 'Customer data updated and ' : 'New customer created and '}
            sale has been successfully synced to Zoho CRM.
          </p>
          <div className="text-sm text-gray-500 mb-8">
            Transaction ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">SALE-{Date.now().toString().slice(-8)}</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
          >
            Create New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Defence Electronics</h1>
              <p className="text-blue-200 text-sm">Sales Billing System - Zoho CRM Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {contactId && (
              <div className="text-sm bg-gradient-to-r from-green-700 to-green-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <CheckCircle2 size={14} /> Existing Customer
              </div>
            )}
            <div className="text-xs text-gray-300 bg-gray-800 px-3 py-1 rounded">
              Mobile Search Active
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-10 py-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${state.customer.mobile ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                1
              </div>
              <span className={state.customer.mobile ? 'text-blue-600' : ''}>Customer</span>
            </div>
            <div className="h-1 w-20 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${state.products[0].productName ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                2
              </div>
              <span className={state.products[0].productName ? 'text-blue-600' : ''}>Products</span>
            </div>
            <div className="h-1 w-20 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400">
                3
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* ============ CUSTOMER SECTION ============ */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Mobile Number with Search Dropdown - FIXED SECTION */}
              <div className="md:col-span-1 relative" ref={dropdownRef}>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Phone size={14} />
                    Mobile Number <span className="text-red-600">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input 
                    ref={mobileInputRef}
                    type="text" 
                    className={`${inputClass} ${showContactDropdown && contactSuggestions.length > 0 ? 'rounded-t-md rounded-b-none' : ''} pr-10`}
                    placeholder="Start typing (min 4 digits)..."
                    value={state.customer.mobile}
                    onChange={handleMobileChange}
                    onFocus={() => {
                      if (state.customer.mobile.length >= 4 && contactSuggestions.length > 0) {
                        setShowContactDropdown(true);
                      }
                    }}
                    maxLength={10}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {contactId && (
                      <button
                        type="button"
                        onClick={clearContactSelection}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Clear selection"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {isLoadingContacts && (
                      <Loader2 className="animate-spin text-blue-500" size={18} />
                    )}
                    {!isLoadingContacts && state.customer.mobile.length >= 4 && (
                      <Search className="text-blue-500" size={18} />
                    )}
                  </div>
                </div>
                
                {/* Search Status Message */}
                {searchMessage && (
                  <div className={`mt-2 text-xs font-medium px-3 py-1.5 rounded-md ${
                    searchMessage.includes('✓') || searchMessage.includes('Found') || searchMessage.includes('Loaded')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : searchMessage.includes('No existing')
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : searchMessage.includes('Error') || searchMessage.includes('failed')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {searchMessage.includes('✓') && <CheckCircle2 size={12} />}
                      {searchMessage.includes('Searching') && <Loader2 size={12} className="animate-spin" />}
                      {searchMessage}
                    </div>
                  </div>
                )}

                {/* Contact Suggestions Dropdown - FIXED DISPLAY */}
                {showContactDropdown && (
                  <div className="absolute z-50 left-0 right-0 top-full bg-white border border-gray-300 border-t-0 shadow-xl rounded-b-md max-h-80 overflow-y-auto">
                    <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 flex justify-between items-center">
                        <span>
                          {isLoadingContacts 
                            ? `Searching for: ${state.customer.mobile}`
                            : contactSuggestions.length > 0
                              ? `Select a contact (${contactSuggestions.length} found)`
                              : 'No contacts found'
                          }
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowContactDropdown(false)}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    
                    {/* Loading State */}
                    {isLoadingContacts ? (
                      <div className="px-4 py-6 text-center">
                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={20} />
                        <div className="text-xs text-gray-500 mt-2">Searching contacts...</div>
                        <div className="text-xs text-gray-400 mt-1 font-mono">{state.customer.mobile}</div>
                      </div>
                    ) : contactSuggestions.length > 0 ? (
                      // Contact List
                      <div className="divide-y divide-gray-100">
                        {contactSuggestions.map((contact) => (
                          <div 
                            key={contact.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 group"
                            onClick={() => selectContact(contact)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-200">
                                <User size={18} className="text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700">
                                    {contact.fullName || `${contact.firstName} ${contact.lastName}`}
                                  </div>
                                  <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Phone size={10} />
                                    {contact.mobile}
                                  </div>
                                </div>
                                
                                <div className="mt-2 space-y-1">
                                  {contact.email && (
                                    <div className="text-xs text-gray-600 flex items-center gap-1.5">
                                      <span className="text-gray-400">📧</span>
                                      <span className="truncate">{contact.email}</span>
                                    </div>
                                  )}
                                  {contact.address && (
                                    <div className="text-xs text-gray-600 flex items-start gap-1.5">
                                      <MapPin size={12} className="mt-0.5 flex-shrink-0 text-gray-400" />
                                      <span className="truncate">{contact.address}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    {contact.location && (
                                      <span className="flex items-center gap-1">
                                        📍 {contact.location}
                                      </span>
                                    )}
                                    {contact.stage1Id && (
                                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                                        ID: {contact.stage1Id}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : state.customer.mobile.length >= 4 ? (
                      // No Results State
                      <div className="px-4 py-6 text-center">
                        <div className="text-gray-400 mb-2">
                          <User size={24} className="mx-auto" />
                        </div>
                        <div className="text-sm font-semibold text-gray-500 mb-1">No contacts found</div>
                        <div className="text-xs text-gray-400">Continue typing or create new customer</div>
                        <div className="text-xs text-gray-400 mt-2 font-mono">Searched: {state.customer.mobile}</div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Debug Info (Remove in production) */}
              <div className="md:col-span-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs font-mono">
                  <div className="font-bold text-gray-700 mb-1">Debug Info:</div>
                  <div>Mobile: <span className="text-blue-600">{state.customer.mobile}</span></div>
                  <div>Length: {state.customer.mobile.length}</div>
                  <div>Suggestions: <span className={contactSuggestions.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {contactSuggestions.length}
                  </span></div>
                  <div>Loading: {isLoadingContacts ? 'Yes' : 'No'}</div>
                  <div>Dropdown: {showContactDropdown ? 'Visible' : 'Hidden'}</div>
                  <div>Selected: {contactId ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Customer Name */}
              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={inputClass}
                    placeholder="Enter first name"
                    value={state.customer.firstName}
                    onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, firstName: e.target.value }}))}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Last Name <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={inputClass}
                    placeholder="Enter last name"
                    value={state.customer.lastName}
                    onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, lastName: e.target.value }}))}
                    required
                  />
                </div>
              </div>

              {/* Alternate Number & Email */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Phone size={14} />
                    Alternate Number
                  </span>
                </label>
                <input 
                  type="text" 
                  className={inputClass}
                  placeholder="Alternate contact number"
                  value={state.customer.alternateNumber}
                  onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, alternateNumber: e.target.value.replace(/\D/g, '') }}))}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    📧 Email Address
                  </span>
                </label>
                <input 
                  type="email" 
                  className={inputClass}
                  placeholder="customer@example.com"
                  value={state.customer.email}
                  onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, email: e.target.value }}))}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <MapPin size={14} />
                    Complete Address
                  </span>
                </label>
                <textarea 
                  className={`${inputClass} h-28 resize-none`}
                  placeholder="House no., Street, Area, City, State, Pincode"
                  value={state.customer.address}
                  onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, address: e.target.value }}))}
                />
              </div>

              {/* GST & Location */}
              <div className="md:col-span-2 space-y-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="space-y-4">
                  <label className={checkboxLabelClass}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      checked={state.gstInputClaim} 
                      onChange={(e) => setState(prev => ({ ...prev, gstInputClaim: e.target.checked }))} 
                    />
                    <span className="font-bold">GST Input Claim Required?</span>
                  </label>

                  {state.gstInputClaim && (
                    <div className="animate-in slide-in-from-top-2 duration-300 pl-6 border-l-2 border-blue-200">
                      <label className={labelClass}>
                        GST Number <span className="text-red-600">*</span>
                      </label>
                      <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="22AAAAA0000A1Z5"
                        value={state.gstNumber} 
                        onChange={e => setState(p => ({...p, gstNumber: e.target.value}))} 
                        required={state.gstInputClaim}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                      📍 Location <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <select 
                    className={selectClass}
                    value={state.customer.location}
                    onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, location: e.target.value } }))}
                    required
                  >
                    <option value="">Select Location</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Salesmen Section */}
              <div className="md:col-span-2 space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    <h3 className="font-bold text-gray-800">Sales Team</h3>
                  </div>
                  <label className={checkboxLabelClass}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      checked={state.multiProduct} 
                      onChange={(e) => setState(prev => ({ ...prev, multiProduct: e.target.checked }))} 
                    />
                    <span>Multi Product Sale</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Primary Salesman</label>
                    <select className={selectClass} value={state.salesman1} onChange={e => setState(p => ({ ...p, salesman1: e.target.value }))}>
                      <option value="">Select Salesman</option>
                      {SALESMEN.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {state.multiProduct && (
                    <>
                      <div className="animate-in fade-in duration-500">
                        <label className={labelClass}>Secondary Salesman</label>
                        <select className={selectClass} value={state.salesman2} onChange={e => setState(p => ({ ...p, salesman2: e.target.value }))}>
                          <option value="">Select Salesman</option>
                          {SALESMEN.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="md:col-span-2 animate-in fade-in duration-500">
                        <label className={labelClass}>Third Salesman (if applicable)</label>
                        <select className={selectClass} value={state.salesman3} onChange={e => setState(p => ({ ...p, salesman3: e.target.value }))}>
                          <option value="">Select Salesman</option>
                          {SALESMEN.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Delivery & Exchange */}
              <div className="md:col-span-2 space-y-6 py-6 border-y border-gray-200">
                <div className="space-y-4">
                  <label className={checkboxLabelClass}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      checked={state.deliveryLater} 
                      onChange={e => setState(p => ({ ...p, deliveryLater: e.target.checked }))} 
                    />
                    <span className="font-bold flex items-center gap-2">
                      <Truck size={16} />
                      Schedule Delivery Later
                    </span>
                  </label>
                  {state.deliveryLater && (
                    <div className="animate-in slide-in-from-top-2 duration-300 pl-6 border-l-2 border-blue-200">
                      <label className={labelClass}>
                        Delivery Date <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="date" 
                          className={inputClass} 
                          value={state.deliveryDate} 
                          onChange={e => setState(p => ({...p, deliveryDate: e.target.value}))} 
                          required
                        />
                        <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className={checkboxLabelClass}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      checked={state.underExchange} 
                      onChange={e => setState(p => ({ ...p, underExchange: e.target.checked }))} 
                    />
                    <span className="font-bold flex items-center gap-2">
                      <RefreshCw size={16} />
                      Product Exchange?
                    </span>
                  </label>
                  {state.underExchange && (
                    <div className="animate-in slide-in-from-top-2 duration-300 pl-6 border-l-2 border-blue-200">
                      <label className={labelClass}>
                        Exchange Details <span className="text-red-600">*</span>
                      </label>
                      <textarea 
                        className={`${inputClass} h-32 resize-none`} 
                        placeholder="Old product details, condition, estimated value..."
                        value={state.exchangeInfo} 
                        onChange={e => setState(p => ({...p, exchangeInfo: e.target.value}))} 
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============ PRODUCTS SECTION ============ */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart size={20} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
              </div>
              <div className="text-sm text-gray-500">
                Products: {state.products.length}/5
              </div>
            </div>

            {/* Product Items */}
            {state.products.map((row, idx) => (
              <div key={row.id} className="space-y-6 py-8 border-b border-gray-200 last:border-b-0 relative group">
                {state.products.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeProductRow(row.id)}
                    className="absolute right-0 top-8 text-gray-400 hover:text-red-600 transition-colors p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
                    title="Remove product"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Product Category & Brand */}
                  <div>
                    <label className={labelClass}>
                      Product Category <span className="text-red-600">*</span>
                    </label>
                    <select 
                      className={selectClass}
                      value={row.category}
                      onChange={e => updateProductRow(row.id, { category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Brand Name <span className="text-red-600">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={inputClass} 
                      placeholder="e.g., Samsung, LG, Voltas"
                      value={row.brand}
                      onChange={e => updateProductRow(row.id, { brand: e.target.value })}
                      required
                    />
                  </div>

                  {/* Product Search */}
                  <div className="relative">
                    <label className={labelClass}>
                      Product Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className={`${inputClass} ${productSuggestions[idx]?.length ? 'rounded-t-md rounded-b-none' : ''}`}
                        placeholder="Search or type product name"
                        value={row.productName}
                        onChange={e => {
                          updateProductRow(row.id, { productName: e.target.value });
                          handleProductSearch(idx, e.target.value);
                        }}
                        required
                      />
                      {productSuggestions[idx] && productSuggestions[idx].length > 0 && (
                        <div className="absolute z-40 left-0 right-0 top-full bg-white border border-gray-300 border-t-0 shadow-xl rounded-b-md max-h-60 overflow-y-auto">
                          {productSuggestions[idx].map(p => (
                            <div 
                              key={p.id} 
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none flex justify-between items-center group/item"
                              onClick={() => selectProductSuggestion(idx, row.id, p)}
                            >
                              <div>
                                <div className="text-sm font-bold text-gray-900 group-hover/item:text-blue-700">
                                  {p.name}
                                </div>
                                <div className="text-xs text-gray-500 font-mono uppercase">
                                  SKU: {p.sku}
                                </div>
                                {p.category && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Category: {p.category}
                                  </div>
                                )}
                              </div>
                              <div className="text-sm font-black text-blue-600">
                                ₹{p.rate.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model & SKU */}
                  <div>
                    <label className={labelClass}>
                      Model Number <span className="text-red-600">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={inputClass} 
                      placeholder="Model code/number"
                      value={row.modelNo}
                      onChange={e => updateProductRow(row.id, { modelNo: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      SKU <span className="text-red-600">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={inputClass} 
                      placeholder="Stock keeping unit"
                      value={row.sku}
                      onChange={e => updateProductRow(row.id, { sku: e.target.value })}
                      required
                    />
                  </div>

                  {/* Rate & Quantity */}
                  <div>
                    <label className={labelClass}>
                      Rate (₹) <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input 
                        type="number" 
                        className={`${inputClass} pl-8`}
                        placeholder="0.00"
                        value={row.rate}
                        onChange={e => updateProductRow(row.id, { rate: Number(e.target.value) })}
                        required 
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Quantity <span className="text-red-600">*</span>
                    </label>
                    <input 
                      type="number" 
                      className={inputClass}
                      placeholder="1"
                      value={row.quantity}
                      onChange={e => updateProductRow(row.id, { quantity: Number(e.target.value) })}
                      required 
                      min="1"
                    />
                  </div>

                  {/* One Assist */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <Shield size={14} />
                        One Assist Plan
                      </span>
                    </label>
                    <select className={selectClass} value={row.oneAssist} onChange={e => updateProductRow(row.id, { oneAssist: e.target.value })}>
                      {ONE_ASSIST_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      One Assist Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input 
                        type="number" 
                        className={`${inputClass} pl-8`}
                        placeholder="0.00"
                        value={row.oneAssistAmount}
                        onChange={e => updateProductRow(row.id, { oneAssistAmount: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className={labelClass}>
                      Serial Number
                    </label>
                    <input 
                      type="text" 
                      className={inputClass}
                      placeholder="Enter serial number"
                      value={row.serialNo}
                      onChange={e => updateProductRow(row.id, { serialNo: e.target.value })}
                    />
                  </div>

                  {/* Spin & Win */}
                  <div className="md:col-span-2 space-y-6 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <label className={checkboxLabelClass}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500" 
                        checked={state.diwaliSpinWin} 
                        onChange={e => setState(p => ({ ...p, diwaliSpinWin: e.target.checked }))} 
                      />
                      <span className="font-bold flex items-center gap-2">
                        <Sparkles size={16} />
                        Diwali 2024 Spin & Win Promotion
                      </span>
                    </label>

                    <div className="w-full md:w-1/2">
                      <label className={labelClass}>Spin Percentage</label>
                      <select className={selectClass} value={row.spinPercent} onChange={e => updateProductRow(row.id, { spinPercent: e.target.value })}>
                        {SPIN_PERCENTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Installation */}
                  <div className="md:col-span-2 pt-4 space-y-4">
                    <label className={checkboxLabelClass}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                        checked={row.installationRequired} 
                        onChange={e => updateProductRow(row.id, { installationRequired: e.target.checked })} 
                      />
                      <span className="font-bold flex items-center gap-2">
                        <Wallet size={16} />
                        Installation/Demo Required?
                      </span>
                    </label>

                    {row.installationRequired && (
                      <div className="animate-in slide-in-from-top-2 duration-300 pl-6 border-l-2 border-blue-200 w-full md:w-1/2">
                        <label className={labelClass}>
                          Installation Paid By <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            className={inputClass} 
                            placeholder="Customer, Company, Dealer..."
                            value={row.installationPaidBy} 
                            onChange={e => updateProductRow(row.id, { installationPaidBy: e.target.value })} 
                            required
                          />
                          <Wallet className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Product Button */}
            {state.products.length < 5 && (
              <div className="pt-6">
                <button 
                  type="button" 
                  onClick={addProductRow}
                  className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider hover:text-blue-700 transition-all border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl py-4 px-6 w-full bg-blue-50 hover:bg-blue-100"
                >
                  <Plus size={20} /> Add Another Product
                </button>
              </div>
            )}
          </div>

          {/* ============ DISCOUNT SECTION ============ */}
          <div className="py-8 border-y border-gray-200 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Discount & Approval</h2>
            </div>

            <label className={`${checkboxLabelClass} text-lg`}>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
                checked={state.discount} 
                onChange={e => setState(p => ({ ...p, discount: e.target.checked }))} 
              />
              <span className="font-bold">Apply Discount?</span>
            </label>

            {state.discount && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-500 p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                      <Percent size={14} />
                      Discount Amount (₹) <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input 
                      type="number" 
                      className={`${inputClass} pl-8`}
                      placeholder="Enter discount amount"
                      value={state.discountAmount} 
                      onChange={e => setState(p => ({...p, discountAmount: Number(e.target.value)}))} 
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Approved By <span className="text-red-600">*</span>
                  </label>
                  <select 
                    className={selectClass} 
                    value={state.discountApprover} 
                    onChange={e => setState(p => ({...p, discountApprover: e.target.value}))}
                    required
                  >
                    <option value="">Select Approver</option>
                    {(DISCOUNTERS_BY_LOCATION[state.customer.location] || DISCOUNTERS_BY_LOCATION['DB']).map(person => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                      <PenTool size={14} />
                      Approver Signature <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`${inputClass} italic font-serif`} 
                      placeholder="Full name as signature"
                      value={state.discountSignature} 
                      onChange={e => setState(p => ({...p, discountSignature: e.target.value}))} 
                      required
                    />
                    <PenTool className="absolute right-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============ SCHEME & PAYMENT SECTION ============ */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Gift size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Scheme & Payment Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              {/* Scheme Details */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Tag size={14} />
                    Scheme Number
                  </span>
                </label>
                <input 
                  type="text" 
                  className={inputClass} 
                  placeholder="Enter scheme code"
                  value={state.schemeNo} 
                  onChange={e => setState(p => ({ ...p, schemeNo: e.target.value }))} 
                />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Gift size={14} />
                    Gift Contribution (₹)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input 
                    type="number" 
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                    value={state.giftAmount} 
                    onChange={e => setState(p => ({ ...p, giftAmount: Number(e.target.value) }))} 
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="md:col-span-2">
                <label className={`${labelClass} text-lg mb-6`}>
                  Payment Mode <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PAYMENT_MODES.map(mode => (
                    <label 
                      key={mode} 
                      className={`${checkboxLabelClass} p-4 border-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer flex-col items-center justify-center text-center ${
                        state.paymentMode === mode 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMode" 
                        value={mode} 
                        checked={state.paymentMode === mode}
                        onChange={e => setState(p => ({ ...p, paymentMode: e.target.value }))}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                        required
                      />
                      <div className="mt-2">
                        <div className="font-bold text-gray-900">{mode}</div>
                        {mode === 'Credit Card' && <CreditCard size={16} className="mx-auto mt-1 text-gray-400" />}
                        {mode === 'UPI' && <div className="text-xs text-gray-500 mt-1">Google Pay/PhonePe</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bank Details for Cards */}
              {(state.paymentMode === 'Credit Card' || state.paymentMode === 'Debit Card') && (
                <div className="md:col-span-1 animate-in slide-in-from-top-4 duration-500">
                  <label className={labelClass}>
                    Bank Name <span className="text-red-600">*</span>
                  </label>
                  <select 
                    className={selectClass}
                    value={state.bank}
                    onChange={e => setState(p => ({ ...p, bank: e.target.value }))}
                    required
                  >
                    <option value="">Select Bank</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {/* Other Payment Method */}
              {state.paymentMode === 'Other' && (
                <div className="md:col-span-1 animate-in slide-in-from-top-4 duration-500">
                  <label className={labelClass}>
                    Specify Method <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className={inputClass} 
                      placeholder="e.g., Voucher, Gift Card, Loan..."
                      value={state.paymentOther} 
                      onChange={e => setState(p => ({...p, paymentOther: e.target.value}))} 
                      required
                    />
                    <Info className="absolute right-3 top-2.5 text-blue-400" size={18} />
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="md:col-span-2 pt-4">
                <label className={labelClass}>
                  Additional Notes
                </label>
                <input 
                  type="text" 
                  className={inputClass} 
                  placeholder="Special instructions, delivery notes, etc."
                  value={state.additionalInfo}
                  onChange={e => setState(p => ({ ...p, additionalInfo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* ============ SUMMARY ============ */}
          <div className="mt-12 p-8 bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <div className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-2">
                  Total Transaction Value
                </div>
                <div className="text-lg text-gray-300 font-medium flex items-center gap-3">
                  <span>Inclusive of GST & All Charges</span>
                  {state.discount && (
                    <span className="text-green-400 font-bold bg-green-900/30 px-3 py-1 rounded-full">
                      ₹{state.discountAmount.toLocaleString()} Discount Applied
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-3">
                  {state.products.length} Product(s) | {contactId ? 'Existing Customer' : 'New Customer'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black tracking-tighter">
                  ₹{finalPayable.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Final Amount Payable
                </div>
              </div>
            </div>
          </div>

          {/* ============ ACTION BUTTONS ============ */}
          <div className="flex items-center justify-between pt-8 pb-12">
            <button 
              type="button"
              onClick={clearContactSelection}
              className="px-10 py-3.5 bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all hover:shadow-xl active:scale-95 flex items-center gap-2"
            >
              <X size={18} /> Clear Form
            </button>
            <button 
              type="submit"
              disabled={state.isSubmitting}
              className="px-14 py-3.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-800 transition-all disabled:opacity-50 flex items-center gap-3 active:scale-95"
            >
              {state.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Submit Sale Invoice
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs font-bold text-gray-400 pb-4 tracking-widest border-t border-gray-100 pt-6">
            DEFENCE ELECTRONICS SALES SYSTEM • ZOHO CRM INTEGRATION • v2.0
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sales;