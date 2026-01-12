import { ProductItem, MonthlySchemeConfig, CalculationResult } from '../types';

export const calculateItemTotal = (
  item: ProductItem, 
  schemeConfig?: MonthlySchemeConfig
): ProductItem => {
  const unitPrice = item.unitPrice || 0;
  const quantity = item.quantity || 1;
  const discountPercent = item.discountPercentage || 0;
  
  // Calculate base amounts
  const baseTotal = unitPrice * quantity;
  const discountAmount = baseTotal * (discountPercent / 100);
  
  // Calculate scheme payout
  let payoutAmount = 0;
  if (schemeConfig) {
    const isEligible = !schemeConfig.minimumPurchase || baseTotal >= schemeConfig.minimumPurchase;
    
    if (isEligible) {
      switch (schemeConfig.schemeType) {
        case 'percentage':
          if (schemeConfig.percentage) {
            payoutAmount = baseTotal * (schemeConfig.percentage / 100);
          }
          break;
        case 'fixed':
          payoutAmount = schemeConfig.fixedAmount || 0;
          break;
        case 'tiered':
          // Implement tiered logic based on quantity
          if (schemeConfig.tiers) {
            const applicableTier = schemeConfig.tiers.find(tier => 
              quantity >= tier.minQuantity && 
              (!tier.maxQuantity || quantity <= tier.maxQuantity)
            );
            if (applicableTier) {
              payoutAmount = baseTotal * (applicableTier.discount / 100);
            }
          }
          break;
      }
    }
  }
  
  const totalPrice = baseTotal - discountAmount + payoutAmount;
  
  return {
    ...item,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    payoutAmount: parseFloat(payoutAmount.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
};

export const calculateSummary = (
  items: ProductItem[],
  schemeConfig?: MonthlySchemeConfig
): CalculationResult => {
  const calculatedItems = items.map(item => calculateItemTotal(item, schemeConfig));
  
  const subtotal = calculatedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalDiscount = calculatedItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  const totalPayout = calculatedItems.reduce((sum, item) => sum + (item.payoutAmount || 0), 0);
  const grandTotal = subtotal - totalDiscount + totalPayout;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalPayout: parseFloat(totalPayout.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    items: calculatedItems
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const validateClaimData = (data: any): string[] => {
  const errors: string[] = [];
  
  // Required fields validation
  const requiredFields = [
    'supplierName', 'vendorName', 'claimType', 'schemeType', 
    'claimDetails', 'claimMadeBy'
  ];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  
  // Product items validation
  if (data.productItems && data.productItems.length > 0) {
    data.productItems.forEach((item: any, index: number) => {
      if (!item.brandModel || item.brandModel.trim() === '') {
        errors.push(`Product ${index + 1}: Model is required`);
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push(`Product ${index + 1}: Unit price must be greater than 0`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Product ${index + 1}: Quantity must be greater than 0`);
      }
    });
  }
  
  return errors;
};