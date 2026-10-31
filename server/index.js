import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend-specific .env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // Fallback to root .env if present

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==========================================
// MONGODB SCHEMAS & MODELS
// ==========================================

// 1. Invoice Schema
const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  invoiceNumber: { type: String, required: true, index: true },
  date: { type: String, required: true },
  dueDate: { type: String },
  poNumber: { type: String, default: '' },
  transportMode: { type: String, default: '' },
  paymentTerms: { type: String, default: 'Immediate' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'pending' },
  paidAmount: { type: Number, default: 0 },
  customer: {
    name: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    billingAddress: { type: String, default: '' },
    gstin: { type: String, default: '' }
  },
  items: [
    {
      id: { type: String },
      productId: { type: String },
      description: { type: String },
      bagType: { type: String },
      material: { type: String },
      width: { type: Number },
      length: { type: Number },
      gusset: { type: Number },
      flap: { type: Number },
      micron: { type: Number },
      gauge: { type: Number },
      quantity: { type: Number, default: 1 },
      unit: { type: String, default: 'kg' },
      billingMode: { type: String },
      rate: { type: Number, default: 0 },
      gstRate: { type: Number, default: 0 },
      hasAdvancedSpecs: { type: Boolean, default: false }
    }
  ],
  freightCharge: { type: Number, default: 0 },
  cylinderCharge: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

// 2. Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'LDPE' },
  material: { type: String, default: 'LDPE' },
  bagType: { type: String, default: 'plain' },
  unit: { type: String, default: 'kg' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  minStockAlert: { type: Number, default: 10 }
}, { timestamps: true });

// 3. Purchase Schema
const purchaseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  purchaseNumber: { type: String, required: true },
  purchaseDate: { type: String, required: true },
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, default: '' },
  supplierGstin: { type: String, default: '' },
  productId: { type: String },
  productName: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  unitCost: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'paid' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// 4. Customer Schema
const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactPerson: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  billingAddress: { type: String, default: '' },
  gstin: { type: String, default: '' }
}, { timestamps: true });

// 5. Company Profile Schema
const companySchema = new mongoose.Schema({
  id: { type: String, default: 'primary', unique: true },
  name: { type: String, default: 'POLY PACK ENTERPRISES' },
  tagline: { type: String, default: 'High Quality Polythene & Packaging Bags' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  defaultGstRate: { type: Number, default: 0 },
  defaultPaymentTerms: { type: String, default: 'Immediate' },
  termsAndConditions: { type: String, default: '' },
  footerNote: { type: String, default: '' }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
const Product = mongoose.model('Product', productSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Company = mongoose.model('Company', companySchema);

// ==========================================
// DATABASE CONNECTION
// ==========================================
const isDbConnected = () => mongoose.connection.readyState === 1;

async function connectToMongo() {
  if (!MONGODB_URI || MONGODB_URI.includes('<username>') || MONGODB_URI.includes('<password>')) {
    console.log('⚠️  MongoDB URI not configured or contains placeholders. Running in local fallback mode.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected successfully to MongoDB Atlas database!');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
  }
}

connectToMongo();

// ==========================================
// API ROUTES
// ==========================================

// Health & Status Check
app.get('/api/status', async (req, res) => {
  const state = mongoose.connection.readyState;
  const connected = state === 1;

  let counts = { invoices: 0, products: 0, purchases: 0, customers: 0 };
  if (connected) {
    try {
      counts = {
        invoices: await Invoice.countDocuments(),
        products: await Product.countDocuments(),
        purchases: await Purchase.countDocuments(),
        customers: await Customer.countDocuments()
      };
    } catch (_) {}
  }

  res.json({
    connected,
    status: connected ? 'Connected to MongoDB Atlas' : (MONGODB_URI ? 'Connecting or Auth Error' : 'URI Not Configured'),
    databaseName: mongoose.connection.name || 'polypack',
    counts,
    hasUriConfigured: Boolean(MONGODB_URI && !MONGODB_URI.includes('<username>'))
  });
});

// Update MongoDB URI on the fly from Settings
app.post('/api/config/uri', async (req, res) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({ success: false, message: 'URI is required' });
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    res.json({ success: true, message: 'Successfully connected to MongoDB Atlas!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Connection failed: ' + err.message });
  }
});

// ---------------- INVOICES ----------------
app.get('/api/invoices', async (req, res) => {
  try {
    if (!isDbConnected()) return res.json([]);
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const invData = req.body;
    if (!invData.id) invData.id = `INV-${Date.now()}`;

    const updated = await Invoice.findOneAndUpdate(
      { id: invData.id },
      invData,
      { new: true, upsert: true }
    );

    // Auto-adjust product stock on billing
    if (Array.isArray(invData.items)) {
      for (const item of invData.items) {
        if (item.productId && item.quantity) {
          const delta = -(parseFloat(item.quantity) || 0);
          await Product.findOneAndUpdate(
            { id: item.productId },
            { $inc: { currentStock: delta } }
          );
        }
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await Invoice.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- PRODUCTS ----------------
app.get('/api/products', async (req, res) => {
  try {
    if (!isDbConnected()) return res.json([]);
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const prodData = req.body;
    if (!prodData.id) prodData.id = `prod-${Date.now()}`;

    const updated = await Product.findOneAndUpdate(
      { id: prodData.id },
      prodData,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const delta = parseFloat(req.body.delta) || 0;
    const prod = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { currentStock: delta } },
      { new: true }
    );
    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- PURCHASES ----------------
app.get('/api/purchases', async (req, res) => {
  try {
    if (!isDbConnected()) return res.json([]);
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  try {
    const purData = req.body;
    const isNew = !(await Purchase.exists({ id: purData.id }));
    if (!purData.id) purData.id = `PUR-${Date.now()}`;

    const updated = await Purchase.findOneAndUpdate(
      { id: purData.id },
      purData,
      { new: true, upsert: true }
    );

    // If new purchase, auto-replenish product stock in MongoDB
    if (isNew && purData.productId && purData.quantity) {
      const qty = parseFloat(purData.quantity) || 0;
      if (qty > 0) {
        await Product.findOneAndUpdate(
          { id: purData.productId },
          { $inc: { currentStock: qty } }
        );
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/purchases/:id', async (req, res) => {
  try {
    await Purchase.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CUSTOMERS ----------------
app.get('/api/customers', async (req, res) => {
  try {
    if (!isDbConnected()) return res.json([]);
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const custData = req.body;
    if (!custData.id) custData.id = `cust-${Date.now()}`;

    const updated = await Customer.findOneAndUpdate(
      { id: custData.id },
      custData,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await Customer.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- COMPANY SETTINGS ----------------
app.get('/api/settings', async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(null);
    const company = await Company.findOne({ id: 'primary' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const data = req.body;
    data.id = 'primary';
    const updated = await Company.findOneAndUpdate(
      { id: 'primary' },
      data,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SEED / MIGRATION ROUTE ----------------
app.post('/api/seed', async (req, res) => {
  try {
    const { invoices, products, purchases, customers, company } = req.body;
    let counts = { invoices: 0, products: 0, purchases: 0, customers: 0 };

    if (Array.isArray(products) && products.length > 0) {
      for (const p of products) {
        await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true });
        counts.products++;
      }
    }

    if (Array.isArray(invoices) && invoices.length > 0) {
      for (const inv of invoices) {
        await Invoice.findOneAndUpdate({ id: inv.id }, inv, { upsert: true });
        counts.invoices++;
      }
    }

    if (Array.isArray(purchases) && purchases.length > 0) {
      for (const pur of purchases) {
        await Purchase.findOneAndUpdate({ id: pur.id }, pur, { upsert: true });
        counts.purchases++;
      }
    }

    if (Array.isArray(customers) && customers.length > 0) {
      for (const c of customers) {
        await Customer.findOneAndUpdate({ id: c.id }, c, { upsert: true });
        counts.customers++;
      }
    }

    if (company && typeof company === 'object') {
      await Company.findOneAndUpdate({ id: 'primary' }, { ...company, id: 'primary' }, { upsert: true });
    }

    res.json({
      success: true,
      message: 'Successfully migrated data to MongoDB Atlas!',
      counts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PolyPack Billing API Server running on http://localhost:${PORT}`);
});

