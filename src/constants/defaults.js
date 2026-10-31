// Default constants and presets for Poly Bag Billing System

export const BAG_TYPES = [
  { id: 'plain', name: 'Plain Flat Poly Bag', desc: 'Standard open flat bag' },
  { id: 'side-gusset', name: 'Side Gusset Bag', desc: 'Expandable sides for bulk volume' },
  { id: 'bottom-gusset', name: 'Bottom Gusset Bag', desc: 'Stands upright or bulky items' },
  { id: 'd-cut', name: 'D-Cut Carry Bag', desc: 'Punched handle shopping bag' },
  { id: 'w-cut', name: 'W-Cut / Grocery Bag', desc: 'Vest-style carry bag' },
  { id: 'courier', name: 'Courier / Mailing Bag', desc: 'Self-adhesive tamper bag' },
  { id: 'ziplock', name: 'Zip-Lock Pouch', desc: 'Reclosable zipper bag' },
  { id: 'bopp-tape', name: 'BOPP Self-Adhesive Bag', desc: 'Crystal clear peel & seal' },
  { id: 'garbage-roll', name: 'Garbage Bag Roll', desc: 'Waste liner roll' },
  { id: 'roll', name: 'Poly Film / Tubing Roll', desc: 'Continuous packing roll' }
];

export const MATERIALS = [
  { id: 'LDPE', name: 'LDPE (Low Density Polyethylene)', density: 0.92, label: 'LDPE', desc: 'Soft, flexible, glossy' },
  { id: 'HM-HDPE', name: 'HM-HDPE (High Molecular HDPE)', density: 0.95, label: 'HM-HDPE', desc: 'Crinkly, high strength' },
  { id: 'PP', name: 'PP (Polypropylene)', density: 0.90, label: 'PP', desc: 'Crisp, clear packaging' },
  { id: 'BOPP', name: 'BOPP (Biaxially Oriented PP)', density: 0.91, label: 'BOPP', desc: 'Ultra-clear garment bags' },
  { id: 'BIO', name: 'Biodegradable / Compostable', density: 1.25, label: 'Bio Compostable', desc: 'Eco-friendly certified' }
];

export const UNITS = [
  { id: 'pcs', label: 'Pieces (Pcs)' },
  { id: 'kg', label: 'Kilograms (Kg)' },
  { id: '1000pcs', label: 'Per 1,000 Pcs' },
  { id: 'packets', label: 'Packets (Pkt)' },
  { id: 'rolls', label: 'Rolls' },
  { id: 'bundles', label: 'Bundles' },
  { id: 'boxes', label: 'Boxes' }
];

export const COMMON_SIZES = [
  { label: '6" × 8"', width: 6, length: 8, gusset: 0, desc: 'Small Items / Hardware' },
  { label: '8" × 10"', width: 8, length: 10, gusset: 0, desc: 'Small Garments / Food' },
  { label: '10" × 12"', width: 10, length: 12, gusset: 0, desc: 'T-Shirts / Standard' },
  { label: '10" × 14"', width: 10, length: 14, gusset: 0, desc: 'Shirts / Documents' },
  { label: '12" × 16"', width: 12, length: 16, gusset: 0, desc: 'Medium Apparel' },
  { label: '14" × 18"', width: 14, length: 18, gusset: 2, desc: 'Shopping Bags' },
  { label: '16" × 20"', width: 16, length: 20, gusset: 3, desc: 'Large Carry Bags' },
  { label: '24" × 32"', width: 24, length: 32, gusset: 4, desc: 'Liners / Garbage' }
];

export const MICRON_PRESETS = [
  { micron: 25, gauge: 100, label: '25 Micron (100 Gauge)' },
  { micron: 40, gauge: 160, label: '40 Micron (160 Gauge)' },
  { micron: 50, gauge: 200, label: '50 Micron (200 Gauge)' },
  { micron: 75, gauge: 300, label: '75 Micron (300 Gauge)' },
  { micron: 100, gauge: 400, label: '100 Micron (400 Gauge)' }
];

export const DEFAULT_COMPANY = {
  name: 'POLY PACK ENTERPRISES',
  tagline: 'Packaging Bags & Plastic Covers',
  address: 'Shop No. 12, Market Road, Industrial Area',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  phone: '+91 98200 12345',
  email: 'polypack@example.com',
  gstin: '', // Optional
  pan: '',
  termsAndConditions: '1. Goods once sold will not be taken back.\n2. Payment due within agreed terms.',
  authorizedSignatory: 'Authorized Signatory'
};

export const DEFAULT_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Sharma General Stores',
    contactPerson: 'Mr. Sharma',
    phone: '+91 98111 22334',
    email: '',
    billingAddress: 'Main Market, Station Road, Mumbai - 400002',
    gstin: '',
    state: 'Maharashtra',
    stateCode: '27'
  },
  {
    id: 'cust-2',
    name: 'Metro Garments',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98222 33445',
    email: '',
    billingAddress: 'Shop 4, Textile Market, Surat, Gujarat - 395002',
    gstin: '24AABCM8921K1ZZ',
    state: 'Gujarat',
    stateCode: '24'
  }
];

export const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Transparent Poly Bags (Standard Packing)',
    category: 'Flat Poly Bag',
    unit: 'kg',
    sellingPrice: 180,
    costPrice: 140,
    currentStock: 120, // 120 Kg in stock
    minStockAlert: 20,
    hsnCode: '39232100',
    notes: 'Standard 50 micron clear LDPE bags'
  },
  {
    id: 'prod-2',
    name: 'White Plastic Carry Bags (D-Cut)',
    category: 'Carry Bag',
    unit: 'packets',
    sellingPrice: 120,
    costPrice: 90,
    currentStock: 45, // 45 packets
    minStockAlert: 10,
    hsnCode: '39232100',
    notes: 'Pack of 100 pcs per packet'
  },
  {
    id: 'prod-3',
    name: 'Black Garbage Liner Roll',
    category: 'Garbage Roll',
    unit: 'rolls',
    sellingPrice: 95,
    costPrice: 70,
    currentStock: 8, // 8 rolls (Low Stock)
    minStockAlert: 15,
    hsnCode: '39232990',
    notes: 'Medium size, 30 bags per roll'
  }
];

export const INITIAL_SAMPLE_INVOICE = {
  id: 'INV-1001',
  invoiceNumber: 'INV-1001',
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  poNumber: '',
  poDate: '',
  transportMode: '',
  eWayBillNo: '',
  supplyType: 'intrastate',
  paymentTerms: 'Immediate',
  paymentStatus: 'pending',
  paidAmount: 0,
  
  customer: {
    name: 'Sharma General Stores',
    contactPerson: 'Mr. Sharma',
    phone: '+91 98111 22334',
    email: '',
    billingAddress: 'Main Market, Station Road, Mumbai - 400002',
    gstin: '',
    state: 'Maharashtra',
    stateCode: '27'
  },

  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      description: 'Transparent Poly Bags (Standard Packing)',
      unit: 'kg',
      quantity: 50,
      rate: 180,
      gstRate: 0,
      hasAdvancedSpecs: false,
      notes: ''
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      description: 'White Plastic Carry Bags (D-Cut)',
      unit: 'packets',
      quantity: 20,
      rate: 120,
      gstRate: 0,
      hasAdvancedSpecs: false,
      notes: ''
    }
  ],

  cylinderCharge: 0,
  freightCharge: 0,
  packagingCharge: 0,
  discountPercent: 0,
  discountAmount: 0,
  notes: 'Thank you for your business!'
};

export const DEFAULT_PURCHASES = [
  {
    id: 'PUR-101',
    purchaseNumber: 'PUR-101',
    date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    vendorName: 'Apex Polymers & Packaging Ltd',
    vendorBillNo: 'V-8942',
    productId: 'prod-1',
    productName: 'Transparent Poly Bags (Standard Packing)',
    unit: 'kg',
    quantity: 150,
    unitCost: 140,
    totalAmount: 21000,
    paymentStatus: 'paid',
    notes: 'Virgin LDPE raw bags stock inward'
  },
  {
    id: 'PUR-102',
    purchaseNumber: 'PUR-102',
    date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    vendorName: 'Shree Krishna Bag Mills',
    vendorBillNo: 'SK-331',
    productId: 'prod-2',
    productName: 'White Plastic Carry Bags (D-Cut)',
    unit: 'packets',
    quantity: 80,
    unitCost: 85,
    totalAmount: 6800,
    paymentStatus: 'paid',
    notes: 'Ready D-cut grocery bags batch'
  }
];
