import React, { useState } from 'react';
import { PlusCircle, Search, Filter, Eye, Edit3, Copy, Trash2, Printer, CheckCircle, Clock, AlertCircle, Download, Upload, Package } from 'lucide-react';
import DashboardStats from './DashboardStats';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

export default function InvoiceList({
  invoices = [],
  onCreateNew,
  onViewInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onToggleStatus,
  onExportData,
  onImportData
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter and sort invoices
  const filtered = invoices.filter(inv => {
    // Search
    const q = searchTerm.toLowerCase();
    const matchSearch = (
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.customer?.name || '').toLowerCase().includes(q) ||
      (inv.customer?.gstin || '').toLowerCase().includes(q) ||
      (inv.items || []).some(item => (item.description || '').toLowerCase().includes(q))
    );

    // Status
    if (!matchSearch) return false;
    if (statusFilter === 'all') return true;
    return inv.paymentStatus === statusFilter;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'date-asc') return new Date(a.date || 0) - new Date(b.date || 0);
    return 0;
  });

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onImportData(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Bird's-Eye Dashboard Metrics */}
      <DashboardStats invoices={invoices} />

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Invoices & Delivery Challans</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage, track, and print all poly bag tax invoices</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Backup & Restore */}
            <button
              onClick={onExportData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              title="Download JSON data backup"
            >
              <Download className="w-3.5 h-3.5" /> Backup
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" /> Restore
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            {/* Create New Bill Button */}
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Create Invoice
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice #, customer, item..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs">
            {[
              { id: 'all', label: 'All Bills' },
              { id: 'pending', label: 'Pending' },
              { id: 'partial', label: 'Partial' },
              { id: 'paid', label: 'Paid' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No invoices found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or filter selection.'
                : 'Create your first poly bag invoice to get started!'}
            </p>
            <button
              onClick={onCreateNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
            >
              <PlusCircle className="w-4 h-4" /> Create Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Bag Items & Yield</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inv => {
                  // Calculate quick items total
                  let grand = 0;
                  let totalKg = 0;
                  (inv.items || []).forEach(item => {
                    const q = parseFloat(item.quantity) || 0;
                    const r = parseFloat(item.rate) || 0;
                    const base = item.billingMode === '1000pcs' ? (q / 1000) * r : q * r;
                    const tax = (base * (parseFloat(item.gstRate) || 0)) / 100;
                    grand += (base + tax);
                    if (item.billingMode === 'kg') {
                      totalKg += q;
                    } else {
                      totalKg += parseFloat(item.calculatedWeightKg) || 0;
                    }
                  });
                  const extras = (parseFloat(inv.cylinderCharge) || 0) + (parseFloat(inv.freightCharge) || 0) + (parseFloat(inv.packagingCharge) || 0);
                  grand = Math.round(grand + extras + (extras * 0.18) - (parseFloat(inv.discountAmount) || 0));

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(inv.date)}
                        {inv.dueDate && (
                          <span className="block text-[10px] text-slate-400">Due: {formatDate(inv.dueDate)}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.customer?.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inv.customer?.gstin || 'Unregistered'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{inv.items?.length || 0} item(s)</span>
                        <span className="block text-[10px] text-slate-500">
                          {totalKg > 0 ? `${formatNumber(totalKg, 1)} Kg Material` : 'Piece billed'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-extrabold text-slate-900 text-sm">{formatCurrency(grand)}</div>
                        {inv.paymentStatus === 'partial' && inv.paidAmount > 0 && (
                          <div className="text-[10px] text-amber-700">
                            Paid: {formatCurrency(inv.paidAmount)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(inv.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95 ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : inv.paymentStatus === 'partial'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title="Click to toggle payment status"
                        >
                          {inv.paymentStatus === 'paid' && <CheckCircle className="w-3 h-3" />}
                          {inv.paymentStatus === 'partial' && <Clock className="w-3 h-3" />}
                          {inv.paymentStatus === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {inv.paymentStatus}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            title="View & Print Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditInvoice(inv)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDuplicateInvoice(inv)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Duplicate as new invoice"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
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

