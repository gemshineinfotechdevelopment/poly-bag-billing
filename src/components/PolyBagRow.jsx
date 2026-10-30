import React from 'react';
import { Trash2, Copy, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { BAG_TYPES, MATERIALS, MICRON_PRESETS } from '../constants/defaults';
import { calculateBagWeightGrams, micronToGauge, gaugeToMicron } from '../utils/polyBagCalc';
import { formatCurrency } from '../utils/formatters';

export default function PolyBagRow({
  item,
  index,
  onChange,
  onRemove,
  onDuplicate
}) {
  // Calculate unit bag weight
  const bagWeightGrams = calculateBagWeightGrams({
    width: item.width,
    length: item.length,
    gusset: item.gusset,
    flap: item.flap,
    micron: item.micron,
    material: item.material
  });

  const weight1000Kg = bagWeightGrams; // Numerically equal

  // Handle field change
  const handleChange = (field, val) => {
    const updated = { ...item, [field]: val };

    // Auto-sync micron and gauge
    if (field === 'micron') {
      updated.gauge = micronToGauge(val);
    } else if (field === 'gauge') {
      updated.micron = gaugeToMicron(val);
    }

    // Auto calculate pieces or weight when qty or specs change
    const specs = {
      width: updated.width,
      length: updated.length,
      gusset: updated.gusset,
      flap: updated.flap,
      micron: updated.micron,
      material: updated.material
    };
    const unitGrams = calculateBagWeightGrams(specs);

    if (updated.billingMode === 'kg') {
      const kg = parseFloat(updated.quantity) || 0;
      if (unitGrams > 0) {
        updated.calculatedPcs = Math.round((kg * 1000) / unitGrams);
      }
    } else {
      const pcs = parseFloat(updated.quantity) || 0;
      if (unitGrams > 0) {
        updated.calculatedWeightKg = Math.round(((pcs * unitGrams) / 1000) * 10) / 10;
      }
    }

    onChange(updated);
  };

  // Generate automated item title from specs
  const handleAutoTitle = () => {
    const mat = item.material || 'LDPE';
    const bType = BAG_TYPES.find(b => b.id === item.bagType)?.name || 'Poly Bag';
    const dim = `${item.width || 0}" × ${item.length || 0}"${item.gusset ? ` + ${item.gusset}" G` : ''}${item.flap ? ` + ${item.flap}" Lip` : ''}`;
    const mic = `${item.micron || 50} Micron (${item.gauge || 200}G)`;
    const color = item.color ? ` - ${item.color}` : '';
    const generated = `${mat} ${bType} [${dim}, ${mic}${color}]`;
    handleChange('description', generated);
  };

  // Recalculate synced pcs/kg manually
  const handleRecalculateSync = () => {
    if (bagWeightGrams <= 0) return;
    const updated = { ...item };
    if (item.billingMode === 'kg') {
      const kg = parseFloat(item.quantity) || 0;
      updated.calculatedPcs = Math.round((kg * 1000) / bagWeightGrams);
    } else {
      const pcs = parseFloat(item.quantity) || 0;
      updated.calculatedWeightKg = Math.round(((pcs * bagWeightGrams) / 1000) * 10) / 10;
    }
    onChange(updated);
  };

  // Line item calculation
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  let baseAmount = 0;
  if (item.billingMode === '1000pcs') {
    baseAmount = (qty / 1000) * rate;
  } else {
    baseAmount = qty * rate;
  }
  const gstRate = parseFloat(item.gstRate) || 0;
  const taxAmount = (baseAmount * gstRate) / 100;
  const lineTotal = baseAmount + taxAmount;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all mb-4">
      {/* Top Header of Line Item */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Details</span>
        </div>

        {/* Quick actions: Duplicate & Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Duplicate line item"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      </div>

      {/* Row 1: Description & Type */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3">
        <div className="md:col-span-6">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Description / Title</label>
            <button
              type="button"
              onClick={handleAutoTitle}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
              title="Auto-generate title from current dimensions and specs"
            >
              <Sparkles className="w-3 h-3" /> Auto Title
            </button>
          </div>
          <input
            type="text"
            value={item.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="e.g. LDPE Transparent Garment Bag with Gusset"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Bag Type</label>
          <select
            value={item.bagType || 'plain'}
            onChange={(e) => handleChange('bagType', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {BAG_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Material</label>
          <select
            value={item.material || 'LDPE'}
            onChange={(e) => handleChange('material', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-indigo-950"
          >
            {MATERIALS.map(m => (
              <option key={m.id} value={m.id}>{m.label} ({m.density} g/cc)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Specifications (Dimensions, Gauge, Micron, Color, Printing) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Width (in)</label>
          <input
            type="number"
            step="0.25"
            min="1"
            value={item.width ?? ''}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-center"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Length (in)</label>
          <input
            type="number"
            step="0.25"
            min="1"
            value={item.length ?? ''}
            onChange={(e) => handleChange('length', e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-center"
            placeholder="14"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gusset (in)</label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={item.gusset ?? ''}
            onChange={(e) => handleChange('gusset', e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-center"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Flap / Lip (in)</label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={item.flap ?? ''}
            onChange={(e) => handleChange('flap', e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-center"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Micron (µm)</label>
          <input
            type="number"
            step="1"
            min="10"
            value={item.micron ?? ''}
            onChange={(e) => handleChange('micron', e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-center font-semibold text-indigo-700"
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gauge</label>
          <input
            type="number"
            step="4"
            min="40"
            value={item.gauge ?? ''}
            onChange={(e) => handleChange('gauge', e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-center"
            placeholder="200"
          />
        </div>

        {/* Color and Printing options */}
        <div className="col-span-2 sm:col-span-3 md:col-span-3 mt-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Color / Clarity</label>
          <input
            type="text"
            value={item.color || ''}
            onChange={(e) => handleChange('color', e.target.value)}
            placeholder="e.g. Transparent / Milky White / Black"
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
          />
        </div>

        <div className="col-span-2 sm:col-span-3 md:col-span-3 mt-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Printing Specification</label>
          <input
            type="text"
            value={item.printing || ''}
            onChange={(e) => handleChange('printing', e.target.value)}
            placeholder="e.g. 1 Color 1 Side / Plain Unprinted"
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
          />
        </div>
      </div>

      {/* Bag Physics Live Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-3 py-1.5 bg-indigo-50/60 rounded-lg text-xs text-indigo-900 border border-indigo-100">
        <div className="flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold">Calculated Bag Weight:</span>
          <span className="font-bold text-indigo-700">{bagWeightGrams} g</span> per piece
          <span className="text-slate-400">|</span>
          <span className="font-bold text-indigo-700">{weight1000Kg} kg</span> per 1,000 bags
        </div>

        {/* Sync conversion indicator */}
        <div className="flex items-center gap-2">
          {item.billingMode === 'kg' ? (
            <span className="text-slate-600">
              Approx <span className="font-semibold text-emerald-700">{item.calculatedPcs?.toLocaleString() || 0}</span> Pieces
            </span>
          ) : (
            <span className="text-slate-600">
              Approx <span className="font-semibold text-emerald-700">{item.calculatedWeightKg || 0}</span> Kg total weight
            </span>
          )}
          <button
            type="button"
            onClick={handleRecalculateSync}
            title="Recalculate pieces/weight"
            className="p-1 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Row 3: Billing Mode, Quantity, Rate, HSN, GST, Total */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-12 gap-3 mt-3 items-end">
        <div className="col-span-2 sm:col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Unit</label>
          <select
            value={item.billingMode || 'kg'}
            onChange={(e) => handleChange('billingMode', e.target.value)}
            className="w-full px-2.5 py-2 text-xs font-semibold border border-indigo-200 bg-indigo-50/40 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="kg">By Weight (Per Kg)</option>
            <option value="1000pcs">Per 1,000 Pcs</option>
            <option value="pcs">Per Piece (Pc)</option>
          </select>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quantity {item.billingMode === 'kg' ? '(Kg)' : '(Pcs)'}
          </label>
          <input
            type="number"
            step={item.billingMode === 'kg' ? '0.5' : '1'}
            min="0"
            value={item.quantity ?? ''}
            onChange={(e) => handleChange('quantity', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-right font-medium"
            placeholder={item.billingMode === 'kg' ? '100' : '10000'}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Rate (₹) / {item.billingMode === 'kg' ? 'Kg' : item.billingMode === '1000pcs' ? '1K Pcs' : 'Pc'}
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={item.rate ?? ''}
            onChange={(e) => handleChange('rate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-right font-medium"
            placeholder="185.00"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
          <input
            type="text"
            value={item.hsnCode || '39232100'}
            onChange={(e) => handleChange('hsnCode', e.target.value)}
            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg text-center"
            placeholder="39232100"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">GST %</label>
          <select
            value={item.gstRate ?? 18}
            onChange={(e) => handleChange('gstRate', parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="0">0% (Nil)</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18% (Standard)</option>
            <option value="28">28%</option>
          </select>
        </div>

        <div className="col-span-2 md:col-span-2 text-right">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Line Amount</label>
          <div className="py-2 text-sm font-bold text-slate-900">
            {formatCurrency(lineTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}

