// Default constants and presets for Poly Bag Billing System

export const BAG_TYPES = [
  { id: 'plain', name: 'Plain Poly Bag (Flat)', desc: 'Standard flat bag open at top' },
  { id: 'side-gusset', name: 'Side Gusset Bag', desc: 'Expandable sides for bulk volume' },
  { id: 'bottom-gusset', name: 'Bottom Gusset Bag', desc: 'Stands upright or packs bulky items' },
  { id: 'd-cut', name: 'D-Cut Carry Bag', desc: 'Punched D-handle for retail shopping' },
  { id: 'w-cut', name: 'W-Cut / Loop Handle Bag', desc: 'Vest-type carry bag with handles' },
  { id: 'courier', name: 'Courier / Mailing Bag', desc: 'Self-adhesive tape with POD jacket' },
  { id: 'ziplock', name: 'Zip-Lock / Slider Pouch', desc: 'Reclosable airtight zipper' },
  { id: 'bopp-tape', name: 'BOPP Self-Adhesive Bag', desc: 'Crystal clear with resealable peel strip' },
  { id: 'garbage-roll', name: 'Garbage Bag on Roll', desc: 'Perforated star-sealed waste liner' },
  { id: 'shrink-roll', name: 'Shrink Film / Tubing Roll', desc: 'Continuous roll for wrapping' }
];

export const MATERIALS = [
  { id: 'LDPE', name: 'LDPE (Low Density Polyethylene)', density: 0.92, label: 'LDPE', desc: 'Soft, flexible, glossy, puncture-resistant' },
  { id: 'HM-HDPE', name: 'HM-HDPE (High Molecular HDPE)', density: 0.95, label: 'HM-HDPE', desc: 'Crinkly, high tensile strength, grocery bags' },
  { id: 'PP', name: 'PP (Polypropylene)', density: 0.90, label: 'PP', desc: 'Clear, crisp, good barrier properties' },
  { id: 'BOPP', name: 'BOPP (Biaxially Oriented PP)', density: 0.91, label: 'BOPP', desc: 'Ultra-clear, stiff, premium apparel packaging' },
  { id: 'BIO', name: 'Biodegradable / Compostable', density: 1.25, label: 'Bio PLA/PBAT', desc: 'Eco-friendly certified compostable polymer' }
];

export const COMMON_SIZES = [
  { label: '6" × 8"', width: 6, length: 8, gusset: 0, desc: 'Small Hardware / Accessories' },
  { label: '8" × 10"', width: 8, length: 10, gusset: 0, desc: 'Stationery / Small Garments' },
  { label: '10" × 12"', width: 10, length: 12, gusset: 0, desc: 'T-Shirts / Documents' },
  { label: '10" × 14"', width: 10, length: 14, gusset: 0, desc: 'Courier / Standard Shirts' },
  { label: '12" × 16"', width: 12, length: 16, gusset: 0, desc: 'Medium Apparel / Retail' },
  { label: '14" × 18"', width: 14, length: 18, gusset: 2, desc: 'D-Cut Shopping / Shoebox' },
  { label: '16" × 20"', width: 16, length: 20, gusset: 3, desc: 'Large Carry Bag / Blankets' },
  { label: '24" × 32"', width: 24, length: 32, gusset: 4, desc: 'Garbage / Industrial Liners' }
];

export const MICRON_PRESETS = [
  { micron: 25, gauge: 100, label: '25 Micron (100 Gauge) - Lightweight' },
  { micron: 40, gauge: 160, label: '40 Micron (160 Gauge) - Medium' },
  { micron: 50, gauge: 200, label: '50 Micron (200 Gauge) - Standard Legal' },
  { micron: 75, gauge: 300, label: '75 Micron (300 Gauge) - Heavy Duty' },
  { micron: 100, gauge: 400, label: '100 Micron (400 Gauge) - Extra Heavy' },
  { micron: 125, gauge: 500, label: '125 Micron (500 Gauge) - Industrial' }
];

export const DEFAULT_COMPANY = {
  name: 'APEX POLY PACK INDUSTRIES',
  tagline: 'Manufacturers of Quality Polyethylene Bags, Rolls & Liners',
  address: 'Plot No. 42-B, Industrial Area, Phase II',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400093',
  phone: '+91 98200 12345 / 022-28345678',
  email: 'sales@apexpolypack.example.com',
  website: 'www.apexpolypack.example.com',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  bankName: 'State Bank of India',
  accountName: 'Apex Poly Pack Industries',
  accountNumber: '384920194857',
  ifscCode: 'SBIN0004210',
  branch: 'Industrial Estate Branch',
  upiId: 'apexpoly@sbi',
  termsAndConditions: `1. Payment strictly due as per agreed credit terms.
2. 18% per annum interest will be charged on overdue bills.
3. Standard manufacturing tolerance of ±5% in weight, gauge, and quantity accepted in industry.
4. Goods once dispatched are at buyer's risk. Subject to local jurisdiction only.
5. Cylinder/stereo block charges are one-time and non-refundable.`,
  authorizedSignatory: 'For APEX POLY PACK INDUSTRIES'
};

export const DEFAULT_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Metro Garments & Apparel Ltd.',
    contactPerson: 'Mr. Rajesh Verma',
    phone: '+91 98111 22334',
    email: 'purchase@metrogarments.com',
    billingAddress: 'Unit 5, Fashion Hub, Textile Park, Surat, Gujarat - 395002',
    shippingAddress: 'Unit 5, Fashion Hub, Textile Park, Surat, Gujarat - 395002',
    gstin: '24AABCM8921K1ZZ',
    state: 'Gujarat',
    stateCode: '24'
  },
  {
    id: 'cust-2',
    name: 'Blue Star Logistics & E-Commerce',
    contactPerson: 'Ms. Priya Shah',
    phone: '+91 98222 33445',
    email: 'ops@bluestarlogistics.com',
    billingAddress: 'Warehouse No. 12, Bhiwandi Road, Thane, Maharashtra - 421302',
    shippingAddress: 'Warehouse No. 12, Bhiwandi Road, Thane, Maharashtra - 421302',
    gstin: '27AABCB1122D1ZP',
    state: 'Maharashtra',
    stateCode: '27'
  },
  {
    id: 'cust-3',
    name: 'Green Grocers Supermarket Chain',
    contactPerson: 'Mr. Amit Joshi',
    phone: '+91 98333 44556',
    email: 'procurement@greengrocers.in',
    billingAddress: 'Plot 88, APMC Market, Vashi, Navi Mumbai - 400703',
    shippingAddress: 'Plot 88, APMC Market, Vashi, Navi Mumbai - 400703',
    gstin: '27AADCG9988H1ZT',
    state: 'Maharashtra',
    stateCode: '27'
  }
];

export const INITIAL_SAMPLE_INVOICE = {
  id: 'INV-2026-0042',
  invoiceNumber: 'PB/26-27/0042',
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  poNumber: 'PO-MG-8891',
  poDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
  transportMode: 'Road (Tempo MH-04-AB-1234)',
  eWayBillNo: '241908234812',
  supplyType: 'interstate', // interstate (IGST) or intrastate (CGST+SGST)
  paymentTerms: '15 Days Credit',
  paymentStatus: 'pending', // paid, partial, pending
  paidAmount: 0,
  
  customer: {
    name: 'Metro Garments & Apparel Ltd.',
    contactPerson: 'Mr. Rajesh Verma',
    phone: '+91 98111 22334',
    email: 'purchase@metrogarments.com',
    billingAddress: 'Unit 5, Fashion Hub, Textile Park, Surat, Gujarat - 395002',
    shippingAddress: 'Unit 5, Fashion Hub, Textile Park, Surat, Gujarat - 395002',
    gstin: '24AABCM8921K1ZZ',
    state: 'Gujarat',
    stateCode: '24'
  },

  items: [
    {
      id: 'item-1',
      description: 'LDPE Clear Garment Bag with Lip & Punch Hole',
      bagType: 'plain',
      material: 'LDPE',
      width: 10,
      length: 14,
      gusset: 0,
      flap: 1.5,
      micron: 50,
      gauge: 200,
      color: 'Clear Natural',
      printing: '1 Color 1 Side ("Metro Garments")',
      hsnCode: '39232100',
      billingMode: 'kg', // 'kg', 'pcs', '1000pcs'
      quantity: 250, // 250 Kg
      calculatedPcs: 30500, // Approximate pieces
      rate: 185.00, // Rs 185 per kg
      gstRate: 18,
      notes: 'Bundles of 100 pcs each, packed in master corrugated box'
    },
    {
      id: 'item-2',
      description: 'BOPP Self-Adhesive Apparel Pouch with Resealable Strip',
      bagType: 'bopp-tape',
      material: 'BOPP',
      width: 9,
      length: 12,
      gusset: 0,
      flap: 1.5,
      micron: 35,
      gauge: 140,
      color: 'Ultra Clear Crystal',
      printing: 'Plain Unprinted',
      hsnCode: '39232990',
      billingMode: '1000pcs', // Billed per 1000 pcs
      quantity: 20000, // 20,000 pcs
      calculatedWeightKg: 101.4, // Approx 101.4 kg
      rate: 820.00, // Rs 820 per 1000 pcs
      gstRate: 18,
      notes: 'High clarity with anti-static release tape'
    },
    {
      id: 'item-3',
      description: 'HM-HDPE D-Cut Retail Carry Bag (Printed)',
      bagType: 'd-cut',
      material: 'HM-HDPE',
      width: 14,
      length: 18,
      gusset: 3,
      flap: 0,
      micron: 45,
      gauge: 180,
      color: 'Milky White',
      printing: '2 Color Both Sides',
      hsnCode: '39232100',
      billingMode: 'kg',
      quantity: 150, // 150 Kg
      calculatedPcs: 11200,
      rate: 195.00, // Rs 195 per kg
      gstRate: 18,
      notes: 'Reinforced handle punch'
    }
  ],

  // Extra charges
  cylinderCharge: 3500, // One-time cylinder/block making charge
  freightCharge: 1200, // Transport / delivery charge
  packagingCharge: 400, // Corrugated carton & strapping
  discountPercent: 0,
  discountAmount: 0,
  notes: 'Thank you for your business. Please ensure timely payment as per agreed schedule.'
};

