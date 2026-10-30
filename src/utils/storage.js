import { DEFAULT_COMPANY, DEFAULT_CUSTOMERS, INITIAL_SAMPLE_INVOICE } from '../constants/defaults';

const STORAGE_KEYS = {
  INVOICES: 'poly_bag_invoices_v2',
  COMPANY: 'poly_bag_company_v2',
  CUSTOMERS: 'poly_bag_customers_v2',
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
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    safeSet(STORAGE_KEYS.INVOICES, [INITIAL_SAMPLE_INVOICE]);
  }
}

/**
 * Invoices API
 */
export function getSavedInvoices() {
  initializeStorage();
  return safeGet(STORAGE_KEYS.INVOICES, [INITIAL_SAMPLE_INVOICE]);
}

export function saveInvoiceToStorage(invoice) {
  const invoices = getSavedInvoices();
  const index = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (index >= 0) {
    invoices[index] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.unshift({ ...invoice, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
 * Generate a new invoice serial number
 */
export function generateNextInvoiceNumber(invoices) {
  const list = invoices || getSavedInvoices();
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const nextYearSuffix = (new Date().getFullYear() + 1).toString().slice(-2);
  const prefix = `PB/${yearSuffix}-${nextYearSuffix}/`;

  let maxNum = 42;
  list.forEach(inv => {
    if (inv.invoiceNumber && inv.invoiceNumber.includes(prefix)) {
      const parts = inv.invoiceNumber.split('/');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });

  return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
}

/**
 * Export all data to JSON
 */
export function exportAllData() {
  const data = {
    company: getCompanyProfile(),
    customers: getCustomersList(),
    invoices: getSavedInvoices(),
    exportDate: new Date().toISOString(),
    version: '1.0'
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
    if (data.invoices && Array.isArray(data.invoices)) safeSet(STORAGE_KEYS.INVOICES, data.invoices);
    return { success: true, message: 'Data restored successfully!' };
  } catch (err) {
    return { success: false, message: 'Invalid JSON file format: ' + err.message };
  }
}

