import React from 'react';
import { IndianRupee, Clock, Weight, Package, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function DashboardStats({ invoices = [] }) {
  let totalRevenue = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalWeightKg = 0;
  let totalBags = 0;
  let paidCount = 0;
  let pendingCount = 0;

  invoices.forEach(inv => {
    // Grand total
    let itemsTotal = 0;
    (inv.items || []).forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const base = item.billingMode === '1000pcs' ? (qty / 1000) * rate : qty * rate;
      const tax = (base * (parseFloat(item.gstRate) || 0)) / 100;
      itemsTotal += (base + tax);

      if (item.billingMode === 'kg') {
        totalWeightKg += qty;
        totalBags += parseFloat(item.calculatedPcs) || 0;
      } else {
        totalBags += qty;
        totalWeightKg += parseFloat(item.calculatedWeightKg) || 0;
      }
    });

    const extras = (parseFloat(inv.cylinderCharge) || 0) + (parseFloat(inv.freightCharge) || 0) + (parseFloat(inv.packagingCharge) || 0);
    const extrasTax = extras * 0.18;
    const discount = parseFloat(inv.discountAmount) || 0;
    const grandTotal = Math.round(itemsTotal + extras + extrasTax - discount);

    totalRevenue += grandTotal;
    const paid = parseFloat(inv.paidAmount) || (inv.paymentStatus === 'paid' ? grandTotal : 0);
    totalPaid += paid;
    totalPending += Math.max(0, grandTotal - paid);

    if (inv.paymentStatus === 'paid' || grandTotal <= paid) {
      paidCount++;
    } else {
      pendingCount++;
    }
  });

  const cards = [
    {
      title: 'Total Billed',
      value: formatCurrency(totalRevenue),
      subtext: `${invoices.length} total invoices`,
      icon: IndianRupee,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Outstanding / Pending',
      value: formatCurrency(totalPending),
      subtext: `${pendingCount} unpaid / partial bills`,
      icon: Clock,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50 border-amber-100'
    },
    {
      title: 'Total Material Weight',
      value: `${formatNumber(totalWeightKg, 1)} Kg`,
      subtext: `${(totalWeightKg / 1000).toFixed(2)} Metric Tonnes`,
      icon: Weight,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Total Bags Supplied',
      value: `${formatNumber(totalBags, 0)} Pcs`,
      subtext: `${formatNumber(Math.round(totalBags / 1000), 0)} Thousand Bags`,
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50 border-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl border bg-white shadow-sm flex items-start justify-between transition-all hover:shadow-md`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{c.value}</h3>
              <p className="text-xs text-slate-500 mt-1">{c.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${c.bgLight} ${c.textColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

