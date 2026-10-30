import { MATERIALS } from '../constants/defaults';

/**
 * Returns density (g/cm³) for a given material identifier
 */
export function getMaterialDensity(materialId = 'LDPE') {
  const found = MATERIALS.find(m => m.id === materialId || m.label === materialId);
  return found ? found.density : 0.92;
}

/**
 * Convert Micron to Gauge (1 Micron = 4 Gauge)
 */
export function micronToGauge(micron) {
  const m = parseFloat(micron) || 0;
  return Math.round(m * 4);
}

/**
 * Convert Gauge to Micron (4 Gauge = 1 Micron)
 */
export function gaugeToMicron(gauge) {
  const g = parseFloat(gauge) || 0;
  return Math.round((g / 4) * 10) / 10;
}

/**
 * Calculate the theoretical weight of a single poly bag in grams
 * 
 * Dimensions in inches, micron in µm
 * Formulas:
 * Effective Area (2 sides) = 2 * (Width + Gusset) * (Length + Flap/2) in square inches
 * 1 sq inch = 6.4516 sq cm
 * Thickness in cm = Micron * 0.0001 cm
 * Volume (cm³) = Area (sq cm) * Thickness (cm)
 * Weight (g) = Volume (cm³) * Density (g/cm³)
 */
export function calculateBagWeightGrams({
  width = 10,
  length = 14,
  gusset = 0,
  flap = 0,
  micron = 50,
  material = 'LDPE'
}) {
  const w = parseFloat(width) || 0;
  const l = parseFloat(length) || 0;
  const g = parseFloat(gusset) || 0;
  const f = parseFloat(flap) || 0;
  const m = parseFloat(micron) || 0;
  const density = getMaterialDensity(material);

  if (w <= 0 || l <= 0 || m <= 0) return 0;

  // Effective dimensions for 2-ply tubular bag with optional gusset and flap
  // Side gusset adds to perimeter, flap is single-layer extension
  const effectiveWidthInches = w + g;
  const effectiveLengthInches = l + (f / 2);

  // Area in square cm for 2 layers
  const areaSqInches2Sides = 2 * effectiveWidthInches * effectiveLengthInches;
  const areaSqCm = areaSqInches2Sides * 6.4516;

  // Thickness in cm (1 micron = 0.0001 cm)
  const thicknessCm = m * 0.0001;

  // Volume in cm3
  const volumeCm3 = areaSqCm * thicknessCm;

  // Weight in grams
  const weightGrams = volumeCm3 * density;

  return Math.round(weightGrams * 100) / 100;
}

/**
 * Calculate weight of 1,000 bags in Kilograms (Kg)
 * (Note: grams per single bag numerically equals kilograms per 1000 bags!)
 */
export function calculateWeightPer1000BagsKg(specs) {
  const gramsPerBag = calculateBagWeightGrams(specs);
  return Math.round(gramsPerBag * 100) / 100;
}

/**
 * Given total quantity of bags (pieces), calculate total weight in Kg
 */
export function calculateTotalKgFromBags(pieces, specs) {
  const pcs = parseFloat(pieces) || 0;
  const gramsPerBag = calculateBagWeightGrams(specs);
  const totalKg = (pcs * gramsPerBag) / 1000;
  return Math.round(totalKg * 10) / 10;
}

/**
 * Given total weight in Kg, calculate approximate number of bags (pieces)
 */
export function calculateBagsFromTotalKg(totalKg, specs) {
  const kg = parseFloat(totalKg) || 0;
  const gramsPerBag = calculateBagWeightGrams(specs);
  if (gramsPerBag <= 0) return 0;
  const totalPcs = (kg * 1000) / gramsPerBag;
  return Math.round(totalPcs);
}

/**
 * Advanced Cost Estimator for Poly Bag Manufacturing
 * Returns manufacturing breakdown and recommended rates
 */
export function estimatePolyBagCost({
  width = 10,
  length = 14,
  gusset = 0,
  flap = 0,
  micron = 50,
  material = 'LDPE',
  quantityBags = 10000,
  rawMaterialRatePerKg = 120, // Granule / Virgin polymer rate
  masterbatchRatePerKg = 10,  // Color / additive cost
  conversionCostPerKg = 25,   // Extrusion, cutting, sealing electricity & labor
  printingCostPerKg = 15,     // Ink & printing cost per kg
  wastagePercent = 4,         // Trimming/punch waste %
  targetMarginPercent = 15    // Target profit margin %
}) {
  const gramsPerBag = calculateBagWeightGrams({ width, length, gusset, flap, micron, material });
  const totalWeightKg = (quantityBags * gramsPerBag) / 1000;
  const effectiveKgWithWaste = totalWeightKg * (1 + wastagePercent / 100);

  // Total production cost per kg
  const costPerKg = (
    parseFloat(rawMaterialRatePerKg || 0) +
    parseFloat(masterbatchRatePerKg || 0) +
    parseFloat(conversionCostPerKg || 0) +
    parseFloat(printingCostPerKg || 0)
  );

  const totalRawCost = effectiveKgWithWaste * costPerKg;
  const netCostPerKg = totalWeightKg > 0 ? totalRawCost / totalWeightKg : 0;
  const netCostPerBag = quantityBags > 0 ? totalRawCost / quantityBags : 0;
  const netCostPer1000 = netCostPerBag * 1000;

  // Selling prices with margin
  const marginMultiplier = 1 + (targetMarginPercent / 100);
  const sellingPricePerKg = Math.round(netCostPerKg * marginMultiplier * 100) / 100;
  const sellingPricePerBag = Math.round(netCostPerBag * marginMultiplier * 1000) / 1000;
  const sellingPricePer1000 = Math.round(netCostPer1000 * marginMultiplier * 100) / 100;

  return {
    gramsPerBag,
    weightPer1000Kg: gramsPerBag,
    totalWeightKg: Math.round(totalWeightKg * 10) / 10,
    costPerKg: Math.round(netCostPerKg * 100) / 100,
    costPerBag: Math.round(netCostPerBag * 1000) / 1000,
    costPer1000: Math.round(netCostPer1000 * 100) / 100,
    sellingPricePerKg,
    sellingPricePerBag,
    sellingPricePer1000,
    totalEstimatedRevenue: Math.round(sellingPricePerKg * totalWeightKg)
  };
}

