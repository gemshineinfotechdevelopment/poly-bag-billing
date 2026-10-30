import React, { useState } from 'react';
import { PlusCircle, Save, Eye, Printer, ArrowLeft, RotateCcw, Building2, UserPlus, FileText, ChevronDown } from 'lucide-react';
import PolyBagRow from './PolyBagRow';
import { COMMON_SIZES, DEFAULT_CUSTOMERS } from '../constants/defaults';
import { calculateInvoiceTotals, formatCurrency } from '../utils/formatters';

export default function InvoiceForm({
  initialInvoice,
  customers = [],
  company,
  onSave,
  onSaveAndPreview,
  onCancel,
  onAddCustomer
}) {
  const [formData, setFormData] = useState(initialInvoice);
  const [saveAsNewCustomer, setSaveAsNewCustomer] = useState(false);

  const totals = calculateInvoiceTotals(formData);

  // Field updates
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  // Select an existing customer
  const handleSelectCustomer = (customerId) => {
    if (!customerId) return;
    const found = customers.find(c => c.id === customerId);
    if (found) {
      // Determine supply type by matching state with company state
      const isInterstate = (company?.state || '').toLowerCase() !== (found.state || '').toLowerCase();
      setFormData(prev => ({
        ...prev,
        customer: {
          name: found.name,
          contactPerson: found.contactPerson || '',
          phone: found.phone || '',
          email: found.email || '',
          billingAddress: found.billingAddress || '',
          shippingAddress: found.shippingAddress || found.billingAddress || '',
          gstin: found.gstin || '',
          state: found.state || '',
          stateCode: found.stateCode || ''
        },
        supplyType: isInterstate ? 'interstate' : 'intrastate'
      }));
    }
  };

  // Items manipulation
  const handleItemChange = (index, updatedItem) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = updatedItem;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = (preset = null) => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: preset ? `LDPE Poly Bag ${preset.label}` : 'LDPE Clear Poly Bag',
      bagType: preset?.gusset > 0 ? 'side-gusset' : 'plain',
      material: 'LDPE',
      width: preset ? preset.width : 10,
      length: preset ? preset.length : 14,
      gusset: preset ? (preset.gusset || 0) : 0,
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
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const handleDuplicateItem = (index) => {
    const target = formData.items[index];
    const cloned = { ...target, id: `item-${Date.now()}` };
    const updated = [...formData.items];
    updated.splice(index + 1, 0, cloned);
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      alert('Invoice must have at least one poly bag item.');
      return;
    }
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleSubmit = (actionType = 'save') => {
    if (!formData.customer?.name?.trim()) {
      alert('Please enter or select a customer name.');
      return;
    }

    if (saveAsNewCustomer && onAddCustomer && formData.customer?.name) {
      onAddCustomer({
        id: `cust-${Date.now()}`,
        name: formData.customer.name,
        contactPerson: formData.customer.contactPerson || '',
        phone: formData.customer.phone || '',
        email: formData.customer.email || '',
        billingAddress: formData.customer.billingAddress || '',
        shippingAddress: formData.customer.shippingAddress || formData.customer.billingAddress || '',
        gstin: formData.customer.gstin || '',
        state: formData.customer.state || '',
        stateCode: formData.customer.stateCode || ''
      });
    }

    if (actionType === 'saveAndPreview') {
      onSaveAndPreview(formData);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Top action header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {formData.id ? `Edit Invoice (${formData.invoiceNumber})` : 'Create New Poly Bag Invoice'}
            </h2>
            <p className="text-xs text-slate-500">Add bag specifications, dimensions, weight, and tax rates</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('save')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('saveAndPreview')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" /> Save & Preview Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Main Details */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 1: Invoice Metadata */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Invoice & Dispatch Information</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                GST Compliant
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number *</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold text-indigo-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={formData.paymentTerms || '15 Days Credit'}
                  onChange={(e) => handleFieldChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Immediate / Cash">Immediate / Cash</option>
                  <option value="Against Delivery">Against Delivery (COD)</option>
                  <option value="7 Days Credit">7 Days Credit</option>
                  <option value="15 Days Credit">15 Days Credit</option>
                  <option value="30 Days Credit">30 Days Credit</option>
                  <option value="50% Advance Balance On Dispatch">50% Advance / Balance on Dispatch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">P.O. / Order Ref No.</label>
                <input
                  type="text"
                  value={formData.poNumber || ''}
                  onChange={(e) => handleFieldChange('poNumber', e.target.value)}
                  placeholder="e.g. PO-8891"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-Way Bill Number</label>
                <input
                  type="text"
                  value={formData.eWayBillNo || ''}
                  onChange={(e) => handleFieldChange('eWayBillNo', e.target.value)}
                  placeholder="12-digit E-Way Bill"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle / Transport Details</label>
                <input
                  type="text"
                  value={formData.transportMode || ''}
                  onChange={(e) => handleFieldChange('transportMode', e.target.value)}
                  placeholder="e.g. Road / Tempo MH-04-AB-1234 / Blue Dart"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supply Type (GST)</label>
                <select
                  value={formData.supplyType || 'interstate'}
                  onChange={(e) => handleFieldChange('supplyType', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-semibold text-indigo-700"
                >
                  <option value="intrastate">Intra-State (CGST + SGST)</option>
                  <option value="interstate">Inter-State (IGST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Customer / Buyer Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Customer / Buyer Details
              </h3>

              {/* Quick autofill from saved customers */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Autofill:</span>
                <select
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  defaultValue=""
                  className="text-xs px-2.5 py-1.5 border border-indigo-200 bg-indigo-50/50 rounded-lg font-medium text-indigo-800"
                >
                  <option value="" disabled>Select from Saved Customers...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer / Company Name *</label>
                <input
                  type="text"
                  value={formData.customer?.name || ''}
                  onChange={(e) => handleCustomerChange('name', e.target.value)}
                  placeholder="e.g. Metro Garments & Apparel Ltd."
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.customer?.contactPerson || ''}
                  onChange={(e) => handleCustomerChange('contactPerson', e.target.value)}
                  placeholder="Mr. Rajesh Verma"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.customer?.phone || ''}
                  onChange={(e) => handleCustomerChange('phone', e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.customer?.gstin || ''}
                  onChange={(e) => handleCustomerChange('gstin', e.target.value.toUpperCase())}
                  placeholder="e.g. 24AABCM8921K1ZZ"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State & Code</label>
                <input
                  type="text"
                  value={formData.customer?.state || ''}
                  onChange={(e) => handleCustomerChange('state', e.target.value)}
                  placeholder="e.g. Gujarat (24)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
                <textarea
                  rows={2}
                  value={formData.customer?.billingAddress || ''}
                  onChange={(e) => handleCustomerChange('billingAddress', e.target.value)}
                  placeholder="Billing street address, city, pincode"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping / Delivery Address</label>
                <textarea
                  rows={2}
                  value={formData.customer?.shippingAddress || ''}
                  onChange={(e) => handleCustomerChange('shippingAddress', e.target.value)}
                  placeholder="Consignee warehouse / site address (Leave blank if same as billing)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveNewCust"
                checked={saveAsNewCustomer}
                onChange={(e) => setSaveAsNewCustomer(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="saveNewCust" className="text-xs font-medium text-slate-600 cursor-pointer">
                Save / update this customer in Customer Directory
              </label>
            </div>
          </div>

          {/* Section 3: Poly Bag Line Items */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-800">Poly Bag Line Items ({formData.items?.length || 0})</h3>
                <p className="text-xs text-slate-500">Configure bag material, dimensions, micron gauge, and unit rate</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Preset sizes dropdown */}
                <div className="relative group">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                  >
                    Quick Add Size <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block z-30">
                    <span className="block px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Popular Bag Sizes:
                    </span>
                    {COMMON_SIZES.map((sz, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddItem(sz)}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors flex justify-between"
                      >
                        <span className="font-semibold">{sz.label}</span>
                        <span className="text-[10px] text-slate-400">{sz.desc.slice(0, 15)}...</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>

            {/* List of item cards */}
            {(formData.items || []).map((item, index) => (
              <PolyBagRow
                key={item.id || index}
                item={item}
                index={index}
                onChange={(updated) => handleItemChange(index, updated)}
                onRemove={() => handleRemoveItem(index)}
                onDuplicate={() => handleDuplicateItem(index)}
              />
            ))}
          </div>

          {/* Section 4: Additional Charges & Adjustments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Additional Charges & Discounts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cylinder / Stereo Charge (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={formData.cylinderCharge ?? 0}
                  onChange={(e) => handleFieldChange('cylinderCharge', e.target.value)}
                  placeholder="3500"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  title="One-time printing plate / rotogravure cylinder making charge"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Printing plate / block</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Freight / Delivery (₹)
                </label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={formData.freightCharge ?? 0}
                  onChange={(e) => handleFieldChange('freightCharge', e.target.value)}
                  placeholder="1200"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Transport & tempo</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging / Box (₹)
                </label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={formData.packagingCharge ?? 0}
                  onChange={(e) => handleFieldChange('packagingCharge', e.target.value)}
                  placeholder="400"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Corrugated carton box</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={formData.discountAmount ?? 0}
                  onChange={(e) => handleFieldChange('discountAmount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Lump sum discount</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Notes / Dispatch Remarks</label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Special delivery instructions, packaging mark, etc."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar: Summary & Payment Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Billing Calculation
            </h3>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 bg-indigo-50/70 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Total Weight</span>
                <span className="text-lg font-black text-indigo-950">{totals.totalWeightKg} Kg</span>
              </div>
              <div className="p-3 bg-purple-50/70 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Total Bags</span>
                <span className="text-lg font-black text-purple-950">{totals.totalBagsCount.toLocaleString()} Pcs</span>
              </div>
            </div>

            {/* Price Line Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pb-4 border-b border-slate-200">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totals.itemsBaseTotal)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- {formatCurrency(totals.discountAmount)}</span>
                </div>
              )}

              {totals.additionalCharges > 0 && (
                <div className="flex justify-between">
                  <span>Extra Charges:</span>
                  <span>+ {formatCurrency(totals.additionalCharges)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                <span>Taxable Value:</span>
                <span>{formatCurrency(totals.taxableAmount)}</span>
              </div>

              {formData.supplyType === 'interstate' ? (
                <div className="flex justify-between text-slate-700">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-semibold">{formatCurrency(totals.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-700">
                    <span>Central GST (CGST):</span>
                    <span className="font-semibold">{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>State GST (SGST):</span>
                    <span className="font-semibold">{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              )}

              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Round Off:</span>
                  <span>{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="py-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700 uppercase">Grand Total:</span>
                <span className="text-2xl font-black text-indigo-700">{formatCurrency(totals.grandTotal)}</span>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1 leading-tight">{totals.amountInWords}</p>
            </div>

            {/* Payment Status Block */}
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Payment Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['pending', 'partial', 'paid'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      handleFieldChange('paymentStatus', status);
                      if (status === 'paid') {
                        handleFieldChange('paidAmount', totals.grandTotal);
                      } else if (status === 'pending') {
                        handleFieldChange('paidAmount', 0);
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg capitalize transition-colors ${
                      formData.paymentStatus === status
                        ? status === 'paid'
                          ? 'bg-emerald-600 text-white'
                          : status === 'partial'
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {formData.paymentStatus === 'partial' && (
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Amount Received / Paid (₹)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    max={totals.grandTotal}
                    value={formData.paidAmount || ''}
                    onChange={(e) => handleFieldChange('paidAmount', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter partial amount"
                  />
                  <div className="flex justify-between text-xs text-amber-700 font-bold mt-1">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(totals.balanceDue)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Save Buttons in Sidebar */}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit('saveAndPreview')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" /> Save & Preview Invoice
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('save')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Save className="w-4 h-4" /> Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

