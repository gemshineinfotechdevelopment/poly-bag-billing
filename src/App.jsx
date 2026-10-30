import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import PolyBagCalculator from './components/PolyBagCalculator';
import CustomerManager from './components/CustomerManager';
import CompanySettings from './components/CompanySettings';
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

    const isInterstate = prefilledCustomer
      ? (company?.state || '').toLowerCase() !== (prefilledCustomer.state || '').toLowerCase()
      : false;

    const newInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: nextInvoiceNumber,
      date: today,
      dueDate: due,
      poNumber: '',
      poDate: '',
      transportMode: '',
      eWayBillNo: '',
      supplyType: isInterstate ? 'interstate' : 'intrastate',
      paymentTerms: '15 Days Credit',
      paymentStatus: 'pending',
      paidAmount: 0,
      customer: prefilledCustomer ? {
        name: prefilledCustomer.name,
        contactPerson: prefilledCustomer.contactPerson || '',
        phone: prefilledCustomer.phone || '',
        email: prefilledCustomer.email || '',
        billingAddress: prefilledCustomer.billingAddress || '',
        shippingAddress: prefilledCustomer.shippingAddress || prefilledCustomer.billingAddress || '',
        gstin: prefilledCustomer.gstin || '',
        state: prefilledCustomer.state || '',
        stateCode: prefilledCustomer.stateCode || ''
      } : {
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        billingAddress: '',
        shippingAddress: '',
        gstin: '',
        state: company?.state || '',
        stateCode: ''
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: 'LDPE Clear Poly Bag (Standard 50µ)',
          bagType: 'plain',
          material: 'LDPE',
          width: 10,
          length: 14,
          gusset: 0,
          flap: 0,
          micron: 50,
          gauge: 200,
          color: 'Clear Natural',
          printing: 'Plain Unprinted',
          hsnCode: '39232100',
          billingMode: 'kg',
          quantity: 100,
          calculatedPcs: 12400,
          rate: 185,
          gstRate: 18,
          notes: ''
        }
      ],
      cylinderCharge: 0,
      freightCharge: 0,
      packagingCharge: 0,
      discountPercent: 0,
      discountAmount: 0,
      notes: 'Thank you for your business. Tolerance of ±5% on weight and quantity is applicable.'
    };

    setActiveInvoice(newInvoice);
    setActiveTab('create');
  };

  // Edit existing invoice
  const handleEditInvoice = (inv) => {
    setActiveInvoice(inv);
    setActiveTab('create');
  };

  // View & print invoice
  const handleViewInvoice = (inv) => {
    setActiveInvoice(inv);
    setActiveTab('preview');
  };

  // Save invoice to storage
  const handleSaveInvoice = (invoiceToSave) => {
    const updated = saveInvoiceToStorage(invoiceToSave);
    setInvoices(updated);
    setActiveInvoice(invoiceToSave);
    setActiveTab('invoices');
    showToast(`Invoice ${invoiceToSave.invoiceNumber} saved successfully!`);
  };

  // Save & immediately preview/print
  const handleSaveAndPreview = (invoiceToSave) => {
    const updated = saveInvoiceToStorage(invoiceToSave);
    setInvoices(updated);
    setActiveInvoice(invoiceToSave);
    setActiveTab('preview');
    showToast(`Invoice saved! Ready to print.`);
  };

  // Duplicate an invoice
  const handleDuplicateInvoice = (invoiceToDup) => {
    const nextNumber = generateNextInvoiceNumber(invoices);
    const duplicated = {
      ...invoiceToDup,
      id: `INV-${Date.now()}`,
      invoiceNumber: nextNumber,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      paymentStatus: 'pending',
      paidAmount: 0
    };
    setActiveInvoice(duplicated);
    setActiveTab('create');
    showToast(`Invoice duplicated as ${nextNumber}`);
  };

  // Delete an invoice
  const handleDeleteInvoice = (id) => {
    if (confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
      const updated = deleteInvoiceFromStorage(id);
      setInvoices(updated);
      showToast('Invoice deleted.');
    }
  };

  // Quick toggle payment status
  const handleTogglePaymentStatus = (id) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    const nextStatus = inv.paymentStatus === 'pending' ? 'partial' : inv.paymentStatus === 'partial' ? 'paid' : 'pending';
    const updatedInv = { ...inv, paymentStatus: nextStatus };
    const updatedList = saveInvoiceToStorage(updatedInv);
    setInvoices(updatedList);
    showToast(`Payment marked as ${nextStatus.toUpperCase()}`);
  };

  // Save company profile
  const handleSaveCompany = (profile) => {
    const saved = saveCompanyProfile(profile);
    setCompany(saved);
    showToast('Company profile updated!');
  };

  // Customer Management handlers
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

  // Add item from calculator to current active invoice
  const handleAddItemFromCalculator = (item) => {
    if (activeInvoice) {
      const updated = {
        ...activeInvoice,
        items: [...(activeInvoice.items || []), item]
      };
      setActiveInvoice(updated);
      saveInvoiceToStorage(updated);
      setInvoices(getSavedInvoices());
      showToast('Item added to active invoice!');
    } else {
      // Create new draft with this item
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
      showToast('Created new invoice draft with calculated item!');
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-2xl border border-slate-700 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewInvoice={() => handleStartNewInvoice()}
        invoicesCount={invoices.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            onCreateNew={() => handleStartNewInvoice()}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onToggleStatus={handleTogglePaymentStatus}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        )}

        {activeTab === 'create' && activeInvoice && (
          <InvoiceForm
            initialInvoice={activeInvoice}
            customers={customers}
            company={company}
            onSave={handleSaveInvoice}
            onSaveAndPreview={handleSaveAndPreview}
            onCancel={() => setActiveTab('invoices')}
            onAddCustomer={handleSaveCustomer}
          />
        )}

        {activeTab === 'preview' && activeInvoice && (
          <InvoicePreview
            invoice={activeInvoice}
            company={company}
            onBack={() => setActiveTab('invoices')}
            onEdit={handleEditInvoice}
            onDuplicate={handleDuplicateInvoice}
          />
        )}

        {activeTab === 'calculator' && (
          <PolyBagCalculator
            onAddToInvoice={handleAddItemFromCalculator}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            customers={customers}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onSelectCustomerForNewInvoice={(cust) => handleStartNewInvoice(cust)}
          />
        )}

        {activeTab === 'settings' && (
          <CompanySettings
            company={company}
            onSaveCompany={handleSaveCompany}
          />
        )}
      </main>
    </div>
  );
}
