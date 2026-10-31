import React, { useState } from 'react';
import { Calculator, PlusCircle, Sparkles, Layers, Check } from 'lucide-react';
import { MATERIALS, COMMON_SIZES, MICRON_PRESETS, BAG_TYPES } from '../constants/defaults';
import { estimatePolyBagCost, micronToGauge, gaugeToMicron } from '../utils/polyBagCalc';
import { formatCurrency } from '../utils/formatters';

export default function CalculatorPage({ onAddToInvoice }) {
  const [specs, setSpecs] = useState({
    width: 10,
    length: 14,
    gusset: 0,
    flap: 0,
    micron: 50,
    gauge: 200,
    material: 'LDPE',
    bagType: 'plain',
    quantityBags: 10000,
    rawMaterialRatePerKg: 120,
    masterbatchRatePerKg: 8,
    conversionCostPerKg: 24,
    printingCostPerKg: 10,
    wastagePercent: 3,
    targetMarginPercent: 15
  });

  const [addedNotice, setAddedNotice] = useState(false);

  const handleSpecChange = (field, value) => {
    const updated = { ...specs, [field]: value };
    if (field === 'micron') {
      updated.gauge = micronToGauge(value);
    } else if (field === 'gauge') {
      updated.micron = gaugeToMicron(value);
    }
    setSpecs(updated);
  };

  const handleApplyPreset = (size) => {
    setSpecs(prev => ({
      ...prev,
      width: size.width,
      length: size.length,
      gusset: size.gusset || 0
    }));
  };

  const calculation = estimatePolyBagCost(specs);

  const handleAdd = () => {
    if (!onAddToInvoice) return;
    const itemToAdd = {
      id: `item-${Date.now()}`,
      description: `${specs.material} Poly Bags (${specs.width}" × ${specs.length}"${specs.gusset ? ` + ${specs.gusset}" G` : ''}, ${specs.micron}µ)`,
      bagType: specs.bagType,
      material: specs.material,
      width: parseFloat(specs.width) || 10,
      length: parseFloat(specs.length) || 14,
      gusset: parseFloat(specs.gusset) || 0,
      micron: parseFloat(specs.micron) || 50,
      gauge: parseFloat(specs.gauge) || 200,
      unit: 'kg',
      quantity: Math.round(calculation.totalWeightKg),
      rate: calculation.sellingPricePerKg,
      gstRate: 0,
      hasAdvancedSpecs: true,
      notes: `Approx ${calculation.gramsPerBag}g per piece`
    };

    onAddToInvoice(itemToAdd);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Quotation & Weight Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1.5 tracking-tight text-white">
            Bag Calculator
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Calculate physical bag weight, yield (bags/kg), and cost estimation based on size and micron
          </p>
        </div>

        {onAddToInvoice && (
          <button
            onClick={handleAdd}
            disabled={addedNotice}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
              addedNotice
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02]'
            }`}
          >
            {addedNotice ? (
              <>
                <Check className="w-4 h-4" /> Added to Active Bill!
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Add to Active Invoice
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold mr-1">Common Sizes:</span>
        {COMMON_SIZES.map((sz, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleApplyPreset(sz)}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-medium text-slate-700 transition-colors"
          >
            {sz.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> 1. Dimensions & Material
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Material</label>
                <select
                  value={specs.material}
                  onChange={(e) => handleSpecChange('material', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {MATERIALS.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.density} g/cc)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bag Type</label>
                <select
                  value={specs.bagType}
                  onChange={(e) => handleSpecChange('bagType', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {BAG_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Width (in)</label>
                <input
                  type="number"
                  step="0.25"
                  value={specs.width}
                  onChange={(e) => handleSpecChange('width', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Length (in)</label>
                <input
                  type="number"
                  step="0.25"
                  value={specs.length}
                  onChange={(e) => handleSpecChange('length', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gusset (in)</label>
                <input
                  type="number"
                  step="0.25"
                  value={specs.gusset}
                  onChange={(e) => handleSpecChange('gusset', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Micron (µm)</span>
                  <span className="text-indigo-600 font-bold">{specs.micron} µm</span>
                </div>
                <input
                  type="number"
                  step="1"
                  value={specs.micron}
                  onChange={(e) => handleSpecChange('micron', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Gauge</span>
                  <span className="text-slate-500 font-bold">{specs.gauge} G</span>
                </div>
                <input
                  type="number"
                  step="4"
                  value={specs.gauge}
                  onChange={(e) => handleSpecChange('gauge', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* Micron presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {MICRON_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSpecChange('micron', p.micron)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    specs.micron === p.micron
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.micron}µ ({p.gauge}G)
                </button>
              ))}
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" /> 2. Cost & Target Margin
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Order (Bags)</label>
                <input
                  type="number"
                  step="1000"
                  value={specs.quantityBags}
                  onChange={(e) => handleSpecChange('quantityBags', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Polymer (₹/Kg)</label>
                <input
                  type="number"
                  value={specs.rawMaterialRatePerKg}
                  onChange={(e) => handleSpecChange('rawMaterialRatePerKg', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Conversion (₹/Kg)</label>
                <input
                  type="number"
                  value={specs.conversionCostPerKg}
                  onChange={(e) => handleSpecChange('conversionCostPerKg', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <label className="font-semibold text-slate-700">Target Profit Margin (%):</label>
              <div className="w-20">
                <input
                  type="number"
                  step="1"
                  value={specs.targetMarginPercent}
                  onChange={(e) => handleSpecChange('targetMarginPercent', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded text-center font-bold text-indigo-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Bag Metrics
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-medium">Weight per Bag:</span>
                <span className="font-bold text-slate-900">{calculation.gramsPerBag} g</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-medium">Weight per 1,000 Bags:</span>
                <span className="font-bold text-indigo-700">{calculation.weightPer1000Kg} Kg</span>
              </div>
              <div className="flex justify-between p-2.5 bg-indigo-50/60 rounded-lg text-indigo-950 font-semibold border border-indigo-100">
                <span>Total Order Weight:</span>
                <span className="font-bold">{calculation.totalWeightKg} Kg</span>
              </div>
              <div className="flex justify-between p-2.5 bg-indigo-50/60 rounded-lg text-indigo-950 font-semibold border border-indigo-100">
                <span>Bags Yield per Kg:</span>
                <span className="font-bold">
                  {calculation.gramsPerBag > 0 ? Math.round(1000 / calculation.gramsPerBag) : 0} bags/kg
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-700 text-indigo-200">
              Quotation Rates
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-300 font-semibold block uppercase">Selling Rate / Kg</span>
                  <span className="text-xl font-black text-emerald-400">₹{calculation.sellingPricePerKg}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-300 font-semibold block uppercase">Rate / 1K Bags</span>
                  <span className="text-xl font-black text-emerald-400">₹{calculation.sellingPricePer1000}</span>
                </div>
              </div>

              <div className="flex justify-between pt-1 text-slate-300">
                <span>Total Order Value:</span>
                <span className="font-bold text-white text-sm">
                  {formatCurrency(calculation.totalEstimatedRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

