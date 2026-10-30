/**
 * Format number as Indian Currency (INR) or standard currency
 */
export function formatCurrency(amount, currency = 'INR') {
  const num = Number(amount) || 0;
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Format simple number with comma separation
 */
export function formatNumber(num, decimals = 2) {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(n);
}

/**
 * Convert numerical number to Indian Currency Words (Lakhs & Crores)
 */
export function numberToWords(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return twoDigits[n - 10];
    const tens = Math.floor(n / 10);
    const units = n % 10;
    return tensMultiple[tens] + (units ? ' ' + singleDigits[units] : '');
  }

  function convertThreeDigits(n) {
    let result = '';
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    if (hundreds) {
      result += singleDigits[hundreds] + ' Hundred';
      if (remainder) result += ' and ';
    }
    if (remainder) {
      result += convertTwoDigits(remainder);
    }
    return result;
  }

  let words = '';
  const crores = Math.floor(num / 10000000);
  let rem = num % 10000000;

  const lakhs = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousands = Math.floor(rem / 1000);
  rem = rem % 1000;

  if (crores > 0) {
    words += convertThreeDigits(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertThreeDigits(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertThreeDigits(thousands) + ' Thousand ';
  }
  if (rem > 0) {
    words += convertThreeDigits(rem);
  }

  return (words.trim() + ' Rupees Only');
}

/**
 * Format standard YYYY-MM-DD date string to readable format
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Compute line item total and tax
 */
export function calculateItemRow(item) {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  const gstRate = parseFloat(item.gstRate) || 0;
  const unit = item.unit || item.billingMode || 'pcs';

  let baseAmount = 0;
  if (unit === '1000pcs') {
    baseAmount = (qty / 1000) * rate;
  } else {
    baseAmount = qty * rate;
  }

  const taxAmount = (baseAmount * gstRate) / 100;
  const totalAmount = baseAmount + taxAmount;

  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

/**
 * Calculate full totals of an invoice
 */
export function calculateInvoiceTotals(invoice) {
  if (!invoice) return {};

  let itemsBaseTotal = 0;
  let itemsTaxTotal = 0;
  let totalWeightKg = 0;
  let totalBagsCount = 0;

  // Breakdown by tax rate
  const taxBreakdown = {};

  (invoice.items || []).forEach(item => {
    const row = calculateItemRow(item);
    itemsBaseTotal += row.baseAmount;
    itemsTaxTotal += row.taxAmount;

    const unit = item.unit || item.billingMode || 'pcs';
    if (unit === 'kg') {
      totalWeightKg += parseFloat(item.quantity) || 0;
      totalBagsCount += parseFloat(item.calculatedPcs) || 0;
    } else {
      totalBagsCount += parseFloat(item.quantity) || 0;
      totalWeightKg += parseFloat(item.calculatedWeightKg) || 0;
    }

    const rateKey = `${item.gstRate || 0}%`;
    if (!taxBreakdown[rateKey]) {
      taxBreakdown[rateKey] = { taxable: 0, tax: 0, rate: item.gstRate || 0 };
    }
    taxBreakdown[rateKey].taxable += row.baseAmount;
    taxBreakdown[rateKey].tax += row.taxAmount;
  });

  const cylinderCharge = parseFloat(invoice.cylinderCharge) || 0;
  const freightCharge = parseFloat(invoice.freightCharge) || 0;
  const packagingCharge = parseFloat(invoice.packagingCharge) || 0;

  // Additional taxable charges
  const additionalCharges = cylinderCharge + freightCharge + packagingCharge;
  
  // Extra charges standard GST (default 18% if tax applies, or 0 if exempt)
  const additionalChargesTax = itemsTaxTotal > 0 ? (additionalCharges * 0.18) : 0;

  // Discounts
  let discountAmount = parseFloat(invoice.discountAmount) || 0;
  if (invoice.discountPercent && parseFloat(invoice.discountPercent) > 0) {
    discountAmount = (itemsBaseTotal * parseFloat(invoice.discountPercent)) / 100;
  }

  const taxableAmount = Math.max(0, itemsBaseTotal - discountAmount + additionalCharges);
  const totalTax = itemsTaxTotal + additionalChargesTax;

  const isInterstate = invoice.supplyType === 'interstate';
  const igst = isInterstate ? totalTax : 0;
  const cgst = isInterstate ? 0 : totalTax / 2;
  const sgst = isInterstate ? 0 : totalTax / 2;

  const rawGrandTotal = taxableAmount + totalTax;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((roundedGrandTotal - rawGrandTotal) * 100) / 100;

  const paidAmount = parseFloat(invoice.paidAmount) || 0;
  const balanceDue = Math.max(0, roundedGrandTotal - paidAmount);

  return {
    itemsBaseTotal: Math.round(itemsBaseTotal * 100) / 100,
    itemsTaxTotal: Math.round(itemsTaxTotal * 100) / 100,
    additionalCharges,
    additionalChargesTax: Math.round(additionalChargesTax * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    roundOff,
    grandTotal: roundedGrandTotal,
    amountInWords: numberToWords(roundedGrandTotal),
    paidAmount,
    balanceDue: Math.round(balanceDue * 100) / 100,
    totalWeightKg: Math.round(totalWeightKg * 10) / 10,
    totalBagsCount: Math.round(totalBagsCount),
    taxBreakdown
  };
}
