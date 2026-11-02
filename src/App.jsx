import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import PurchasesPage from './pages/PurchasesPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import {
  getSavedInvoices,
  saveInvoiceToStorage,
  deleteInvoiceFromStorage,
  getCompanyProfile,
  saveCompanyProfile,
  getCustomersList,
  saveCustomer,
  deleteCustomer,
  getProductsList,
  saveProduct,
  deleteProduct,
  adjustProductStock,
  getPurchasesList,
  savePurchase,
  deletePurchase,
  generateNextInvoiceNumber,
  generateNextPurchaseNumber,
  exportAllData,
  importDataFromJson
} from './utils/storage';
import {
  getBackendStatus,
  fetchInvoicesApi,
  saveInvoiceApi,
  deleteInvoiceApi,
  fetchProductsApi,
  saveProductApi,
  deleteProductApi,
  adjustStockApi,
  fetchPurchasesApi,
  savePurchaseApi,
  deletePurchaseApi,
  fetchCustomersApi,
  saveCustomerApi,
  deleteCustomerApi,
  fetchCompanyApi,
  saveCompanyApi
} from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState([]);
  const [company, setCompany] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMongoConnected, setIsMongoConnected] = useState(false);

  // Initialize data on mount: loads locally first, then syncs with MongoDB Atlas if connected
  useEffect(() => {
    const loadedInvoices = getSavedInvoices();
    const loadedCompany = getCompanyProfile();
    const loadedCustomers = getCustomersList();
    const loadedProducts = getProductsList();
    const loadedPurchases = getPurchasesList();

    setInvoices(loadedInvoices);
    setCompany(loadedCompany);
    setCustomers(loadedCustomers);
    setProducts(loadedProducts);
    setPurchases(loadedPurchases);

    // Sync with MongoDB Atlas if server is running and connected
    getBackendStatus().then(async (status) => {
      if (status && status.connected) {
        setIsMongoConnected(true);
        try {
          const [dbInvoices, dbProducts, dbPurchases, dbCustomers, dbCompany] = await Promise.all([
            fetchInvoicesApi(),
            fetchProductsApi(),
            fetchPurchasesApi(),
            fetchCustomersApi(),
            fetchCompanyApi()
          ]);

          // Always set state directly from MongoDB Atlas when connected
          if (Array.isArray(dbInvoices)) setInvoices(dbInvoices);
          if (Array.isArray(dbProducts)) setProducts(dbProducts);
          if (Array.isArray(dbPurchases)) setPurchases(dbPurchases);
          if (Array.isArray(dbCustomers)) setCustomers(dbCustomers);
          if (dbCompany && Object.keys(dbCompany).length > 0) setCompany(dbCompany);
        } catch {
          console.warn('Atlas sync error, running in local mode:', err.message);
        }
      } else {
        setIsMongoConnected(false);
      }
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Count low stock items for alert badge in navbar
  const lowStockCount = products.filter(p => {
    const stock = parseFloat(p.currentStock) || 0;
    const minAlert = parseFloat(p.minStockAlert) || 10;
    return stock <= minAlert;
  }).length;

  // Create a fresh blank invoice
  const handleStartNewInvoice = (prefilledCustomer = null) => {
    const nextInvoiceNumber = generateNextInvoiceNumber(invoices);
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

    const newInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: nextInvoiceNumber,
      date: today,
      dueDate: due,
      poNumber: '',
      transportMode: '',
      paymentTerms: 'Immediate',
      paymentStatus: 'pending',
      paidAmount: 0,
      customer: prefilledCustomer ? {
        name: prefilledCustomer.name,
        contactPerson: prefilledCustomer.contactPerson || '',
        phone: prefilledCustomer.phone || '',
        billingAddress: prefilledCustomer.billingAddress || '',
        gstin: prefilledCustomer.gstin || ''
      } : {
        name: '',
        contactPerson: '',
        phone: '',
        billingAddress: '',
        gstin: ''
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: 'Poly Bags',
          unit: 'kg',
          quantity: 10,
          rate: 150,
          gstRate: 0,
          hasAdvancedSpecs: false
        }
      ],
      freightCharge: 0,
      cylinderCharge: 0,
      discountAmount: 0,
      notes: 'Thank you for your business!'
    };

    setActiveInvoice(newInvoice);
    setActiveTab('invoices');
  };

  // Start a new invoice prefilled with a catalog product
  const handleStartNewInvoiceWithProduct = (product) => {
    const nextInvoiceNumber = generateNextInvoiceNumber(invoices);
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

    const newInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: nextInvoiceNumber,
      date: today,
      dueDate: due,
      poNumber: '',
      transportMode: '',
      paymentTerms: 'Immediate',
      paymentStatus: 'pending',
      paidAmount: 0,
      customer: {
        name: '',
        contactPerson: '',
        phone: '',
        billingAddress: '',
        gstin: ''
      },
      items: [
        {
          id: `item-${Date.now()}`,
          productId: product.id,
          description: product.name,
          unit: product.unit || 'kg',
          quantity: 10,
          rate: product.sellingPrice || 0,
          gstRate: 0,
          hasAdvancedSpecs: false
        }
      ],
      freightCharge: 0,
      cylinderCharge: 0,
      discountAmount: 0,
      notes: 'Thank you for your business!'
    };

    setActiveInvoice(newInvoice);
    setActiveTab('invoices');
    showToast(`Started new bill for ${product.name}!`);
  };

  // Save invoice to MongoDB Atlas database & local cache
  const handleSaveInvoice = async (invoiceToSave) => {
    const isNew = !invoices.some(i => i.id === invoiceToSave.id);
    
    // Deduct stock locally as immediate feedback
    if (isNew && invoiceToSave.items && invoiceToSave.items.length > 0) {
      invoiceToSave.items.forEach(item => {
        const qty = parseFloat(item.quantity) || 0;
        if (qty > 0) {
          const matchedProd = products.find(p =>
            p.id === item.productId ||
            (p.name && item.description && p.name.trim().toLowerCase() === item.description.trim().toLowerCase())
          );
          if (matchedProd) {
            adjustProductStock(matchedProd.id, -qty);
          }
        }
      });
      setProducts(getProductsList());
    }

    // Always mirror to localStorage
    saveInvoiceToStorage(invoiceToSave);
    setActiveInvoice(invoiceToSave);

    // Save directly to MongoDB Atlas & re-fetch from database
    try {
      await saveInvoiceApi(invoiceToSave);
      const [freshInvoices, freshProducts] = await Promise.all([
        fetchInvoicesApi(),
        fetchProductsApi()
      ]);
      if (Array.isArray(freshInvoices)) setInvoices(freshInvoices);
      if (Array.isArray(freshProducts)) setProducts(freshProducts);
      showToast(`Invoice ${invoiceToSave.invoiceNumber} saved to database!`);
    } catch {
      console.warn('Saved locally (offline fallback):', err.message);
      setInvoices(getSavedInvoices());
      showToast(`Invoice ${invoiceToSave.invoiceNumber} saved (local mode)!`);
    }
  };

  // Delete an invoice from database
  const handleDeleteInvoice = async (id) => {
    if (confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
      deleteInvoiceFromStorage(id);
      try {
        await deleteInvoiceApi(id);
        const [freshInvoices, freshProducts] = await Promise.all([
          fetchInvoicesApi(),
          fetchProductsApi()
        ]);
        if (Array.isArray(freshInvoices)) setInvoices(freshInvoices);
        if (Array.isArray(freshProducts)) setProducts(freshProducts);
        showToast('Invoice deleted from database.');
      } catch {
        setInvoices(getSavedInvoices());
        showToast('Invoice deleted.');
      }
    }
  };

  // Toggle payment status in database
  const handleTogglePaymentStatus = async (id) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    const nextStatus = inv.paymentStatus === 'pending' ? 'partial' : inv.paymentStatus === 'partial' ? 'paid' : 'pending';
    const updatedInv = { ...inv, paymentStatus: nextStatus };
    saveInvoiceToStorage(updatedInv);
    try {
      await saveInvoiceApi(updatedInv);
      const fresh = await fetchInvoicesApi();
      if (Array.isArray(fresh)) setInvoices(fresh);
      showToast(`Status updated to ${nextStatus.toUpperCase()} in database`);
    } catch {
      setInvoices(getSavedInvoices());
      showToast(`Status updated to ${nextStatus.toUpperCase()}`);
    }
  };

  // Save company profile in database
  const handleSaveCompany = async (profile) => {
    saveCompanyProfile(profile);
    try {
      await saveCompanyApi(profile);
      const fresh = await fetchCompanyApi();
      if (fresh) setCompany(fresh);
      showToast('Company profile saved to database!');
    } catch {
      setCompany(getCompanyProfile());
      showToast('Company profile saved!');
    }
  };

  // Customer handlers (database-driven)
  const handleSaveCustomer = async (cust) => {
    saveCustomer(cust);
    try {
      await saveCustomerApi(cust);
      const fresh = await fetchCustomersApi();
      if (Array.isArray(fresh)) setCustomers(fresh);
      showToast('Customer saved to database!');
    } catch {
      setCustomers(getCustomersList());
      showToast('Customer saved to directory!');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (confirm('Delete this customer from directory?')) {
      deleteCustomer(id);
      try {
        await deleteCustomerApi(id);
        const fresh = await fetchCustomersApi();
        if (Array.isArray(fresh)) setCustomers(fresh);
        showToast('Customer removed from database.');
      } catch {
        setCustomers(getCustomersList());
        showToast('Customer removed.');
      }
    }
  };

  // Product Catalog & Stock handlers (database-driven)
  const handleSaveProduct = async (prod) => {
    saveProduct(prod);
    try {
      await saveProductApi(prod);
      const fresh = await fetchProductsApi();
      if (Array.isArray(fresh)) setProducts(fresh);
      showToast(`Product "${prod.name}" saved to database!`);
    } catch {
      setProducts(getProductsList());
      showToast(`Product "${prod.name}" saved!`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Delete this product from catalog?')) {
      deleteProduct(id);
      try {
        await deleteProductApi(id);
        const fresh = await fetchProductsApi();
        if (Array.isArray(fresh)) setProducts(fresh);
        showToast('Product removed from database.');
      } catch {
        setProducts(getProductsList());
        showToast('Product removed from catalog.');
      }
    }
  };

  const handleAdjustStock = async (id, delta) => {
    adjustProductStock(id, delta);
    try {
      await adjustStockApi(id, delta);
      const fresh = await fetchProductsApi();
      if (Array.isArray(fresh)) setProducts(fresh);
      showToast('Stock quantity updated in database!');
    } catch {
      setProducts(getProductsList());
      showToast('Stock quantity updated!');
    }
  };

  // Purchases (Stock Inward) handlers (database-driven)
  const handleSavePurchase = async (purchase) => {
    const purchaseNumber = purchase.purchaseNumber || generateNextPurchaseNumber(purchases);
    const date = purchase.date || purchase.purchaseDate || new Date().toISOString().slice(0, 10);
    const vendorName = purchase.vendorName || purchase.supplierName || 'Vendor';

    const enriched = {
      ...purchase,
      id: purchase.id || `PUR-${Date.now()}`,
      purchaseNumber,
      date,
      purchaseDate: date,
      vendorName,
      supplierName: vendorName
    };

    savePurchase(enriched);
    try {
      await savePurchaseApi(enriched);
      const [freshPurchases, freshProducts] = await Promise.all([
        fetchPurchasesApi(),
        fetchProductsApi()
      ]);
      if (Array.isArray(freshPurchases)) setPurchases(freshPurchases);
      if (Array.isArray(freshProducts)) setProducts(freshProducts);
      showToast(`Purchase ${purchaseNumber} recorded and stock updated in database!`);
    } catch {
      setPurchases(getPurchasesList());
      setProducts(getProductsList());
      showToast(`Purchase ${purchaseNumber} recorded and stock updated!`);
    }
  };

  const handleDeletePurchase = async (id) => {
    if (confirm('Delete this purchase record?')) {
      deletePurchase(id);
      try {
        await deletePurchaseApi(id);
        const [freshPurchases, freshProducts] = await Promise.all([
          fetchPurchasesApi(),
          fetchProductsApi()
        ]);
        if (Array.isArray(freshPurchases)) setPurchases(freshPurchases);
        if (Array.isArray(freshProducts)) setProducts(freshProducts);
        showToast('Purchase record removed from database.');
      } catch {
        setPurchases(getPurchasesList());
        setProducts(getProductsList());
        showToast('Purchase record removed.');
      }
    }
  };

  // View invoice directly from Dashboard
  const handleViewInvoiceFromDashboard = (inv) => {
    setActiveInvoice(inv);
    setActiveTab('invoices');
  };

  // Backup & restore
  const handleExportData = () => {
    exportAllData();
    showToast('Backup downloaded!');
  };

  const handleImportData = (jsonStr) => {
    const result = importDataFromJson(jsonStr);
    if (result.success) {
      setInvoices(getSavedInvoices());
      setCompany(getCompanyProfile());
      setCustomers(getCustomersList());
      setProducts(getProductsList());
      setPurchases(getPurchasesList());
      showToast(result.message);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-18 md:bottom-6 right-4 md:right-6 z-50 bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xl border border-slate-700 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar with Hamburger Side Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        invoicesCount={invoices.length}
        lowStockCount={lowStockCount}
        isMongoConnected={isMongoConnected}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area (Fluid full-width layout: seamlessly fills screen when sidebar is closed or open, with zero awkward side gaps) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pl-64' : 'pl-0'}`}>
        <main className="flex-1 w-full px-3.5 sm:px-6 lg:px-8 pt-4 pb-24 md:py-6">
          {activeTab === 'dashboard' && (
            <DashboardPage
              invoices={invoices}
              purchases={purchases}
              products={products}
              customers={customers}
              company={company}
              onNavigate={setActiveTab}
              onStartNewInvoice={() => handleStartNewInvoice()}
              onViewInvoice={handleViewInvoiceFromDashboard}
              onRestockProduct={handleAdjustStock}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesPage
              invoices={invoices}
              company={company}
              customers={customers}
              products={products}
              activeInvoice={activeInvoice}
              setActiveInvoice={setActiveInvoice}
              onSaveInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onToggleStatus={handleTogglePaymentStatus}
              onAddCustomer={handleSaveCustomer}
              generateNextInvoiceNumber={generateNextInvoiceNumber}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesPage
              purchases={purchases}
              products={products}
              onSavePurchase={handleSavePurchase}
              onDeletePurchase={handleDeletePurchase}
            />
          )}

          {activeTab === 'products' && (
            <ProductsPage
              products={products}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              onSelectProductForNewInvoice={handleStartNewInvoiceWithProduct}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              invoices={invoices}
              purchases={purchases}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              customers={customers}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onSelectCustomerForNewInvoice={(cust) => {
                handleStartNewInvoice(cust);
                setActiveTab('invoices');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              company={company}
              onSaveCompany={handleSaveCompany}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
