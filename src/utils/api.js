/**
 * MongoDB Atlas Backend API Client
 * Seamlessly interfaces with the Express/Mongoose backend at /api
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Check MongoDB connection status
 */
export async function getBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Status error');
    return await res.json();
  } catch (err) {
    return {
      connected: false,
      status: 'Server Offline / Local Mode',
      counts: { invoices: 0, products: 0, purchases: 0, customers: 0 },
      hasUriConfigured: false
    };
  }
}

/**
 * Connect MongoDB Atlas URI from Settings
 */
export async function connectAtlasUriApi(uri) {
  try {
    const res = await fetch(`${API_BASE}/config/uri`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Server not reachable: ' + err.message };
  }
}

/**
 * Upload & Seed local browser data to MongoDB Atlas
 */
export async function seedLocalDataToAtlas(data) {
  try {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---------------- INVOICES ----------------
export async function fetchInvoicesApi() {
  const res = await fetch(`${API_BASE}/invoices`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return await res.json();
}

export async function saveInvoiceApi(invoice) {
  const res = await fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice)
  });
  if (!res.ok) throw new Error('Failed to save invoice');
  return await res.json();
}

export async function deleteInvoiceApi(id) {
  const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete invoice');
  return await res.json();
}

// ---------------- PRODUCTS ----------------
export async function fetchProductsApi() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
}

export async function saveProductApi(product) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to save product');
  return await res.json();
}

export async function adjustStockApi(productId, delta) {
  const res = await fetch(`${API_BASE}/products/${productId}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta })
  });
  if (!res.ok) throw new Error('Failed to adjust stock');
  return await res.json();
}

export async function deleteProductApi(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
  return await res.json();
}

// ---------------- PURCHASES ----------------
export async function fetchPurchasesApi() {
  const res = await fetch(`${API_BASE}/purchases`);
  if (!res.ok) throw new Error('Failed to fetch purchases');
  return await res.json();
}

export async function savePurchaseApi(purchase) {
  const res = await fetch(`${API_BASE}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purchase)
  });
  if (!res.ok) throw new Error('Failed to save purchase');
  return await res.json();
}

export async function deletePurchaseApi(id) {
  const res = await fetch(`${API_BASE}/purchases/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete purchase');
  return await res.json();
}

// ---------------- CUSTOMERS ----------------
export async function fetchCustomersApi() {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return await res.json();
}

export async function saveCustomerApi(customer) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  });
  if (!res.ok) throw new Error('Failed to save customer');
  return await res.json();
}

export async function deleteCustomerApi(id) {
  const res = await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer');
  return await res.json();
}

// ---------------- COMPANY PROFILE ----------------
export async function fetchCompanyApi() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch company');
  return await res.json();
}

export async function saveCompanyApi(company) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(company)
  });
  if (!res.ok) throw new Error('Failed to save company');
  return await res.json();
}

