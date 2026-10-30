import React, { useState } from 'react';
import { Calculator, PlusCircle, ArrowRight, Sparkles, HelpCircle, Layers, Check } from 'lucide-react';
import { MATERIALS, COMMON_SIZES, MICRON_PRESETS, BAG_TYPES } from '../constants/defaults';
import { estimatePolyBagCost, micronToGauge, gaugeToMicron } from '../utils/polyBagCalc';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function PolyBagCalculator({ onAddToInvoice }) {
  const [specs, setSpecs] = useState({
    width: 10,
    length: 14,
    gusset: 0,
    flap: 1.5,
    micron: 50,
    gauge: 200,
    material: 'LDPE',
    bagType: 'plain',
    quantityBags: 10000,
    rawMaterialRatePerKg: 118,
    masterbatchRatePerKg: 8,
    conversionCostPerKg: 24,
    printingCostPerKg: 12,
    wastagePercent: 4,
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
      description: `${specs.material} ${BAG_TYPES.find(b => b.id === specs.bagType)?.name || 'Poly Bag'} (${specs.width}" × ${specs.length}"${specs.gusset ? ` + ${specs.gusset}" G` : ''}, ${specs.micron}µ)`,
      bagType: specs.bagType,
      material: specs.material,
      width: parseFloat(specs.width) || 10,
      length: parseFloat(specs.length) || 14,
      gusset: parseFloat(specs.gusset) || 0,
      flap: parseFloat(specs.flap) || 0,
      micron: parseFloat(specs.micron) || 50,
      gauge: parseFloat(specs.gauge) || 200,
      color: 'Standard Natural',
      printing: specs.printingCostPerKg > 0 ? 'Printed' : 'Plain Unprinted',
      hsnCode: '39232100',
      billingMode: 'kg',
      quantity: Math.round(calculation.totalWeightKg),
      calculatedPcs: parseInt(specs.quantityBags, 10),
      rate: calculation.sellingPricePerKg,
      gstRate: 18,
      notes: `Calculated at approx ${calculation.gramsPerBag}g per piece`
    };

    onAddToInvoice(itemToAdd);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
              <Calculator className="w-3.5 h-3.5" /> Poly Bag Manufacturing & Estimation Engine
            </div>
            <h2 className="text-2xl font-bold">Poly Bag Weight & Cost Calculator</h2>
            <p className="text-sm text-indigo-100 mt-1 max-w-2xl">
              Calculate exact physical weight, yield (bags/kg), raw material formulation, production cost, and target selling price based on dimensions, polymer density, and gauge.
            </p>
          </div>

          {onAddToInvoice && (
            <button
              onClick={handleAdd}
              disabled={addedNotice}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg transition-all ${
                addedNotice
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95'
              }`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-5 h-5" /> Added to Invoice!
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" /> Add to Active Invoice
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick presets */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2">
          <span className="text-xs text-indigo-200 font-semibold mr-1">Quick Sizes:</span>
          {COMMON_SIZES.map((sz, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(sz)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/25 border border-white/20 transition-colors"
            >
              {sz.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Bag Geometry & Polymer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-600" /> 1. Bag Dimensions & Material Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Polymer Material</label>
                <select
                  value={specs.material}
                  onChange={(e) => handleSpecChange('material', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {MATERIALS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Density: {m.density} g/cc)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {MATERIALS.find(m => m.id === specs.material)?.desc}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bag Type / Style</label>
                <select
                  value={specs.bagType}
                  onChange={(e) => handleSpecChange('bagType', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {BAG_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {BAG_TYPES.find(t => t.id === specs.bagType)?.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Width (Inches)</label>
                <input
                  type="number"
                  step="0.25"
                  min="1"
                  value={specs.width}
                  onChange={(e) => handleSpecChange('width', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Length (Inches)</label>
                <input
                  type="number"
                  step="0.25"
                  min="1"
                  value={specs.length}
                  onChange={(e) => handleSpecChange('length', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gusset (Inches)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={specs.gusset}
                  onChange={(e) => handleSpecChange('gusset', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <span className="text-[10px] text-slate-400 block text-center mt-0.5">Side / Bottom</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Flap / Lip (Inches)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={specs.flap}
                  onChange={(e) => handleSpecChange('flap', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <span className="text-[10px] text-slate-400 block text-center mt-0.5">Peel tape / lip</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Thickness in Micron (µm)</label>
                  <span className="text-xs font-bold text-indigo-600">{specs.micron} µm</span>
                </div>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="300"
                  value={specs.micron}
                  onChange={(e) => handleSpecChange('micron', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Equivalent in Gauge</label>
                  <span className="text-xs font-bold text-slate-600">{specs.gauge} Gauge</span>
                </div>
                <input
                  type="number"
                  step="4"
                  min="40"
                  max="1200"
                  value={specs.gauge}
                  onChange={(e) => handleSpecChange('gauge', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>
            </div>

            {/* Quick Micron Presets */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MICRON_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSpecChange('micron', p.micron)}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
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

          {/* Card 2: Costing & Margin Parameters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-purple-600" /> 2. Manufacturing Cost & Margin Breakdown
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Order Quantity (Bags)</label>
                <input
                  type="number"
                  step="500"
                  min="100"
                  value={specs.quantityBags}
                  onChange={(e) => handleSpecChange('quantityBags', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Virgin Granule (₹/Kg)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={specs.rawMaterialRatePerKg}
                  onChange={(e) => handleSpecChange('rawMaterialRatePerKg', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Masterbatch/Color (₹/Kg)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={specs.masterbatchRatePerKg}
                  onChange={(e) => handleSpecChange('masterbatchRatePerKg', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Conversion Cost (₹/Kg)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={specs.conversionCostPerKg}
                  onChange={(e) => handleSpecChange('conversionCostPerKg', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  title="Electricity, labor, machine depreciation, cutting & sealing"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Printing Ink Cost (₹/Kg)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={specs.printingCostPerKg}
                  onChange={(e) => handleSpecChange('printingCostPerKg', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Wastage / Trim (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={specs.wastagePercent}
                  onChange={(e) => handleSpecChange('wastagePercent', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-700">Target Profit Margin (%)</label>
                <p className="text-[11px] text-slate-500">Margin added on top of total production cost</p>
              </div>
              <div className="w-32">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={specs.targetMarginPercent}
                    onChange={(e) => handleSpecChange('targetMarginPercent', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-center font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-bold text-slate-600">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results / Outputs Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Output Card 1: Physical Bag Specs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
              Physical Bag Metrics
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 block">Weight per Bag</span>
                  <span className="text-lg font-bold text-slate-800">{calculation.gramsPerBag} g</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Weight per 1,000 Bags</span>
                  <span className="text-lg font-bold text-indigo-700">{calculation.weightPer1000Kg} Kg</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-xs text-indigo-900 block font-medium">Total Order Weight</span>
                  <span className="text-xl font-extrabold text-indigo-950">{calculation.totalWeightKg} Kg</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-indigo-900 block font-medium">Bags Yield per Kg</span>
                  <span className="text-xl font-extrabold text-indigo-950">
                    {calculation.gramsPerBag > 0 ? Math.round(1000 / calculation.gramsPerBag) : 0} pcs/kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Output Card 2: Cost & Recommended Quotation */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md">
            <h3 className="text-base font-bold text-white mb-4 pb-2 border-b border-slate-700 flex items-center justify-between">
              <span>Quotation & Pricing</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {specs.targetMarginPercent}% Margin Included
              </span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-300">Net Production Cost / Kg</span>
                <span className="text-sm font-semibold text-slate-200">₹{calculation.costPerKg}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-300">Net Production Cost / 1,000 Bags</span>
                <span className="text-sm font-semibold text-slate-200">₹{calculation.costPer1000}</span>
              </div>

              {/* Selling Rates Highlight */}
              <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-xs mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-indigo-200 font-bold block">
                      Recommended Rate / Kg
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₹{calculation.sellingPricePerKg}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-indigo-200 font-bold block">
                      Rate / 1,000 Bags
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₹{calculation.sellingPricePer1000}
                    </span>
                  </div>
                </div>
                <div className="text-right pt-2 border-t border-white/10 text-xs text-slate-300">
                  Approx <span className="font-bold text-white">₹{calculation.sellingPricePerBag}</span> per single bag
                </div>
              </div>

              {/* Estimated Total Deal Value */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-300">Total Order Value:</span>
                <span className="text-lg font-bold text-white">
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

