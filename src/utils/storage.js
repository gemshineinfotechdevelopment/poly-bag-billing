import { DEFAULT_COMPANY, DEFAULT_CUSTOMERS, DEFAULT_PRODUCTS, DEFAULT_PURCHASES, INITIAL_SAMPLE_INVOICE } from '../constants/defaults';

const STORAGE_KEYS = {
  INVOICES: 'poly_bag_invoices_v2',
  COMPANY: 'poly_bag_company_v2',
  CUSTOMERS: 'poly_bag_customers_v2',
  PRODUCTS: 'poly_bag_products_v2',
  PURCHASES: 'poly_bag_purchases_v2',
  ACTIVE_INVOICE: 'poly_bag_active_draft_v2',
  SETTINGS: 'poly_bag_settings_v2'
};

// Safe localStorage helper
function safeGet(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading key ${key} from storage:`, e);
    return defaultValue;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing key ${key} to storage:`, e);
  }
}

/**
 * Initialize default data if fresh visit
 */
export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.COMPANY)) {
    safeSet(STORAGE_KEYS.COMPANY, DEFAULT_COMPANY);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    safeSet(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    safeSet(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
    safeSet(STORAGE_KEYS.PURCHASES, DEFAULT_PURCHASES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    safeSet(STORAGE_KEYS.INVOICES, [INITIAL_SAMPLE_INVOICE]);
  }
}

/**
 * Extract integer number from invoice string like 'INV-1001' or 'PB/26-27/0043'
 */
export function extractInvoiceNumberInt(invoiceNumber) {
  if (!invoiceNumber) return 0;
  const match = String(invoiceNumber).match(/\d+/g);
  if (!match || match.length === 0) return 0;
  const num = parseInt(match[match.length - 1], 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Invoices API
 */
export function getSavedInvoices() {
  initializeStorage();
  let list = safeGet(STORAGE_KEYS.INVOICES, [INITIAL_SAMPLE_INVOICE]);

  // Clean up legacy inconsistent prefixes (e.g. PB/26-27/0043 -> INV-1002)
  let changed = false;
  let hasInv1001 = list.some(inv => inv.invoiceNumber === 'INV-1001');

  list = list.map(inv => {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith('PB/')) {
      changed = true;
      return {
        ...inv,
        invoiceNumber: hasInv1001 ? 'INV-1002' : 'INV-1001'
      };
    }
    return inv;
  });

  if (changed) {
    safeSet(STORAGE_KEYS.INVOICES, list);
  }

  return list;
}

export function saveInvoiceToStorage(invoice) {
  const invoices = getSavedInvoices();
  const index = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (index >= 0) {
    invoices[index] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.push({ ...invoice, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  safeSet(STORAGE_KEYS.INVOICES, invoices);
  return invoices;
}

export function deleteInvoiceFromStorage(id) {
  const invoices = getSavedInvoices().filter(inv => inv.id !== id);
  safeSet(STORAGE_KEYS.INVOICES, invoices);
  return invoices;
}

/**
 * Products & Stock Inventory API
 */
export function getProductsList() {
  initializeStorage();
  return safeGet(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
}

export function saveProduct(product) {
  const products = getProductsList();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    products.push({
      ...product,
      id: product.id || `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  safeSet(STORAGE_KEYS.PRODUCTS, products);
  return products;
}

export function deleteProduct(id) {
  const products = getProductsList().filter(p => p.id !== id);
  safeSet(STORAGE_KEYS.PRODUCTS, products);
  return products;
}

/**
 * Adjust stock quantity (+ to add stock, - to deduct on billing)
 */
export function adjustProductStock(productId, delta) {
  const products = getProductsList();
  const index = products.findIndex(p => p.id === productId);
  if (index >= 0) {
    const current = parseFloat(products[index].currentStock) || 0;
    const updatedStock = Math.max(0, current + parseFloat(delta));
    products[index] = { ...products[index], currentStock: Math.round(updatedStock * 10) / 10 };
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  }
  return products;
}

/**
 * Company Profile API
 */
export function getCompanyProfile() {
  initializeStorage();
  return safeGet(STORAGE_KEYS.COMPANY, DEFAULT_COMPANY);
}

export function saveCompanyProfile(profile) {
  safeSet(STORAGE_KEYS.COMPANY, profile);
  return profile;
}

/**
 * Customers API
 */
export function getCustomersList() {
  initializeStorage();
  return safeGet(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
}

export function saveCustomer(customer) {
  const customers = getCustomersList();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.push({ ...customer, id: customer.id || `cust-${Date.now()}` });
  }
  safeSet(STORAGE_KEYS.CUSTOMERS, customers);
  return customers;
}

export function deleteCustomer(id) {
  const customers = getCustomersList().filter(c => c.id !== id);
  safeSet(STORAGE_KEYS.CUSTOMERS, customers);
  return customers;
}

/**
 * Purchases (Stock Inward / Vendor Bills) API
 */
export function getPurchasesList() {
  initializeStorage();
  return safeGet(STORAGE_KEYS.PURCHASES, DEFAULT_PURCHASES);
}

export function generateNextPurchaseNumber(purchasesList = null) {
  const purchases = purchasesList || getPurchasesList();
  let maxNum = 100;
  purchases.forEach(p => {
    const raw = (p.purchaseNumber || p.id || '').toString();
    const match = raw.match(/\d+/g);
    if (match) {
      const num = parseInt(match[match.length - 1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });
  return `PUR-${maxNum + 1}`;
}

export function savePurchase(purchase) {
  const purchases = getPurchasesList();
  const isNew = !purchases.some(p => p.id === purchase.id);
  const index = purchases.findIndex(p => p.id === purchase.id);

  const purchaseNumber = purchase.purchaseNumber || generateNextPurchaseNumber(purchases);
  const date = purchase.date || purchase.purchaseDate || new Date().toISOString().slice(0, 10);
  const vendorName = purchase.vendorName || purchase.supplierName || 'Vendor';

  const normalized = {
    ...purchase,
    id: purchase.id || `PUR-${Date.now()}`,
    purchaseNumber,
    date,
    purchaseDate: date,
    vendorName,
    supplierName: vendorName,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    purchases[index] = normalized;
  } else {
    normalized.createdAt = new Date().toISOString();
    purchases.unshift(normalized);
  }
  safeSet(STORAGE_KEYS.PURCHASES, purchases);

  // If new purchase, auto-adjust incoming stock for the product!
  if (isNew && purchase.productId && purchase.quantity) {
    const qty = parseFloat(purchase.quantity) || 0;
    if (qty > 0) {
      adjustProductStock(purchase.productId, qty);
    }
  }

  return purchases;
}

export function deletePurchase(id) {
  const purchases = getPurchasesList().filter(p => p.id !== id);
  safeSet(STORAGE_KEYS.PURCHASES, purchases);
  return purchases;
}

/**
 * Generate a new invoice serial number in strict sequential order (INV-1001, INV-1002, INV-1003...)
 */
export function generateNextInvoiceNumber(invoices) {
  const list = invoices || getSavedInvoices();
  if (!list || list.length === 0) {
    return 'INV-1001';
  }

  let maxNum = 1000;
  let prefix = 'INV';

  list.forEach(inv => {
    if (!inv || !inv.invoiceNumber) return;
    const str = String(inv.invoiceNumber).trim();

    // Preserve prefix if present (e.g. INV)
    const prefixMatch = str.match(/^([A-Za-z]+)[-_/]?/);
    if (prefixMatch && prefixMatch[1]) {
      prefix = prefixMatch[1].toUpperCase();
    }

    const num = extractInvoiceNumberInt(str);
    if (num > maxNum) {
      maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  return `${prefix}-${nextNum}`;
}

/**
 * Export all data to JSON
 */
export function exportAllData() {
  const data = {
    company: getCompanyProfile(),
    customers: getCustomersList(),
    products: getProductsList(),
    purchases: getPurchasesList(),
    invoices: getSavedInvoices(),
    exportDate: new Date().toISOString(),
    version: '2.2'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `poly_bag_billing_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON
 */
export function importDataFromJson(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    if (data.company) safeSet(STORAGE_KEYS.COMPANY, data.company);
    if (data.customers && Array.isArray(data.customers)) safeSet(STORAGE_KEYS.CUSTOMERS, data.customers);
    if (data.products && Array.isArray(data.products)) safeSet(STORAGE_KEYS.PRODUCTS, data.products);
    if (data.purchases && Array.isArray(data.purchases)) safeSet(STORAGE_KEYS.PURCHASES, data.purchases);
    if (data.invoices && Array.isArray(data.invoices)) safeSet(STORAGE_KEYS.INVOICES, data.invoices);
    return { success: true, message: 'Data restored successfully!' };
  } catch (err) {
    return { success: false, message: 'Invalid JSON file format: ' + err.message };
  }
}
