import React from 'react';
import {
  TrendingUp, ShoppingCart, ShoppingBag, AlertTriangle, ArrowUpRight,
  PlusCircle, Calculator, Package, CheckCircle2, Clock, IndianRupee,
  Boxes, Users, ArrowRight, Eye, RefreshCw, BarChart3, Truck, FileText, Settings
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

export default function DashboardPage({
  invoices = [],
  purchases = [],
  products = [],
  customers = [],
  company,
  onNavigate,
  onStartNewInvoice,
  onViewInvoice,
  onRestockProduct
}) {
  // 1. Calculate Sales Totals
  let totalSales = 0;
  let totalCollected = 0;
  let totalPendingReceivables = 0;
  let totalSoldWeightKg = 0;
  let totalSoldPcs = 0;
  let paidInvoicesCount = 0;
  let pendingInvoicesList = [];

  invoices.forEach(inv => {
    let itemsBase = 0;
    let itemsTax = 0;

    (inv.items || []).forEach(item => {
      const q = parseFloat(item.quantity) || 0;
      const r = parseFloat(item.rate) || 0;
      const u = item.unit || item.billingMode || 'pcs';
      const base = u === '1000pcs' ? (q / 1000) * r : q * r;
      const tax = (base * (parseFloat(item.gstRate) || 0)) / 100;
      itemsBase += base;
      itemsTax += tax;

      if (u === 'kg') totalSoldWeightKg += q;
      else if (u === 'pcs') totalSoldPcs += q;
    });

    const grand = Math.round(
      itemsBase + itemsTax +
      (parseFloat(inv.freightCharge) || 0) +
      (parseFloat(inv.cylinderCharge) || 0) -
      (parseFloat(inv.discountAmount) || 0)
    );

    totalSales += grand;
    const paid = parseFloat(inv.paidAmount) || (inv.paymentStatus === 'paid' ? grand : 0);
    totalCollected += paid;

    const pending = Math.max(0, grand - paid);
    if (pending > 0 || inv.paymentStatus !== 'paid') {
      totalPendingReceivables += pending;
      pendingInvoicesList.push({
        ...inv,
        grandTotal: grand,
        pendingAmount: pending
      });
    } else {
      paidInvoicesCount++;
    }
  });

  // 2. Calculate Purchases Totals
  let totalPurchases = 0;
  let pendingPayables = 0;
  purchases.forEach(pur => {
    const amt = parseFloat(pur.totalAmount) || 0;
    totalPurchases += amt;
    if (pur.paymentStatus === 'pending') {
      pendingPayables += amt;
    }
  });

  // Estimated Gross Profit
  const estimatedProfit = totalSales - totalPurchases;

  // 3. Inventory Snapshot
  let totalStockValue = 0;
  let lowStockProducts = [];
  products.forEach(p => {
    const stock = parseFloat(p.currentStock) || 0;
    const price = parseFloat(p.sellingPrice) || 0;
    const minAlert = parseFloat(p.minStockAlert) || 10;
    totalStockValue += stock * price;

    if (stock <= minAlert) {
      lowStockProducts.push(p);
    }
  });

  // Recent 5 Invoices
  const recentInvoices = [...invoices].slice(0, 5);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Welcome & Business Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Business Overview
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1.5 tracking-tight">
            {company?.name || 'PolyPack Billing & Stock'}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Poly Bag Manufacturing, Selling & Inventory Dashboard
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onStartNewInvoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> New Bill
          </button>

          <button
            onClick={() => onNavigate('purchases')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4 text-emerald-400" /> Record Purchase
          </button>

          <button
            onClick={() => onNavigate('calculator')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-amber-400" /> Bag Calc
          </button>
        </div>
      </div>

      {/* 2. Key Business Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Sales (Revenue) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalSales)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-bold">₹{formatNumber(totalCollected, 0)}</span> collected
          </div>
        </div>

        {/* Total Purchases (Stock Inward) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Purchases</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalPurchases)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>{purchases.length} vendor batches</span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Bills</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-700 mt-1">
            {formatCurrency(totalPendingReceivables)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">{pendingInvoicesList.length}</span> unpaid bills
          </div>
        </div>

        {/* Live Stock Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Valuation</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-900 mt-1">
            {formatCurrency(totalStockValue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{products.length} catalog items</span>
            {lowStockProducts.length > 0 && (
              <span className="text-rose-600 font-bold">{lowStockProducts.length} low</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Poly Bag Volume Stats Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Total Bag Dispatch Volume</h3>
            <p className="text-[11px] text-slate-500">Total bags & material delivered across all sales bills</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500 font-medium">Total Weight:</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatNumber(totalSoldWeightKg, 1)} kg</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500 font-medium">Total Quantity:</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatNumber(totalSoldPcs, 0)} pcs</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500 font-medium">Estimated Gross:</span>
            <span className={`font-extrabold text-sm ${estimatedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatCurrency(estimatedProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Core Navigation Modules (4 Needed Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">4 Core Business Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Selling & Bills */}
          <div
            onClick={() => onNavigate('invoices')}
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {invoices.length} Bills
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Selling & Bills
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Generate, edit, view & print customer GST bills
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Open Selling</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Purchases */}
          <div
            onClick={() => onNavigate('purchases')}
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {purchases.length} Batches
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                Purchases
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Record supplier bills & add inward stock
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Open Purchases</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Products */}
          <div
            onClick={() => onNavigate('products')}
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Boxes className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  lowStockProducts.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-purple-50 text-purple-700'
                }`}>
                  {products.length} Products
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                Products
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Catalog, live stock tracking & restock alerts
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Open Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Settings */}
          <div
            onClick={() => onNavigate('settings')}
            className="group bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Profile
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-800 transition-colors">
                Settings
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Company name, address, GSTIN & print format
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Open Settings</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Two Column Alerts Row: Low Stock Warnings & Pending Receivables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Stock Alert Box */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Low Stock Warnings ({lowStockProducts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
            >
              Open Products →
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-4 text-center text-xs text-emerald-700 font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> All product stock levels are healthy!
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map(p => {
                const stock = parseFloat(p.currentStock) || 0;
                const isOut = stock <= 0;
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      <span className={`text-[10px] font-bold ${isOut ? 'text-rose-600' : 'text-amber-700'}`}>
                        {isOut ? 'Out of Stock (0 ' + p.unit + ')' : `Only ${stock} ${p.unit} remaining`}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('products')}
                      className="px-2 py-1 text-[11px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 rounded-md transition-all shrink-0 cursor-pointer"
                    >
                      + Restock
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Pending Receivables Box */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Unpaid Invoices ({pendingInvoicesList.length})
              </h3>
            </div>
            <span className="text-xs font-extrabold text-amber-700">
              {formatCurrency(totalPendingReceivables)}
            </span>
          </div>

          {pendingInvoicesList.length === 0 ? (
            <div className="py-4 text-center text-xs text-emerald-700 font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> No pending customer bills!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {pendingInvoicesList.slice(0, 4).map(inv => (
                <div
                  key={inv.id}
                  onClick={() => onViewInvoice(inv)}
                  className="p-2 rounded-lg hover:bg-amber-50/50 border border-slate-100 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{inv.customer?.name || 'Walk-in'}</span>
                      <span className="text-[10px] text-slate-400">({inv.invoiceNumber})</span>
                    </div>
                    {inv.customer?.phone && (
                      <p className="text-[10px] text-slate-500">{inv.customer.phone}</p>
                    )}
                  </div>
                  <span className="font-extrabold text-amber-800">
                    {formatCurrency(inv.pendingAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

