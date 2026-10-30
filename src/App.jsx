import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InvoicesPage from './pages/InvoicesPage';
import CalculatorPage from './pages/CalculatorPage';
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
  generateNextInvoiceNumber,
  exportAllData,
  importDataFromJson
} from './utils/storage';
import { INITIAL_SAMPLE_INVOICE } from './constants/defaults';

export default function App() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [company, setCompany] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedInvoices = getSavedInvoices();
    const loadedCompany = getCompanyProfile();
    const loadedCustomers = getCustomersList();

    setInvoices(loadedInvoices);
    setCompany(loadedCompany);
    setCustomers(loadedCustomers);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Save invoice to storage
  const handleSaveInvoice = (invoiceToSave) => {
    const updated = saveInvoiceToStorage(invoiceToSave);
    setInvoices(updated);
    setActiveInvoice(invoiceToSave);
    showToast(`Invoice ${invoiceToSave.invoiceNumber} saved!`);
  };

  // Delete an invoice
  const handleDeleteInvoice = (id) => {
    if (confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
      const updated = deleteInvoiceFromStorage(id);
      setInvoices(updated);
      showToast('Invoice deleted.');
    }
  };

  // Toggle payment status
  const handleTogglePaymentStatus = (id) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    const nextStatus = inv.paymentStatus === 'pending' ? 'partial' : inv.paymentStatus === 'partial' ? 'paid' : 'pending';
    const updatedInv = { ...inv, paymentStatus: nextStatus };
    const updatedList = saveInvoiceToStorage(updatedInv);
    setInvoices(updatedList);
    showToast(`Status updated to ${nextStatus.toUpperCase()}`);
  };

  // Save company profile
  const handleSaveCompany = (profile) => {
    const saved = saveCompanyProfile(profile);
    setCompany(saved);
    showToast('Company profile saved!');
  };

  // Customer handlers
  const handleSaveCustomer = (cust) => {
    const updated = saveCustomer(cust);
    setCustomers(updated);
    showToast('Customer saved to directory!');
  };

  const handleDeleteCustomer = (id) => {
    if (confirm('Delete this customer from directory?')) {
      const updated = deleteCustomer(id);
      setCustomers(updated);
      showToast('Customer removed.');
    }
  };

  // Add item from calculator to current invoice
  const handleAddItemFromCalculator = (item) => {
    const current = activeInvoice || (invoices.length > 0 ? invoices[0] : null);
    if (current) {
      const updated = {
        ...current,
        items: [...(current.items || []), item]
      };
      setActiveInvoice(updated);
      saveInvoiceToStorage(updated);
      setInvoices(getSavedInvoices());
      showToast('Item added to active invoice!');
      setActiveTab('invoices');
    } else {
      const nextNum = generateNextInvoiceNumber(invoices);
      const newInv = {
        ...INITIAL_SAMPLE_INVOICE,
        id: `INV-${Date.now()}`,
        invoiceNumber: nextNum,
        date: new Date().toISOString().slice(0, 10),
        items: [item]
      };
      setActiveInvoice(newInv);
      saveInvoiceToStorage(newInv);
      setInvoices(getSavedInvoices());
      showToast('Created new bill with calculated item!');
      setActiveTab('invoices');
    }
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
      showToast(result.message);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xl border border-slate-700 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Shared Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        invoicesCount={invoices.length}
      />

      {/* Main Pages */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'invoices' && (
          <InvoicesPage
            invoices={invoices}
            company={company}
            customers={customers}
            activeInvoice={activeInvoice}
            setActiveInvoice={setActiveInvoice}
            onSaveInvoice={handleSaveInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onToggleStatus={handleTogglePaymentStatus}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onAddCustomer={handleSaveCustomer}
            generateNextInvoiceNumber={generateNextInvoiceNumber}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorPage
            onAddToInvoice={handleAddItemFromCalculator}
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
          />
        )}
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
