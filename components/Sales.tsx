import React, { useState, useEffect } from 'react';
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
  Wallet
} from 'lucide-react';
import {
  Contact,
  LineItem,
  BillingState,
  Product
} from './saletypes';
import {
  LOCATIONS,
  DISCOUNTERS_BY_LOCATION,
  BANKS,
  SALESMEN,
  CATEGORIES,
  SPIN_PERCENTS,
  ONE_ASSIST_PLANS,
  PAYMENT_MODES
} from './saleconstants';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://elec-zoho-backend-snowy.vercel.app/api';

const Sales: React.FC = () => {
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
    selectedContactId: null,
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
      rate: '',
      quantity: 1,
      oneAssist: '-Select-',
      oneAssistAmount: 0,
      spinPercent: '-Select-',
      serialNo: '',
      installationRequired: false,
      installationPaidBy: ''
    }],
    // Multi-product fields
    product2: '',
    product3: '',
    product4: '',
    product5: '',
    modelNo2: '',
    modelNo3: '',
    modelNo4: '',
    modelNo5: '',
    rate2: '',
    rate3: '',
    rate4: '',
    rate5: '',
    sku2: '',
    sku3: '',
    sku4: '',
    sku5: '',
    schemeNo: '',
    giftAmount: 0,
    paymentMode: 'Cash',
    paymentOther: '',
    bank: 'HDFC Bank',
    additionalInfo: '',
    isSearching: false,
    isSubmitting: false
  });

  const [contactSuggestions, setContactSuggestions] = useState<Contact[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<{ [key: string]: Product[] }>({});
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [productSearch, setProductSearch] = useState<{ [key: string]: Product[] }>({});

  const searchProduct = async (field: string, keyword: string) => {
    if (keyword.length < 2) {
      setProductSearch(prev => {
        const c = { ...prev };
        delete c[field];
        return c;
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`
      );

      const data = await response.json();

      if (data.success) {
        setProductSearch(prev => ({
          ...prev,
          [field]: data.products
        }));
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };


  // Handle multi-product toggle
  const handleMultiProductToggle = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      multiProduct: enabled,
      // Reset additional product fields when disabled
      ...(!enabled && {
        product2: '',
        product3: '',
        product4: '',
        product5: '',
        modelNo2: '',
        modelNo3: '',
        modelNo4: '',
        modelNo5: '',
        rate2: '',
        rate3: '',
        rate4: '',
        rate5: '',
        sku2: '',
        sku3: '',
        sku4: '',
        sku5: '',
        salesman3: ''
      })
    }));
  };

  const handleContactSearch = async () => {
    if (state.customer.mobile.length !== 10) return;

    setState(prev => ({ ...prev, isSearching: true }));
    setSearchMessage('');
    setContactSuggestions([]);
    setShowContactDropdown(false);
    setState(prev => ({ ...prev, selectedContactId: null }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/contacts/search?mobile=${state.customer.mobile}`
      );

      const data = await response.json();

      if (data.success) {
        if (data.suggestions && data.suggestions.length > 0) {
          setContactSuggestions(data.suggestions);
          setShowContactDropdown(true);

          if (data.suggestions.length === 1) {
            handleSelectContact(data.suggestions[0]);
          } else {
            setSearchMessage(`Found ${data.suggestions.length} contacts with this number. Select one from the list.`);
          }
        } else {
          setContactSuggestions([]);
          setShowContactDropdown(false);
          setSearchMessage('✗ No existing customer found. This will be a new entry.');
        }
      } else {
        setSearchMessage('⚠️ Error searching for customer');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchMessage('⚠️ Error connecting to server');
    } finally {
      setState(prev => ({ ...prev, isSearching: false }));
    }
  };

  const handleSelectContact = async (contact: Contact) => {
    setState(prev => ({ ...prev, selectedContactId: contact.id }));
    setShowContactDropdown(false);

    setState(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        alternateNumber: contact.alternateNumber || '',
        address: contact.address || '',
        location: contact.location || 'DB'
      },
      gstNumber: contact.gstNumber || '',
      gstInputClaim: !!contact.gstNumber,
      selectedContactId: contact.id
    }));

    setSearchMessage(`✓ Selected: ${contact.fullName || contact.firstName} ${contact.lastName} (${contact.stage1Id || 'No ID'})`);
  };

  const handleNewContact = () => {
    setState(prev => ({ ...prev, selectedContactId: null }));
    setShowContactDropdown(false);
    setContactSuggestions([]);

    setState(prev => ({
      ...prev,
      customer: {
        mobile: prev.customer.mobile,
        firstName: '',
        lastName: '',
        email: '',
        alternateNumber: '',
        address: '',
        location: 'DB'
      },
      gstInputClaim: false,
      gstNumber: '',
      selectedContactId: null
    }));

    setSearchMessage('✗ Creating new customer. Fill in details below.');
  };

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
          rate: '',
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

  const selectProduct = (field: string, product: Product) => {
    const num = field.replace("product", "");  // get 1,2,3,4,5

    setState(prev => ({
      ...prev,
      [field]: product.name,
      [`modelNo${num}`]: product.modelNo || "",
      [`rate${num}`]: product.rate || "",
      [`sku${num}`]: product.sku || ""
    }));

    setProductSearch(prev => {
      const c = { ...prev };
      delete c[field];
      return c;
    });
  };


  const selectProductSuggestion = (rowIndex: number, productId: string, product: Product) => {
    updateProductRow(productId, {
      productName: product.name,
      sku: product.sku,
      rate: product.rate,
      brand: product.brand,
      category: product.category || 'Air Conditioner'
    });
    setProductSuggestions(prev => {
      const copy = { ...prev };
      delete copy[rowIndex];
      return copy;
    });
  };

  // Handle multi-product field changes
  const handleMultiProductFieldChange = (field: string, value: string) => {
    setState(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  // Check if multi-product is enabled but additional product fields are empty
  if (state.multiProduct) {
    const hasAdditionalProducts = state.product2 || state.product3 || state.product4 || state.product5;
    if (!hasAdditionalProducts) {
      alert('Multi-Product is enabled but no additional products are filled. Please fill at least one additional product or disable Multi-Product.');
      return;
    }
  }

  if (state.products.some(p => !p.productName || !p.rate || !p.category)) {
    alert('Please fill all required product details');
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
        contactId: state.selectedContactId
      })
    });

    const contactData = await contactResponse.json();

    if (!contactData.success) {
      throw new Error(contactData.message || 'Failed to save contact');
    }

    const savedContactId = contactData.data.id || state.selectedContactId;

    // Prepare product data for backend
    const productData = {
      // Main product from products array (first product)
      product1: state.products[0]?.productName || '',
      modelNo1: state.products[0]?.modelNo || '',
      rate1: state.products[0]?.rate || '',
      sku1: state.products[0]?.sku || '',
      // Additional products from multi-product fields
      product2: state.product2 || '',
      product3: state.product3 || '',
      product4: state.product4 || '',
      product5: state.product5 || '',
      modelNo2: state.modelNo2 || '',
      modelNo3: state.modelNo3 || '',
      modelNo4: state.modelNo4 || '',
      modelNo5: state.modelNo5 || '',
      rate2: state.rate2 || '',
      rate3: state.rate3 || '',
      rate4: state.rate4 || '',
      rate5: state.rate5 || '',
      sku2: state.sku2 || '',
      sku3: state.sku3 || '',
      sku4: state.sku4 || '',
      sku5: state.sku5 || '',
    };

    // Step 2: Create Sale/Deal with multi-product data
    const saleResponse = await fetch(`${API_BASE_URL}/sales/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactId: savedContactId,
        products: state.products,
        // Include multi-product fields
        ...productData,
        multiProduct: state.multiProduct,
        gstInputClaim: state.gstInputClaim,
        gstNumber: state.gstNumber,
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
        additionalInfo: state.additionalInfo,
        // Include customer data
        customer: state.customer
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
    alert(`Error: ${error.message}`);
    setState(prev => ({ ...prev, isSubmitting: false }));
  }
};

  const totalAmount = state.products.reduce((acc, curr) => acc + (curr.rate * curr.quantity) + Number(curr.oneAssistAmount), 0);
  const finalPayable = state.discount ? totalAmount - state.discountAmount : totalAmount;

  const inputClass = "w-full border border-gray-300 px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-500 rounded-sm transition-all";
  const labelClass = "block mb-1 font-semibold text-gray-800 text-sm";
  const selectClass = "w-full border border-gray-300 px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer rounded-sm transition-all";
  const checkboxLabelClass = "flex items-center gap-2 cursor-pointer text-gray-800 font-medium select-none";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-2xl p-10 text-center rounded-sm border border-gray-200">
          <CheckCircle2 size={60} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sale Recorded Successfully!</h2>
          <p className="text-gray-700 mb-6">
            {state.selectedContactId ? 'Customer data updated and ' : 'New customer created and '}
            sale has been successfully synced to Zoho CRM.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded shadow-md hover:bg-blue-700 transition-colors"
          >
            Create New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-sm overflow-hidden border border-gray-200">
        {/* Dark Grey Header Bar */}
        <div className="bg-[#333333] text-white px-8 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Sale.</h1>
          <div className="flex items-center gap-4">
            {state.selectedContactId && (
              <div className="text-sm bg-green-800 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={14} /> Existing Customer
              </div>
            )}
            {state.multiProduct && (
              <div className="text-sm bg-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
                <ShoppingCart size={14} /> Multi-Product
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* Customer Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

            {/* Mobile Number */}
            <div className="md:col-span-1 relative">
              <label className={labelClass}>Mobile Number <span className="text-red-600">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Enter 10 digit number"
                  value={state.customer.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setState(prev => ({ ...prev, customer: { ...prev.customer, mobile: value } }));
                      if (value.length === 10) {
                        setContactSuggestions([]);
                        setShowContactDropdown(false);
                        setSearchMessage('');
                      } else {
                        setContactSuggestions([]);
                        setShowContactDropdown(false);
                      }
                    }
                  }}
                  maxLength={10}
                  onBlur={() => {
                    if (state.customer.mobile.length === 10 && !state.selectedContactId) {
                      handleContactSearch();
                    }
                  }}
                />
                {state.isSearching && <Loader2 className="absolute right-10 top-2.5 animate-spin text-blue-500" size={18} />}
                {!state.isSearching && state.customer.mobile.length === 10 && (
                  <button
                    type="button"
                    onClick={handleContactSearch}
                    className="absolute right-3 top-2.5 text-blue-400 hover:text-blue-600 transition-colors"
                    title="Search for customer"
                  >
                    <Search size={18} />
                  </button>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">### - ### - ####</p>

              {/* Contact Suggestions Dropdown */}
              {showContactDropdown && contactSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 shadow-2xl rounded-sm overflow-hidden animate-in fade-in duration-200">
                  <div className="max-h-60 overflow-y-auto">
                    {contactSuggestions.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-gray-900">
                              {contact.fullName || `${contact.firstName} ${contact.lastName}`}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {contact.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {contact.address.substring(0, 30)}{contact.address.length > 30 ? '...' : ''}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {contact.email && <div>📧 {contact.email}</div>}
                              {contact.alternateNumber && <div>📱 {contact.alternateNumber}</div>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {contact.stage1Id || 'No ID'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {contact.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Option to create new contact */}
                    <div
                      onClick={handleNewContact}
                      className="px-4 py-3 hover:bg-green-50 cursor-pointer border-t border-gray-200 bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <Plus size={16} />
                        Create New Contact
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Mobile: {state.customer.mobile}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Message */}
              {searchMessage && !showContactDropdown && (
                <div className={`mt-2 text-xs font-semibold px-3 py-2 rounded ${searchMessage.includes('✓')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : searchMessage.includes('✗')
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {searchMessage}
                </div>
              )}
            </div>

            {/* Customer Name */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Customer Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="First name"
                  value={state.customer.firstName}
                  onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, firstName: e.target.value } }))}
                  required
                />
                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">First</p>
              </div>
              <div className="flex flex-col justify-end">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Last name"
                  value={state.customer.lastName}
                  onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, lastName: e.target.value } }))}
                  required
                />
                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Last</p>
              </div>
            </div>

            {/* Alternate Number */}
            <div className="md:col-span-1">
              <label className={labelClass}>Alternate Number</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Alternate contact"
                value={state.customer.alternateNumber}
                onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, alternateNumber: e.target.value.replace(/\D/g, '') } }))}
              />
              <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">### - ### - ####</p>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <textarea
                className={`${inputClass} h-24 resize-none`}
                placeholder="Residential address"
                value={state.customer.address}
                onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, address: e.target.value } }))}
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                placeholder="customer@email.com"
                value={state.customer.email}
                onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, email: e.target.value } }))}
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className={checkboxLabelClass}>
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={state.gstInputClaim} onChange={(e) => setState(prev => ({ ...prev, gstInputClaim: e.target.checked }))} />
                <span>GST Input Claim?</span>
              </label>

              {state.gstInputClaim && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className={labelClass}>GST Number <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="22AAAAA0000A1Z5"
                    value={state.gstNumber}
                    onChange={e => setState(p => ({ ...p, gstNumber: e.target.value }))}
                    required={state.gstInputClaim}
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div className="md:col-span-1">
              <label className={labelClass}>Location <span className="text-red-600">*</span></label>
              <select
                className={selectClass}
                value={state.customer.location}
                onChange={(e) => setState(prev => ({ ...prev, customer: { ...prev.customer, location: e.target.value } }))}
                required
              >
                <option value="" className="text-gray-500">-Select-</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Salesmen Details */}
            <div className="md:col-span-2 space-y-6 pt-6 border-t border-gray-100">
              <label className={checkboxLabelClass}>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={state.multiProduct}
                  onChange={(e) => handleMultiProductToggle(e.target.checked)}
                />
                <span>Multi Product</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Salesman Name <span className="text-red-600">*</span></label>
                  <select className={selectClass} value={state.salesman1} onChange={e => setState(p => ({ ...p, salesman1: e.target.value }))} required>
                    <option value="">-Select-</option>
                    {SALESMEN.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Salesman Name (2) <span className="text-red-600">*</span></label>
                  <select className={selectClass} value={state.salesman2} onChange={e => setState(p => ({ ...p, salesman2: e.target.value }))} required>
                    <option value="">-Select-</option>
                    {SALESMEN.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {state.multiProduct && (
                  <div className="md:col-span-2 animate-in fade-in duration-500">
                    <label className={labelClass}>Salesman Name (3) <span className="text-red-600">*</span></label>
                    <select className={selectClass} value={state.salesman3} onChange={e => setState(p => ({ ...p, salesman3: e.target.value }))} required>
                      <option value="">-Select-</option>
                      {SALESMEN.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery & Exchange */}
            <div className="md:col-span-2 space-y-6 py-6 border-y border-gray-100">
              <div className="space-y-4">
                <label className={checkboxLabelClass}>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={state.deliveryLater} onChange={e => setState(p => ({ ...p, deliveryLater: e.target.checked }))} />
                  <span>Delivery Later</span>
                </label>
                {state.deliveryLater && (
                  <div className="animate-in slide-in-from-top-2 duration-300 pl-6 border-l-2 border-blue-100">
                    <label className={labelClass}>Delivery On? <span className="text-red-600">*</span></label>
                    <div className="relative">
                      <input
                        type="date"
                        className={inputClass}
                        value={state.deliveryDate}
                        onChange={e => setState(p => ({ ...p, deliveryDate: e.target.value }))}
                        required
                      />
                      <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className={checkboxLabelClass}>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={state.underExchange} onChange={e => setState(p => ({ ...p, underExchange: e.target.checked }))} />
                  <span>Under Exchange?</span>
                </label>
                {state.underExchange && (
                  <div className="animate-in slide-in-from-top-2 duration-300 pl-6 border-l-2 border-blue-100">
                    <label className={labelClass}>Under Exchange Product Info <span className="text-red-600">*</span></label>
                    <textarea
                      className={`${inputClass} h-20 resize-none`}
                      placeholder="Specify product details, age, and estimated value..."
                      value={state.exchangeInfo}
                      onChange={e => setState(p => ({ ...p, exchangeInfo: e.target.value }))}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Items Loop */}
          {state.products.map((row, idx) => (
            <div key={row.id} className="space-y-6 py-8 border-b border-gray-100 relative group animate-in fade-in duration-300">
              {state.products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProductRow(row.id)}
                  className="absolute right-0 top-8 text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <label className={labelClass}>Product Category <span className="text-red-600">*</span></label>
                  <select
                    className={selectClass}
                    value={row.category}
                    onChange={e => updateProductRow(row.id, { category: e.target.value })}
                    required
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Company/Brand <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Brand name"
                    value={row.brand}
                    onChange={e => updateProductRow(row.id, { brand: e.target.value })}
                    required
                  />
                </div>

                <div className="relative">
                  <label className={labelClass}>Product_{idx + 1} <span className="text-red-600">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Search for product..."
                      value={row.productName}
                      onChange={e => {
                        updateProductRow(row.id, { productName: e.target.value });
                        handleProductSearch(idx, e.target.value);
                      }}
                      required
                    />
                  </div>
                  {productSuggestions[idx] && productSuggestions[idx].length > 0 && (
                    <div className="absolute z-20 left-0 right-0 top-full bg-white border border-gray-300 shadow-2xl mt-1 overflow-hidden rounded-sm">
                      {productSuggestions[idx].map(p => (
                        <div
                          key={p.id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none flex justify-between items-center"
                          onClick={() => selectProductSuggestion(idx, row.id, p)}
                        >
                          <div>
                            <div className="text-sm font-bold text-gray-900">{p.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase">{p.sku}</div>
                          </div>
                          <div className="text-sm font-black text-blue-600">₹{p.rate}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Model No.{idx + 1} <span className="text-red-600">*</span></label>
                  <input type="text" className={inputClass} placeholder="Model code" value={row.modelNo} onChange={e => updateProductRow(row.id, { modelNo: e.target.value })} required />
                </div>

                <div>
                  <label className={labelClass}>Rate {idx + 1} <span className="text-red-600">*</span></label>
                  <input type="number" className={inputClass} placeholder="0.00" value={row.rate} onChange={e => updateProductRow(row.id, { rate: Number(e.target.value) })} required min="0" />
                </div>

                <div>
                  <label className={labelClass}>SKU{idx + 1} <span className="text-red-600">*</span></label>
                  <input type="text" className={inputClass} placeholder="Unique SKU" value={row.sku} onChange={e => updateProductRow(row.id, { sku: e.target.value })} required />
                </div>

                <div>
                  <label className={labelClass}>One Assist</label>
                  <select className={selectClass} value={row.oneAssist} onChange={e => updateProductRow(row.id, { oneAssist: e.target.value })}>
                    {ONE_ASSIST_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>One Assist Amount</label>
                  <input type="number" className={inputClass} placeholder="0.00" value={row.oneAssistAmount} onChange={e => updateProductRow(row.id, { oneAssistAmount: Number(e.target.value) })} min="0" />
                </div>

                <div className="md:col-span-2 space-y-4 pt-4">
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={state.diwaliSpinWin} onChange={e => setState(p => ({ ...p, diwaliSpinWin: e.target.checked }))} />
                    <span>Diwali 2024 Spin and Win</span>
                  </label>

                  <div className="w-full md:w-1/2">
                    <label className={labelClass}>Spin %</label>
                    <select className={selectClass} value={row.spinPercent} onChange={e => updateProductRow(row.id, { spinPercent: e.target.value })}>
                      {SPIN_PERCENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Serial Number {idx + 1}</label>
                  <input type="text" className={inputClass} placeholder="SN-XXXXXXXX" value={row.serialNo} onChange={e => updateProductRow(row.id, { serialNo: e.target.value })} />
                </div>

                <div className="md:col-span-2 pt-2 space-y-4">
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={row.installationRequired} onChange={e => updateProductRow(row.id, { installationRequired: e.target.checked })} />
                    <span>Installation/Demo Required?</span>
                  </label>

                  {row.installationRequired && (
                    <div className="animate-in slide-in-from-top-2 duration-300 pl-6 border-l-2 border-blue-100 w-full md:w-1/2">
                      <label className={labelClass}>Paid By? <span className="text-red-600">*</span></label>
                      <div className="relative">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="e.g. Customer, Company, Dealer..."
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
            <div className="py-4">
              <button
                type="button"
                onClick={addProductRow}
                className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 transition-all border-b-2 border-transparent hover:border-blue-700 pb-1"
              >
                <Plus size={18} /> Add Another Product
              </button>
            </div>
          )}

          {/* Multi-Product Section */}
          {state.multiProduct && (
            <div className="py-8 border-b border-gray-100 animate-in fade-in duration-500">
              <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest border-l-4 border-green-600 pl-4">ADDITIONAL PRODUCTS</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Product 2 */}
                <div className="relative">
                  <label className={labelClass}>Product 2</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Search Product 2"
                    value={state.product2}
                    onChange={(e) => {
                      handleMultiProductFieldChange("product2", e.target.value);
                      searchProduct("product2", e.target.value);
                    }}
                  />

                  {productSearch["product2"]?.length > 0 && (
                    <div className="absolute w-full bg-white border z-50 rounded shadow max-h-60 overflow-auto">
                      {productSearch["product2"].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => selectProduct("product2", p)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b"
                        >
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.sku}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Model No. 2</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Model code"
                    value={state.modelNo2}
                    onChange={(e) => handleMultiProductFieldChange('modelNo2', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Rate 2</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="0.00"
                    value={state.rate2}
                    onChange={(e) => handleMultiProductFieldChange('rate2', e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>SKU 2</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Unique SKU"
                    value={state.sku2}
                    onChange={(e) => handleMultiProductFieldChange('sku2', e.target.value)}
                  />
                </div>

                {/* Product 3 */}
                <div className="relative">
                  <label className={labelClass}>Product 3</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Search Product 3"
                    value={state.product3}
                    onChange={(e) => {
                      handleMultiProductFieldChange("product3", e.target.value);
                      searchProduct("product3", e.target.value);
                    }}
                  />

                  {productSearch["product3"]?.length > 0 && (
                    <div className="absolute w-full bg-white border z-50 rounded shadow max-h-60 overflow-auto">
                      {productSearch["product3"].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => selectProduct("product3", p)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b"
                        >
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.sku}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Model No. 3</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Model code"
                    value={state.modelNo3}
                    onChange={(e) => handleMultiProductFieldChange('modelNo3', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Rate 3</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="0.00"
                    value={state.rate3}
                    onChange={(e) => handleMultiProductFieldChange('rate3', e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>SKU 3</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Unique SKU"
                    value={state.sku3}
                    onChange={(e) => handleMultiProductFieldChange('sku3', e.target.value)}
                  />
                </div>

                {/* Product 4 */}
                <div className="relative">
                  <label className={labelClass}>Product 4</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Search Product 4"
                    value={state.product4}
                    onChange={(e) => {
                      handleMultiProductFieldChange("product4", e.target.value);
                      searchProduct("product4", e.target.value);
                    }}
                  />

                  {productSearch["product4"]?.length > 0 && (
                    <div className="absolute w-full bg-white border z-50 rounded shadow max-h-60 overflow-auto">
                      {productSearch["product4"].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => selectProduct("product4", p)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b"
                        >
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.sku}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Model No. 4</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Model code"
                    value={state.modelNo4}
                    onChange={(e) => handleMultiProductFieldChange('modelNo4', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Rate 4</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="0.00"
                    value={state.rate4}
                    onChange={(e) => handleMultiProductFieldChange('rate4', e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>SKU 4</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Unique SKU"
                    value={state.sku4}
                    onChange={(e) => handleMultiProductFieldChange('sku4', e.target.value)}
                  />
                </div>

                {/* Product 5 */}
                <div className="relative">
                  <label className={labelClass}>Product 5</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Search Product 5"
                    value={state.product5}
                    onChange={(e) => {
                      handleMultiProductFieldChange("product5", e.target.value);
                      searchProduct("product5", e.target.value);
                    }}
                  />

                  {productSearch["product5"]?.length > 0 && (
                    <div className="absolute w-full bg-white border z-50 rounded shadow max-h-60 overflow-auto">
                      {productSearch["product5"].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => selectProduct("product5", p)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b"
                        >
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.sku}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Model No. 5</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Model code"
                    value={state.modelNo5}
                    onChange={(e) => handleMultiProductFieldChange('modelNo5', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Rate 5</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="0.00"
                    value={state.rate5}
                    onChange={(e) => handleMultiProductFieldChange('rate5', e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>SKU 5</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Unique SKU"
                    value={state.sku5}
                    onChange={(e) => handleMultiProductFieldChange('sku5', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Discount Section */}
          <div className="py-6 border-y border-gray-100 space-y-6">
            <label className={checkboxLabelClass}>
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={state.discount} onChange={e => setState(p => ({ ...p, discount: e.target.checked }))} />
              <span className="text-lg">Discount?</span>
            </label>

            {state.discount && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500 p-6 bg-blue-50/50 rounded-sm">
                <div>
                  <label className={labelClass}>How Much? <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="Amount in ₹"
                      value={state.discountAmount}
                      onChange={e => setState(p => ({ ...p, discountAmount: Number(e.target.value) }))}
                      required
                    />
                    <Percent className="absolute right-3 top-2.5 text-blue-300" size={18} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Discount Approved By? <span className="text-red-600">*</span></label>
                  <select
                    className={selectClass}
                    value={state.discountApprover}
                    onChange={e => setState(p => ({ ...p, discountApprover: e.target.value }))}
                    required
                  >
                    <option value="">-Select Approver-</option>
                    {(DISCOUNTERS_BY_LOCATION[state.customer.location] || []).map(person => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Signature of Discount Approver <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`${inputClass} italic font-serif`}
                      placeholder="Full Name as signature..."
                      value={state.discountSignature}
                      onChange={e => setState(p => ({ ...p, discountSignature: e.target.value }))}
                      required
                    />
                    <PenTool className="absolute right-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SCHEME DETAILS SECTION */}
          <div className="pt-10">
            <h2 className="text-xl font-black text-gray-900 mb-10 uppercase tracking-widest border-l-4 border-blue-600 pl-4">SCHEME DETAILS</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <label className={labelClass}>Scheme No.</label>
                <input type="text" className={inputClass} placeholder="Enter scheme code" value={state.schemeNo} onChange={e => setState(p => ({ ...p, schemeNo: e.target.value }))} />
              </div>

              <div>
                <label className={labelClass}>Gift Contribution Amount</label>
                <input type="number" className={inputClass} placeholder="0.00" value={state.giftAmount} onChange={e => setState(p => ({ ...p, giftAmount: Number(e.target.value) }))} min="0" />
              </div>

              <div className="md:col-span-2">
                <label className={`${labelClass} text-lg mb-4`}>Payment Mode <span className="text-red-600">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {PAYMENT_MODES.map(mode => (
                    <label key={mode} className={`${checkboxLabelClass} p-3 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors ${state.paymentMode === mode ? 'border-blue-400 bg-blue-50/20' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMode"
                        value={mode}
                        checked={state.paymentMode === mode}
                        onChange={e => setState(p => ({ ...p, paymentMode: e.target.value }))}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(state.paymentMode === 'Credit Card' || state.paymentMode === 'Debit Card') && (
                <div className="md:col-span-1 animate-in slide-in-from-top-4 duration-500">
                  <label className={labelClass}>Which Bank ({state.paymentMode}) <span className="text-red-600">*</span></label>
                  <select
                    className={selectClass}
                    value={state.bank}
                    onChange={e => setState(p => ({ ...p, bank: e.target.value }))}
                    required
                  >
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {state.paymentMode === 'Other' && (
                <div className="md:col-span-1 animate-in slide-in-from-top-4 duration-500">
                  <label className={labelClass}>Please Specify Method <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Voucher, Gift Card..."
                      value={state.paymentOther}
                      onChange={e => setState(p => ({ ...p, paymentOther: e.target.value }))}
                      required
                    />
                    <Info className="absolute right-3 top-2.5 text-blue-300" size={18} />
                  </div>
                </div>
              )}

              <div className="md:col-span-2 pt-4">
                <label className={labelClass}>Additional Information</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Notes for billing / account team"
                  value={state.additionalInfo}
                  onChange={e => setState(p => ({ ...p, additionalInfo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-12 pb-16">
            <button
              type="button"
              className="px-10 py-3 bg-[#444444] text-white font-bold rounded-sm shadow-md hover:bg-black transition-all active:scale-95"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="px-12 py-3 bg-[#2980b9] text-white font-black rounded-sm shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-3 active:scale-95"
            >
              {state.isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {state.isSubmitting ? "Processing..." : "Submit Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sales;