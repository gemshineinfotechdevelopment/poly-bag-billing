import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, ShoppingCart, IndianRupee, Printer, Download,
  Calendar, Search, Filter, ArrowUpRight, ArrowDownRight, Package,
  Users, Truck, FileText, CheckCircle2, Clock, AlertTriangle, Layers, Percent
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

export default function ReportsPage({
  invoices = [],
  purchases = [],
  products = [],
  customers = []
}) {
  const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales' | 'purchases' | 'products' | 'customers' | 'gst'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'this-month' | 'last-30' | 'this-year' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Date Filtering Helper
  const filterByDateRange = (itemDate) => {
    if (!itemDate) return true;
    const date = new Date(itemDate);
    const now = new Date();

    if (dateFilter === 'this-month') {
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }
    if (dateFilter === 'last-30') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= thirtyDaysAgo;
    }
    if (dateFilter === 'this-year') {
      return date.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'custom') {
      if (startDate && date < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true; // 'all'
  };

  // 1. Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchDate = filterByDateRange(inv.date);
      if (!matchDate) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        (inv.invoiceNumber || '').toLowerCase().includes(q) ||
        (inv.customer?.name || '').toLowerCase().includes(q) ||
        (inv.items || []).some(item => (item.description || '').toLowerCase().includes(q))
      );
    });
  }, [invoices, dateFilter, startDate, endDate, searchTerm]);

  // 2. Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(pur => {
      const matchDate = filterByDateRange(pur.purchaseDate);
      if (!matchDate) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        (pur.purchaseNumber || '').toLowerCase().includes(q) ||
        (pur.supplierName || '').toLowerCase().includes(q) ||
        (pur.productName || '').toLowerCase().includes(q)
      );
    });
  }, [purchases, dateFilter, startDate, endDate, searchTerm]);

  // 3. Compute Comprehensive Financial Analytics
  const analytics = useMemo(() => {
    let grossSales = 0;
    let taxableSales = 0;
    let outputGst = 0;
    let collectedAmount = 0;
    let pendingReceivables = 0;
    let totalWeightSoldKg = 0;
    let totalPcsSold = 0;
    const gstSlabs = { '0%': 0, '5%': 0, '12%': 0, '18%': 0, '28%': 0 };

    filteredInvoices.forEach(inv => {
      let invBase = 0;
      let invTax = 0;
      (inv.items || []).forEach(item => {
        const q = parseFloat(item.quantity) || 0;
        const r = parseFloat(item.rate) || 0;
        const u = item.unit || item.billingMode || 'pcs';
        const base = u === '1000pcs' ? (q / 1000) * r : q * r;
        const taxRate = parseFloat(item.gstRate) || 0;
        const tax = (base * taxRate) / 100;
        invBase += base;
        invTax += tax;

        if (taxRate === 5) gstSlabs['5%'] += tax;
        else if (taxRate === 12) gstSlabs['12%'] += tax;
        else if (taxRate === 18) gstSlabs['18%'] += tax;
        else if (taxRate === 28) gstSlabs['28%'] += tax;
        else gstSlabs['0%'] += base;

        if (u === 'kg') totalWeightSoldKg += q;
        else if (u === 'pcs') totalPcsSold += q;
      });

      const grand = Math.round(
        invBase + invTax +
        (parseFloat(inv.freightCharge) || 0) +
        (parseFloat(inv.cylinderCharge) || 0) -
        (parseFloat(inv.discountAmount) || 0)
      );

      grossSales += grand;
      taxableSales += invBase;
      outputGst += invTax;

      const paid = parseFloat(inv.paidAmount) || (inv.paymentStatus === 'paid' ? grand : 0);
      collectedAmount += paid;
      pendingReceivables += Math.max(0, grand - paid);
    });

    let totalPurchases = 0;
    let pendingPayables = 0;
    let totalPurchasedQtyKg = 0;

    filteredPurchases.forEach(pur => {
      const amt = parseFloat(pur.totalAmount) || 0;
      totalPurchases += amt;
      if (pur.paymentStatus === 'pending') {
        pendingPayables += amt;
      }
      if (pur.unit === 'kg') {
        totalPurchasedQtyKg += parseFloat(pur.quantity) || 0;
      }
    });

    const grossProfit = grossSales - totalPurchases;
    const profitMarginPct = grossSales > 0 ? (grossProfit / grossSales) * 100 : 0;
    const collectionRatePct = grossSales > 0 ? (collectedAmount / grossSales) * 100 : 0;

    // Estimate input GST (approx 18% on purchase costs)
    const estimatedInputGst = Math.round(totalPurchases * 0.18 / 1.18);
    const netGstPayable = Math.max(0, outputGst - estimatedInputGst);

    return {
      grossSales,
      taxableSales,
      outputGst,
      collectedAmount,
      pendingReceivables,
      totalPurchases,
      pendingPayables,
      grossProfit,
      profitMarginPct,
      collectionRatePct,
      totalWeightSoldKg,
      totalPcsSold,
      totalPurchasedQtyKg,
      gstSlabs,
      estimatedInputGst,
      netGstPayable
    };
  }, [filteredInvoices, filteredPurchases]);

  // 4. Product Sales Performance Breakdown
  const productPerformance = useMemo(() => {
    const map = {};
    filteredInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const key = item.productId || item.description || 'Unknown Item';
        if (!map[key]) {
          map[key] = {
            id: key,
            name: item.description || 'Poly Bag',
            quantityKg: 0,
            quantityPcs: 0,
            revenue: 0,
            orderCount: 0
          };
        }
        const q = parseFloat(item.quantity) || 0;
        const r = parseFloat(item.rate) || 0;
        const u = item.unit || item.billingMode || 'pcs';
        const base = u === '1000pcs' ? (q / 1000) * r : q * r;
        const lineTotal = base + (base * (parseFloat(item.gstRate) || 0)) / 100;

        if (u === 'kg') map[key].quantityKg += q;
        else map[key].quantityPcs += q;

        map[key].revenue += lineTotal;
        map[key].orderCount += 1;
      });
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredInvoices]);

  // 5. Customer Revenue & Ledger Summary
  const customerSummary = useMemo(() => {
    const map = {};
    filteredInvoices.forEach(inv => {
      const name = inv.customer?.name || 'Walk-in Customer';
      if (!map[name]) {
        map[name] = {
          name,
          phone: inv.customer?.phone || '',
          gstin: inv.customer?.gstin || '',
          billsCount: 0,
          totalBilled: 0,
          totalPaid: 0,
          outstandingBalance: 0
        };
      }
      let invBase = 0;
      let invTax = 0;
      (inv.items || []).forEach(item => {
        const q = parseFloat(item.quantity) || 0;
        const r = parseFloat(item.rate) || 0;
        const u = item.unit || item.billingMode || 'pcs';
        const base = u === '1000pcs' ? (q / 1000) * r : q * r;
        invBase += base;
        invTax += (base * (parseFloat(item.gstRate) || 0)) / 100;
      });
      const grand = Math.round(
        invBase + invTax +
        (parseFloat(inv.freightCharge) || 0) +
        (parseFloat(inv.cylinderCharge) || 0) -
        (parseFloat(inv.discountAmount) || 0)
      );
      const paid = parseFloat(inv.paidAmount) || (inv.paymentStatus === 'paid' ? grand : 0);

      map[name].billsCount += 1;
      map[name].totalBilled += grand;
      map[name].totalPaid += paid;
      map[name].outstandingBalance += Math.max(0, grand - paid);
    });

    return Object.values(map).sort((a, b) => b.totalBilled - a.totalBilled);
  }, [filteredInvoices]);

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReportTab === 'sales') {
      csvContent += 'Invoice Number,Date,Customer,Contact,Taxable Amount,GST Amount,Grand Total,Payment Status\n';
      filteredInvoices.forEach(inv => {
        let base = 0;
        let tax = 0;
        (inv.items || []).forEach(it => {
          const q = parseFloat(it.quantity) || 0;
          const r = parseFloat(it.rate) || 0;
          const u = it.unit || it.billingMode || 'pcs';
          const b = u === '1000pcs' ? (q / 1000) * r : q * r;
          base += b;
          tax += (b * (parseFloat(it.gstRate) || 0)) / 100;
        });
        const grand = Math.round(base + tax + (parseFloat(inv.freightCharge) || 0) - (parseFloat(inv.discountAmount) || 0));
        csvContent += `"${inv.invoiceNumber}","${inv.date}","${(inv.customer?.name || '').replace(/"/g, '""')}","${inv.customer?.phone || ''}",${base.toFixed(2)},${tax.toFixed(2)},${grand.toFixed(2)},"${inv.paymentStatus}"\n`;
      });
    } else if (activeReportTab === 'purchases') {
      csvContent += 'Purchase ID,Date,Supplier,Product,Quantity,Unit,Unit Rate,Total Amount,Payment Status\n';
      filteredPurchases.forEach(pur => {
        csvContent += `"${pur.purchaseNumber}","${pur.purchaseDate}","${(pur.supplierName || '').replace(/"/g, '""')}","${(pur.productName || '').replace(/"/g, '""')}",${pur.quantity},"${pur.unit}",${pur.unitCost},${pur.totalAmount},"${pur.paymentStatus}"\n`;
      });
    } else if (activeReportTab === 'products') {
      csvContent += 'Product Name,Total Weight Sold (Kg),Total Bags Sold (Pcs),Revenue (INR),Invoices Count\n';
      productPerformance.forEach(p => {
        csvContent += `"${p.name.replace(/"/g, '""')}",${p.quantityKg.toFixed(1)},${p.quantityPcs},${p.revenue.toFixed(2)},${p.orderCount}\n`;
      });
    } else if (activeReportTab === 'customers') {
      csvContent += 'Customer Name,Phone,GSTIN,Bills Count,Total Billed,Total Paid,Outstanding Due\n';
      customerSummary.forEach(c => {
        csvContent += `"${c.name.replace(/"/g, '""')}","${c.phone}","${c.gstin}",${c.billsCount},${c.totalBilled.toFixed(2)},${c.totalPaid.toFixed(2)},${c.outstandingBalance.toFixed(2)}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `polypack-report-${activeReportTab}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Signature Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Business Analytics
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Real-time P&L, GST & Volume Insights
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-2 mb-1.5 tracking-tight text-white">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sales turnover, vendor purchases, gross profit margins, GST summaries & customer ledgers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 no-print">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" /> Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* 2. Date Range Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 no-print">
        {/* Preset Range Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'this-month', label: 'This Month' },
            { id: 'last-30', label: 'Last 30 Days' },
            { id: 'this-year', label: 'This Year' },
            { id: 'custom', label: 'Custom Range' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        )}

        {/* Search Input */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report records..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Executive KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        {/* Gross Sales Turnover */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(analytics.grossSales)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-emerald-700 font-bold">₹{formatNumber(analytics.collectedAmount, 0)}</span> collected ({analytics.collectionRatePct.toFixed(0)}%)
          </div>
        </div>

        {/* Total Purchases Cost */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Purchases</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(analytics.totalPurchases)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>{filteredPurchases.length} vendor batches</span>
          </div>
        </div>

        {/* Estimated Gross Profit */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Margin</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              analytics.grossProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {analytics.grossProfit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-lg sm:text-2xl font-black mt-1 ${
            analytics.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {formatCurrency(analytics.grossProfit)}
          </div>
          <div className="mt-1 text-[11px] font-bold text-slate-500">
            {analytics.profitMarginPct.toFixed(1)}% profit margin
          </div>
        </div>

        {/* Volume Dispatched (Material Weight) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Volume Sold</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-purple-950 mt-1">
            {formatNumber(analytics.totalWeightSoldKg, 1)} <span className="text-sm font-bold text-slate-500">Kg</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            + {formatNumber(analytics.totalPcsSold, 0)} poly bags sold
          </div>
        </div>
      </div>

      {/* 4. GST Summary Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">GST Tax Overview (GSTR-3B Summary)</h3>
            <p className="text-[11px] text-slate-500">Output tax on sales vs. estimated input tax credit</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Taxable Turnover</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(analytics.taxableSales)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Output GST (Collected)</span>
            <span className="font-extrabold text-indigo-700 text-sm">{formatCurrency(analytics.outputGst)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Input GST (Purchases)</span>
            <span className="font-extrabold text-emerald-700 text-sm">{formatCurrency(analytics.estimatedInputGst)}</span>
          </div>
          <div className="pl-4 border-l border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Net GST Payable</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(analytics.netGstPayable)}</span>
          </div>
        </div>
      </div>

      {/* 5. Sub-Report Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Tab Headers */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'sales', label: 'Sales Report', count: filteredInvoices.length, icon: FileText },
              { id: 'purchases', label: 'Purchases Ledger', count: filteredPurchases.length, icon: Truck },
              { id: 'products', label: 'Product Performance', count: productPerformance.length, icon: Package },
              { id: 'customers', label: 'Customer Receivables', count: customerSummary.length, icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeReportTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReportTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Showing filtered records
          </span>
        </div>

        {/* TAB 1: Detailed Sales Report */}
        {activeReportTab === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">GST</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No sales records found for this period.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    let base = 0;
                    let tax = 0;
                    (inv.items || []).forEach(it => {
                      const q = parseFloat(it.quantity) || 0;
                      const r = parseFloat(it.rate) || 0;
                      const u = it.unit || it.billingMode || 'pcs';
                      const b = u === '1000pcs' ? (q / 1000) * r : q * r;
                      base += b;
                      tax += (b * (parseFloat(it.gstRate) || 0)) / 100;
                    });
                    const grand = Math.round(
                      base + tax +
                      (parseFloat(inv.freightCharge) || 0) +
                      (parseFloat(inv.cylinderCharge) || 0) -
                      (parseFloat(inv.discountAmount) || 0)
                    );

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {formatDate(inv.date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inv.customer?.name || 'Walk-in'}</div>
                          {inv.customer?.phone && <div className="text-[10px] text-slate-400">{inv.customer.phone}</div>}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {inv.items?.length || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {formatCurrency(base)}
                        </td>
                        <td className="py-3 px-4 text-right text-indigo-700 font-medium">
                          {formatCurrency(tax)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(grand)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : inv.paymentStatus === 'partial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan="4" className="py-3 px-4 text-slate-800">
                    Total ({filteredInvoices.length} Bills)
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatCurrency(analytics.taxableSales)}
                  </td>
                  <td className="py-3 px-4 text-right text-indigo-700">
                    {formatCurrency(analytics.outputGst)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-extrabold">
                    {formatCurrency(analytics.grossSales)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* TAB 2: Purchases & Vendor Ledger */}
        {activeReportTab === 'purchases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Purchase ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vendor / Supplier</th>
                  <th className="py-3 px-4">Material / Product</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Rate</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No purchase records found for this period.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(pur => (
                    <tr key={pur.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {pur.purchaseNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(pur.purchaseDate)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {pur.supplierName}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {pur.productName}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {pur.quantity} {pur.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        ₹{pur.unitCost}/{pur.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(pur.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          pur.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {pur.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan="6" className="py-3 px-4 text-slate-800">
                    Total Purchases ({filteredPurchases.length} Batches)
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-extrabold">
                    {formatCurrency(analytics.totalPurchases)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* TAB 3: Product Performance Breakdown */}
        {activeReportTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Orders Count</th>
                  <th className="py-3 px-4 text-right">Total Weight Sold</th>
                  <th className="py-3 px-4 text-right">Total Bags Sold</th>
                  <th className="py-3 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No product sales recorded in this period.
                    </td>
                  </tr>
                ) : (
                  productPerformance.map((prod, index) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {prod.name}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {prod.orderCount} orders
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {prod.quantityKg > 0 ? `${formatNumber(prod.quantityKg, 1)} Kg` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {prod.quantityPcs > 0 ? `${formatNumber(prod.quantityPcs, 0)} Pcs` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-700">
                        {formatCurrency(prod.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Customer Receivables Ledger */}
        {activeReportTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4 text-center">Bills Count</th>
                  <th className="py-3 px-4 text-right">Total Billed</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerSummary.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No customer ledger data found.
                    </td>
                  </tr>
                ) : (
                  customerSummary.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {cust.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {cust.phone || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {cust.gstin || '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {cust.billsCount}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {formatCurrency(cust.totalBilled)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                        {formatCurrency(cust.totalPaid)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-700">
                        {cust.outstandingBalance > 0 ? formatCurrency(cust.outstandingBalance) : '₹0.00'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan="4" className="py-3 px-4 text-slate-800">
                    Total Outstanding Receivables
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatCurrency(analytics.grossSales)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700">
                    {formatCurrency(analytics.collectedAmount)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-700 font-extrabold">
                    {formatCurrency(analytics.pendingReceivables)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

