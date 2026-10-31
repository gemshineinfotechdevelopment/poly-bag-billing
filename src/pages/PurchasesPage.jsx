import React, { useState } from 'react';
import {
  Truck, PlusCircle, Search, Trash2, CheckCircle2, Clock,
  IndianRupee, Package, X, ArrowDownLeft, Building2, Calendar
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

export default function PurchasesPage({
  purchases = [],
  products = [],
  onSavePurchase,
  onDeletePurchase
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'pending'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialForm = {
    date: new Date().toISOString().slice(0, 10),
    vendorName: '',
    vendorBillNo: '',
    productId: products[0]?.id || '',
    productName: products[0]?.name || '',
    unit: products[0]?.unit || 'kg',
    quantity: '',
    unitCost: products[0]?.costPrice || '',
    paymentStatus: 'paid',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Metrics
  let totalPurchasesAmt = 0;
  let paidPurchasesAmt = 0;
  let pendingPurchasesAmt = 0;
  let totalInwardQty = 0;

  purchases.forEach(p => {
    const amt = parseFloat(p.totalAmount) || 0;
    const q = parseFloat(p.quantity) || 0;
    totalPurchasesAmt += amt;
    totalInwardQty += q;
    if (p.paymentStatus === 'paid') paidPurchasesAmt += amt;
    else pendingPurchasesAmt += amt;
  });

  // Filter
  const filtered = purchases.filter(p => {
    const q = searchTerm.toLowerCase();
    const match = (
      (p.purchaseNumber || '').toLowerCase().includes(q) ||
      (p.vendorName || '').toLowerCase().includes(q) ||
      (p.vendorBillNo || '').toLowerCase().includes(q) ||
      (p.productName || '').toLowerCase().includes(q)
    );
    if (!match) return false;
    if (statusFilter === 'all') return true;
    return p.paymentStatus === statusFilter;
  });

  const handleOpenModal = () => {
    const firstProd = products[0];
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      vendorName: '',
      vendorBillNo: '',
      productId: firstProd?.id || '',
      productName: firstProd?.name || '',
      unit: firstProd?.unit || 'kg',
      quantity: '',
      unitCost: firstProd?.costPrice || '',
      paymentStatus: 'paid',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleProductSelect = (prodId) => {
    const found = products.find(p => p.id === prodId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        productId: found.id,
        productName: found.name,
        unit: found.unit || 'kg',
        unitCost: found.costPrice || prev.unitCost
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) {
      alert('Please enter vendor/supplier name.');
      return;
    }
    const q = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.unitCost) || 0;
    if (q <= 0) {
      alert('Please enter a valid incoming quantity.');
      return;
    }

    const total = Math.round(q * rate);

    onSavePurchase({
      ...formData,
      quantity: q,
      unitCost: rate,
      totalAmount: total
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Stock Inward & Vendors
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {purchases.length} vendor batches
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1.5 tracking-tight text-white">
            Purchases
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Record vendor bills, raw materials & automatically replenish product stock
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Record Purchase
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor, bill #, or product..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'paid', label: 'Paid' },
            { id: 'pending', label: 'Pending' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Purchases List / Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No purchase records found</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Record raw material or ready bag purchases to automatically increase inventory.
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" /> Record Purchase
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5">Purchase #</th>
                  <th className="py-2.5 px-3.5">Date</th>
                  <th className="py-2.5 px-3.5">Vendor / Supplier</th>
                  <th className="py-2.5 px-3.5">Product Inward</th>
                  <th className="py-2.5 px-3.5 text-right">Qty</th>
                  <th className="py-2.5 px-3.5 text-right">Cost Rate</th>
                  <th className="py-2.5 px-3.5 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-indigo-950 whitespace-nowrap">
                      {p.purchaseNumber}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-800">{p.vendorName}</div>
                      {p.vendorBillNo && (
                        <div className="text-[10px] text-slate-400">Bill: {p.vendorBillNo}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="font-semibold text-slate-800">{p.productName}</span>
                      {p.notes && (
                        <span className="block text-[10px] text-slate-400 truncate max-w-xs">{p.notes}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {p.quantity} <span className="text-[10px] text-slate-500 uppercase">{p.unit}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-600 whitespace-nowrap">
                      {formatCurrency(p.unitCost)}/{p.unit}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {p.paymentStatus?.toUpperCase() || 'PAID'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm(`Delete purchase record ${p.purchaseNumber}?`)) {
                            onDeletePurchase(p.id);
                          }
                        }}
                        className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
                        title="Delete purchase entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" /> Record Purchase
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor Bill / Challan #</label>
                  <input
                    type="text"
                    value={formData.vendorBillNo}
                    onChange={(e) => setFormData({ ...formData, vendorBillNo: e.target.value })}
                    placeholder="e.g. INV-8821"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g. Apex Polymers, Supreme Packaging"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Product to Inward (Restock) *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (Current Stock: {prod.currentStock} {prod.unit})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                  ✓ Incoming quantity will be added automatically to this product's stock.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Quantity Inward ({formData.unit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Purchase Rate / Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    placeholder="Rate per unit"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* Auto Total */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">Total Purchase Value:</span>
                <span className="text-sm font-extrabold text-indigo-900">
                  {formatCurrency((parseFloat(formData.quantity) || 0) * (parseFloat(formData.unitCost) || 0))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Batch, Quality, Lot No"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-2xs"
                >
                  Save & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

