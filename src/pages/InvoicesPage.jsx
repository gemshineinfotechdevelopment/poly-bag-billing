import React, { useState } from 'react';
import {
  PlusCircle, Search, Eye, Edit3, Copy, Trash2, Printer, ArrowLeft,
  CheckCircle, Clock, AlertCircle, Download, Upload, Package, Sliders,
  ChevronDown, ChevronUp, Scale, Save, IndianRupee, Weight
} from 'lucide-react';
import {
  formatCurrency, formatNumber, formatDate, calculateInvoiceTotals, calculateItemRow
} from '../utils/formatters';
import { BAG_TYPES, MATERIALS, UNITS, COMMON_SIZES } from '../constants/defaults';
import { calculateBagWeightGrams, micronToGauge, gaugeToMicron } from '../utils/polyBagCalc';

// ==========================================
// SUB-COMPONENT: Single Poly Bag Row
// ==========================================
function PolyBagRow({ item, index, onChange, onRemove, onDuplicate }) {
  const [showSpecs, setShowSpecs] = useState(Boolean(item.hasAdvancedSpecs || (item.width && item.length)));

  const bagWeightGrams = calculateBagWeightGrams({
    width: item.width || 0,
    length: item.length || 0,
    gusset: item.gusset || 0,
    flap: item.flap || 0,
    micron: item.micron || 50,
    material: item.material || 'LDPE'
  });

  const handleChange = (field, val) => {
    const updated = { ...item, [field]: val };

    if (field === 'micron') {
      updated.gauge = micronToGauge(val);
    } else if (field === 'gauge') {
      updated.micron = gaugeToMicron(val);
    }

    if (bagWeightGrams > 0) {
      const currentUnit = updated.unit || updated.billingMode || 'pcs';
      if (currentUnit === 'kg') {
        const kg = parseFloat(updated.quantity) || 0;
        updated.calculatedPcs = Math.round((kg * 1000) / bagWeightGrams);
      } else {
        const pcs = parseFloat(updated.quantity) || 0;
        updated.calculatedWeightKg = Math.round(((pcs * bagWeightGrams) / 1000) * 10) / 10;
      }
    }

    onChange(updated);
  };

  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  const unit = item.unit || item.billingMode || 'pcs';
  const baseAmount = unit === '1000pcs' ? (qty / 1000) * rate : qty * rate;
  const gstRate = parseFloat(item.gstRate) || 0;
  const lineTotal = baseAmount + (baseAmount * gstRate) / 100;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-all mb-3">
      <div className="grid grid-cols-12 gap-2.5 items-center">
        {/* Index & Description */}
        <div className="col-span-12 sm:col-span-5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="flex-1">
            <input
              type="text"
              value={item.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Product Name (e.g. Poly Bags, Plastic Covers)"
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-4 sm:col-span-2">
          <input
            type="number"
            step="any"
            min="0"
            value={item.quantity ?? ''}
            onChange={(e) => handleChange('quantity', e.target.value)}
            placeholder="Qty"
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-right font-medium"
          />
        </div>

        {/* Unit Selector */}
        <div className="col-span-4 sm:col-span-2">
          <select
            value={unit}
            onChange={(e) => {
              handleChange('unit', e.target.value);
              handleChange('billingMode', e.target.value);
            }}
            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            {UNITS.map(u => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>

        {/* Rate (₹) */}
        <div className="col-span-4 sm:col-span-2">
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-[11px] text-slate-400">₹</span>
            <input
              type="number"
              step="any"
              min="0"
              value={item.rate ?? ''}
              onChange={(e) => handleChange('rate', e.target.value)}
              placeholder="Rate"
              className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-right font-medium"
            />
          </div>
        </div>

        {/* Line Total & Row Actions */}
        <div className="col-span-12 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
          <span className="sm:hidden text-xs text-slate-500 font-semibold">Total:</span>
          <div className="text-xs font-bold text-slate-900 whitespace-nowrap">
            {formatCurrency(lineTotal)}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onDuplicate}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              title="Duplicate row"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
              title="Delete row"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Bag Specs Toggle */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => {
            const next = !showSpecs;
            setShowSpecs(next);
            handleChange('hasAdvancedSpecs', next);
          }}
          className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800"
        >
          <Sliders className="w-3 h-3" />
          {showSpecs ? 'Hide Bag Dimensions & Micron' : '+ Add Dimensions, Micron & Material (Optional)'}
          {showSpecs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <div className="flex items-center gap-1.5 text-slate-600">
          <span>GST:</span>
          <select
            value={item.gstRate ?? 0}
            onChange={(e) => handleChange('gstRate', parseFloat(e.target.value) || 0)}
            className="px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white text-slate-700"
          >
            <option value="0">0% (Nil)</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>
      </div>

      {showSpecs && (
        <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Width (in)</label>
              <input
                type="number"
                step="0.25"
                value={item.width ?? ''}
                onChange={(e) => handleChange('width', e.target.value)}
                placeholder="10"
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Length (in)</label>
              <input
                type="number"
                step="0.25"
                value={item.length ?? ''}
                onChange={(e) => handleChange('length', e.target.value)}
                placeholder="14"
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Gusset (in)</label>
              <input
                type="number"
                step="0.25"
                value={item.gusset ?? ''}
                onChange={(e) => handleChange('gusset', e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Micron (µm)</label>
              <input
                type="number"
                step="1"
                value={item.micron ?? ''}
                onChange={(e) => handleChange('micron', e.target.value)}
                placeholder="50"
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-center font-bold text-indigo-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Material</label>
              <select
                value={item.material || 'LDPE'}
                onChange={(e) => handleChange('material', e.target.value)}
                className="w-full px-1.5 py-1 text-xs bg-white border border-slate-300 rounded font-medium"
              >
                {MATERIALS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bag Type</label>
              <select
                value={item.bagType || 'plain'}
                onChange={(e) => handleChange('bagType', e.target.value)}
                className="w-full px-1.5 py-1 text-xs bg-white border border-slate-300 rounded"
              >
                {BAG_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {bagWeightGrams > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-indigo-800 bg-indigo-50/70 px-2 py-1 rounded">
              <Scale className="w-3 h-3 text-indigo-600" />
              <span>Calculated Weight: <strong>{bagWeightGrams}g</strong>/bag ({bagWeightGrams} kg per 1,000 bags)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: Invoice Form Editor View
// ==========================================
function InvoiceFormView({ invoice, customers, onSave, onSaveAndPreview, onCancel, onAddCustomer }) {
  const [formData, setFormData] = useState(invoice);
  const [showMoreOptions, setShowMoreOptions] = useState(
    Boolean(formData.poNumber || formData.transportMode || formData.freightCharge || formData.cylinderCharge)
  );
  const [saveAsNewCustomer, setSaveAsNewCustomer] = useState(false);

  const totals = calculateInvoiceTotals(formData);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, [field]: value }
    }));
  };

  const handleSelectCustomer = (customerId) => {
    if (!customerId) return;
    const found = customers.find(c => c.id === customerId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        customer: {
          name: found.name,
          contactPerson: found.contactPerson || '',
          phone: found.phone || '',
          billingAddress: found.billingAddress || '',
          gstin: found.gstin || ''
        }
      }));
    }
  };

  const handleItemChange = (index, updatedItem) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = updatedItem;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = (preset = null) => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: preset ? `Poly Bag ${preset.label}` : 'Poly Bags',
      unit: 'kg',
      quantity: 10,
      rate: 150,
      gstRate: 0,
      width: preset ? preset.width : '',
      length: preset ? preset.length : '',
      gusset: preset ? (preset.gusset || 0) : '',
      micron: 50,
      material: 'LDPE',
      hasAdvancedSpecs: Boolean(preset)
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
      alert('Invoice must have at least one item.');
      return;
    }
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleSubmit = (actionType = 'save') => {
    if (!formData.customer?.name?.trim()) {
      alert('Please enter a customer name.');
      return;
    }

    if (saveAsNewCustomer && onAddCustomer && formData.customer?.name) {
      onAddCustomer({
        id: `cust-${Date.now()}`,
        name: formData.customer.name,
        contactPerson: formData.customer.contactPerson || '',
        phone: formData.customer.phone || '',
        billingAddress: formData.customer.billingAddress || '',
        gstin: formData.customer.gstin || ''
      });
    }

    if (actionType === 'saveAndPreview') {
      onSaveAndPreview(formData);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs mb-5 flex flex-wrap items-center justify-between gap-3 sticky top-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {formData.id ? `Edit Invoice (${formData.invoiceNumber})` : 'New Invoice'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('save')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('saveAndPreview')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View & Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Details (Left) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold text-indigo-950 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Customer Details */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Customer Details</label>
                {customers.length > 0 && (
                  <select
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    defaultValue=""
                    className="text-[11px] px-2 py-0.5 border border-indigo-200 bg-indigo-50/50 rounded font-medium text-indigo-800"
                  >
                    <option value="" disabled>Autofill Saved Customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <input
                    type="text"
                    required
                    value={formData.customer?.name || ''}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    placeholder="Customer / Shop Name *"
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.customer?.phone || ''}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    placeholder="Phone Number (Optional)"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.customer?.billingAddress || ''}
                    onChange={(e) => handleCustomerChange('billingAddress', e.target.value)}
                    placeholder="Customer Address / City (Optional)"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveCust"
                  checked={saveAsNewCustomer}
                  onChange={(e) => setSaveAsNewCustomer(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded"
                />
                <label htmlFor="saveCust" className="text-[11px] text-slate-500 cursor-pointer">
                  Save customer to directory for future bills
                </label>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Items ({formData.items?.length || 0})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>
            </div>

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

          {/* Additional Options (Optional) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-indigo-600"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Additional Options (Discount, Delivery, Customer GST, Note)
              </span>
              {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMoreOptions && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Customer GSTIN</label>
                    <input
                      type="text"
                      value={formData.customer?.gstin || ''}
                      onChange={(e) => handleCustomerChange('gstin', e.target.value.toUpperCase())}
                      placeholder="e.g. 27AABCU9603R1ZM"
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.discountAmount ?? 0}
                      onChange={(e) => handleFieldChange('discountAmount', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Delivery / Freight (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.freightCharge ?? 0}
                      onChange={(e) => handleFieldChange('freightCharge', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Invoice Remarks / Note</label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder="e.g. Thank you for your business!"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary (Right) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs sticky top-20">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
              Bill Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600 pb-3 border-b border-slate-100">
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

              {totals.totalTax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>+ {formatCurrency(totals.totalTax)}</span>
                </div>
              )}
            </div>

            <div className="py-3 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase">Grand Total:</span>
                <span className="text-xl font-black text-indigo-700">{formatCurrency(totals.grandTotal)}</span>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-0.5">{totals.amountInWords}</p>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Status</label>
              <div className="grid grid-cols-3 gap-1">
                {['pending', 'partial', 'paid'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      handleFieldChange('paymentStatus', status);
                      if (status === 'paid') handleFieldChange('paidAmount', totals.grandTotal);
                      else if (status === 'pending') handleFieldChange('paidAmount', 0);
                    }}
                    className={`py-1.5 text-[11px] font-bold rounded capitalize transition-colors ${
                      formData.paymentStatus === status
                        ? status === 'paid'
                          ? 'bg-emerald-600 text-white'
                          : status === 'partial'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit('saveAndPreview')}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <Eye className="w-4 h-4" /> Save & Print Invoice
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('save')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: Printable Invoice View (A4)
// ==========================================
function InvoicePrintView({ invoice, company, onBack, onEdit, onDuplicate }) {
  const totals = calculateInvoiceTotals(invoice);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(invoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Bill
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(invoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Clean, Compact Printable Invoice Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 print-shadow-none print:p-2 print:border-none print:rounded-none text-slate-800 text-xs">
        
        {/* Header: Company & Invoice Info */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {company?.name || 'POLY PACK ENTERPRISES'}
            </h1>
            {company?.tagline && (
              <p className="text-slate-500 text-[11px] font-medium">{company.tagline}</p>
            )}
            <div className="mt-1.5 text-slate-600 space-y-0.5 text-[11px]">
              {company?.address && <p>{company.address}, {company?.city} {company?.pincode}</p>}
              <div className="flex flex-wrap gap-x-3">
                {company?.phone && <span><strong>Phone:</strong> {company.phone}</span>}
                {company?.email && <span><strong>Email:</strong> {company.email}</span>}
              </div>
              {company?.gstin && (
                <p className="font-mono text-slate-700 font-medium">GSTIN: {company.gstin}</p>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-sm rounded tracking-wide uppercase">
              INVOICE
            </span>
            <div className="mt-2 text-slate-600 space-y-0.5 text-[11px]">
              <p><strong className="text-slate-800">Invoice No:</strong> <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span></p>
              <p><strong className="text-slate-800">Date:</strong> {formatDate(invoice.date)}</p>
              {invoice.dueDate && (
                <p><strong className="text-slate-800">Due Date:</strong> {formatDate(invoice.dueDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer (Bill To) Info */}
        <div className="py-3 border-b border-slate-100 flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Billed To:
            </span>
            <p className="font-bold text-slate-900 text-sm">{invoice.customer?.name || 'Walk-in Customer'}</p>
            {invoice.customer?.contactPerson && (
              <p className="text-slate-600 text-[11px]">Attn: {invoice.customer.contactPerson}</p>
            )}
            {invoice.customer?.billingAddress && (
              <p className="text-slate-600 text-[11px] whitespace-pre-line mt-0.5">{invoice.customer.billingAddress}</p>
            )}
            <div className="flex flex-wrap gap-x-3 mt-1 text-[11px] text-slate-600">
              {invoice.customer?.phone && <span><strong>Ph:</strong> {invoice.customer.phone}</span>}
              {invoice.customer?.gstin && <span><strong className="font-mono">GSTIN:</strong> {invoice.customer.gstin}</span>}
            </div>
          </div>

          {(invoice.poNumber || invoice.transportMode || invoice.paymentTerms) && (
            <div className="text-right text-[11px] text-slate-600 space-y-0.5">
              {invoice.paymentTerms && <p><strong>Terms:</strong> {invoice.paymentTerms}</p>}
              {invoice.poNumber && <p><strong>P.O. Ref:</strong> {invoice.poNumber}</p>}
              {invoice.transportMode && <p><strong>Transport:</strong> {invoice.transportMode}</p>}
            </div>
          )}
        </div>

        {/* Clean Items Table */}
        <div className="mt-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2 px-1 w-8 text-center">#</th>
                <th className="py-2 px-2">Item Description</th>
                <th className="py-2 px-2 text-right w-16">Qty</th>
                <th className="py-2 px-2 text-center w-16">Unit</th>
                <th className="py-2 px-2 text-right w-20">Rate (₹)</th>
                <th className="py-2 px-2 text-right w-24">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoice.items || []).map((item, idx) => {
                const qty = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rate) || 0;
                const unit = item.unit || item.billingMode || 'pcs';
                const base = unit === '1000pcs' ? (qty / 1000) * rate : qty * rate;

                const hasDims = item.width && item.length;
                const dimStr = hasDims
                  ? `${item.width}" × ${item.length}"${item.gusset ? ` + ${item.gusset}" G` : ''}${item.flap ? ` + ${item.flap}" Flap` : ''} | ${item.micron || 50}µ`
                  : null;

                return (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-1 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-2">
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      {dimStr && (
                        <div className="text-[10px] text-slate-500 font-medium">{dimStr}</div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-slate-400 italic">{item.notes}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-900">
                      {formatNumber(qty, unit === 'kg' ? 1 : 0)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600 uppercase text-[10px] font-medium">
                      {unit}
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800">
                      {formatNumber(rate, 2)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                      {formatNumber(base, 2)}
                    </td>
                  </tr>
                );
              })}

              {parseFloat(invoice.freightCharge) > 0 && (
                <tr className="text-slate-700">
                  <td className="py-2 px-1 text-center text-slate-400">•</td>
                  <td className="py-2 px-2 font-medium">Delivery / Transport Charge</td>
                  <td className="py-2 px-2 text-right">1</td>
                  <td className="py-2 px-2 text-center text-[10px]">trip</td>
                  <td className="py-2 px-2 text-right">{formatNumber(invoice.freightCharge, 2)}</td>
                  <td className="py-2 px-2 text-right font-bold">{formatNumber(invoice.freightCharge, 2)}</td>
                </tr>
              )}

              {parseFloat(invoice.cylinderCharge) > 0 && (
                <tr className="text-slate-700">
                  <td className="py-2 px-1 text-center text-slate-400">•</td>
                  <td className="py-2 px-2 font-medium">Printing Cylinder / Block Charge</td>
                  <td className="py-2 px-2 text-right">1</td>
                  <td className="py-2 px-2 text-center text-[10px]">job</td>
                  <td className="py-2 px-2 text-right">{formatNumber(invoice.cylinderCharge, 2)}</td>
                  <td className="py-2 px-2 text-right font-bold">{formatNumber(invoice.cylinderCharge, 2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Summary Block */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-start gap-6">
          <div className="flex-1 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Amount in Words:
              </span>
              <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                {totals.amountInWords}
              </p>
            </div>

            {invoice.notes && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Remarks / Terms:
                </span>
                <p className="text-[10px] text-slate-500 whitespace-pre-line mt-0.5">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          <div className="w-56 space-y-1.5 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totals.itemsBaseTotal)}</span>
            </div>

            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>- {formatCurrency(totals.discountAmount)}</span>
              </div>
            )}

            {totals.totalTax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST / Tax:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(totals.totalTax)}</span>
              </div>
            )}

            {totals.roundOff !== 0 && (
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Round off:</span>
                <span>{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>Total:</span>
              <span className="text-base text-indigo-700">{formatCurrency(totals.grandTotal)}</span>
            </div>

            {invoice.paymentStatus && (
              <div className="text-[10px] pt-1">
                <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  invoice.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-700'
                    : invoice.paymentStatus === 'partial'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {invoice.paymentStatus === 'paid' ? 'Paid' : invoice.paymentStatus === 'partial' ? `Partial (Bal: ${formatCurrency(totals.balanceDue)})` : 'Payment Due'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Signature Line */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <div className="text-right">
            <div className="h-8"></div>
            <p className="text-[11px] font-bold text-slate-700 border-t border-slate-300 pt-1 px-4 inline-block">
              {company?.authorizedSignatory || 'Authorized Signatory'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE COMPONENT: InvoicesPage
// ==========================================
export default function InvoicesPage({
  invoices = [],
  company,
  customers = [],
  activeInvoice,
  setActiveInvoice,
  onSaveInvoice,
  onDeleteInvoice,
  onToggleStatus,
  onExportData,
  onImportData,
  onAddCustomer,
  generateNextInvoiceNumber
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form' | 'preview'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Quick stats calculation
  let totalRevenue = 0;
  let totalPending = 0;
  let totalWeightKg = 0;
  let paidCount = 0;
  let pendingCount = 0;

  invoices.forEach(inv => {
    let itemsTotal = 0;
    (inv.items || []).forEach(item => {
      const q = parseFloat(item.quantity) || 0;
      const r = parseFloat(item.rate) || 0;
      const u = item.unit || item.billingMode || 'pcs';
      const base = u === '1000pcs' ? (q / 1000) * r : q * r;
      itemsTotal += base + (base * (parseFloat(item.gstRate) || 0)) / 100;
      if (u === 'kg') totalWeightKg += q;
    });
    const grand = Math.round(itemsTotal + (parseFloat(inv.freightCharge) || 0) + (parseFloat(inv.cylinderCharge) || 0) - (parseFloat(inv.discountAmount) || 0));
    totalRevenue += grand;
    const paid = parseFloat(inv.paidAmount) || (inv.paymentStatus === 'paid' ? grand : 0);
    totalPending += Math.max(0, grand - paid);

    if (inv.paymentStatus === 'paid' || grand <= paid) paidCount++;
    else pendingCount++;
  });

  // Filtered invoices
  const filtered = invoices.filter(inv => {
    const q = searchTerm.toLowerCase();
    const match = (
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.customer?.name || '').toLowerCase().includes(q) ||
      (inv.items || []).some(item => (item.description || '').toLowerCase().includes(q))
    );
    if (!match) return false;
    if (statusFilter === 'all') return true;
    return inv.paymentStatus === statusFilter;
  });

  const handleStartNew = () => {
    const nextInvoiceNumber = generateNextInvoiceNumber ? generateNextInvoiceNumber(invoices) : `INV-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

    const newInv = {
      id: `INV-${Date.now()}`,
      invoiceNumber: nextInvoiceNumber,
      date: today,
      dueDate: due,
      poNumber: '',
      transportMode: '',
      paymentTerms: 'Immediate',
      paymentStatus: 'pending',
      paidAmount: 0,
      customer: { name: '', phone: '', billingAddress: '', gstin: '' },
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

    setActiveInvoice(newInv);
    setViewMode('form');
  };

  const handleEdit = (inv) => {
    setActiveInvoice(inv);
    setViewMode('form');
  };

  const handleView = (inv) => {
    setActiveInvoice(inv);
    setViewMode('preview');
  };

  const handleDuplicate = (inv) => {
    const nextNum = generateNextInvoiceNumber ? generateNextInvoiceNumber(invoices) : `INV-${Date.now()}`;
    const duplicated = {
      ...inv,
      id: `INV-${Date.now()}`,
      invoiceNumber: nextNum,
      date: new Date().toISOString().slice(0, 10),
      paymentStatus: 'pending',
      paidAmount: 0
    };
    setActiveInvoice(duplicated);
    setViewMode('form');
  };

  const handleSaveAndShowPreview = (invToSave) => {
    onSaveInvoice(invToSave);
    setActiveInvoice(invToSave);
    setViewMode('preview');
  };

  const handleSaveAndShowList = (invToSave) => {
    onSaveInvoice(invToSave);
    setViewMode('list');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => onImportData(event.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  // 1. RENDER EDIT FORM
  if (viewMode === 'form' && activeInvoice) {
    return (
      <InvoiceFormView
        invoice={activeInvoice}
        customers={customers}
        onSave={handleSaveAndShowList}
        onSaveAndPreview={handleSaveAndShowPreview}
        onCancel={() => setViewMode('list')}
        onAddCustomer={onAddCustomer}
      />
    );
  }

  // 2. RENDER PREVIEW / PRINT
  if (viewMode === 'preview' && activeInvoice) {
    return (
      <InvoicePrintView
        invoice={activeInvoice}
        company={company}
        onBack={() => setViewMode('list')}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
      />
    );
  }

  // 3. RENDER INVOICES LIST & DASHBOARD
  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Billed</p>
            <h3 className="text-lg font-bold text-slate-800 mt-0.5">{formatCurrency(totalRevenue)}</h3>
            <p className="text-[10px] text-slate-400">{invoices.length} total bills</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Payment Pending</p>
            <h3 className="text-lg font-bold text-amber-700 mt-0.5">{formatCurrency(totalPending)}</h3>
            <p className="text-[10px] text-slate-400">{pendingCount} unpaid / partial</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Material Sold</p>
            <h3 className="text-lg font-bold text-emerald-700 mt-0.5">{formatNumber(totalWeightKg, 1)} Kg</h3>
            <p className="text-[10px] text-slate-400">{paidCount} paid invoices</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Weight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Invoices & Bills</h2>
            <p className="text-[11px] text-slate-500">Create, edit, view, and print your customer bills</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportData}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg"
              title="Download backup"
            >
              <Download className="w-3.5 h-3.5" /> Backup
            </button>

            <label className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Restore
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" /> New Bill
            </button>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice # or customer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg text-xs">
            {['all', 'pending', 'partial', 'paid'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded capitalize font-semibold transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No bills found</h3>
            <p className="text-xs text-slate-500 mt-0.5">Start by clicking "New Bill" to generate your first invoice.</p>
            <button
              onClick={handleStartNew}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" /> New Bill
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inv => {
                  let grand = 0;
                  (inv.items || []).forEach(item => {
                    const q = parseFloat(item.quantity) || 0;
                    const r = parseFloat(item.rate) || 0;
                    const u = item.unit || item.billingMode || 'pcs';
                    const base = u === '1000pcs' ? (q / 1000) * r : q * r;
                    grand += base + (base * (parseFloat(item.gstRate) || 0)) / 100;
                  });
                  grand = Math.round(grand + (parseFloat(inv.freightCharge) || 0) + (parseFloat(inv.cylinderCharge) || 0) - (parseFloat(inv.discountAmount) || 0));

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {formatDate(inv.date)}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{inv.customer?.name || 'Walk-in'}</div>
                        {inv.customer?.phone && (
                          <div className="text-[10px] text-slate-400">{inv.customer.phone}</div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-600">
                        {inv.items?.length || 0} item(s)
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(grand)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(inv.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : inv.paymentStatus === 'partial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                          title="Click to change payment status"
                        >
                          {inv.paymentStatus === 'paid' ? 'Paid' : inv.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(inv)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Print / View Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(inv)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(inv)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

