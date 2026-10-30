# PolyPack - Poly Bag Billing & GST Packaging Suite

A complete, professional, front-end only React application designed specifically for **polyethylene / poly bag manufacturing, trading, and retail billing**.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Lucide Icons**. All data is automatically persisted in your browser via `localStorage` with JSON export/import backup support.

---

## 🌟 Key Features

### 1. Poly Bag Industry-Specific Line Items
- **Polymer Materials Supported**:
  - `LDPE` (Low-Density Polyethylene - Density 0.92 g/cm³)
  - `HM-HDPE` (High-Molecular HDPE - Density 0.95 g/cm³)
  - `PP` (Polypropylene - Density 0.90 g/cm³)
  - `BOPP` (Biaxially Oriented Polypropylene - Density 0.91 g/cm³)
  - `Biodegradable / Compostable` (PLA/PBAT - Density 1.25 g/cm³)
- **Bag Styles**: Flat Plain Bag, Side Gusset Bag, Bottom Gusset Bag, D-Cut Carry Bag, W-Cut/Loop Handle Bag, Courier Mailing Bag (with POD flap), Zip-Lock Pouch, BOPP Self-Adhesive Apparel Bag, Garbage Roll, Shrink Tubing.
- **Physical Specifications**: Width (in), Length (in), Gusset (in), Lip/Flap (in), Thickness in Micron (µm) and Gauge.
- **Auto-Sync Micron & Gauge**: Changing micron automatically calculates gauge ($1\text{ Micron} = 4\text{ Gauge}$) and vice-versa.
- **Real-Time Physical Bag Weight**: Shows calculated grams per bag and Kg per 1,000 bags.
- **Flexible Billing Units**:
  - **By Weight (Per Kg)**: Ideal for wholesale manufacturing. Automatically syncs approximate bag count (pieces).
  - **Per 1,000 Pieces**: Ideal for retail and printed pouches. Automatically computes approximate total material weight (Kg).
  - **Per Piece (Pc)**: For customized pouches and courier envelopes.

### 2. Built-in Poly Bag Weight & Cost Estimator
- Engineering-grade calculation engine for bag manufacturers:
  - Exact weight per piece and per 1,000 bags.
  - Yield calculation (bags per Kg).
  - Raw material formulation: Virgin Polymer (₹/kg), Color Masterbatch (₹/kg), Conversion electricity & labor (₹/kg), Printing ink (₹/kg), and punch trim wastage %.
  - Target profit margin % calculation.
  - Recommended selling price per Kg and per 1,000 bags.
  - **"Add to Active Invoice"** button to inject estimated specs directly into the bill!

### 3. GST Tax Invoice & Print Ready Layout
- Formatted strictly for standard **A4 paper** using print-specific CSS (`window.print()`).
- Compliant GST fields:
  - Buyer (Bill To) & Consignee (Ship To) with GSTIN and State Codes.
  - Interstate (IGST) vs Intra-state (CGST + SGST) toggle.
  - HSN code per item (Default `39232100` / `39232990`).
  - Cylinder / Block / Stereo making charges (for custom flexo/gravure printing).
  - Freight, delivery, and corrugated carton packaging charges.
  - Amount in words in Indian numbering format (Lakhs & Crores).
  - Bank Account details (A/C No, IFSC, Branch) and UPI payment QR code box.
  - Terms & conditions and authorized signatory stamp box.
  - Toggle copy types: *Original for Recipient*, *Duplicate for Transporter*, *Triplicate for Supplier*.

### 4. Comprehensive Dashboard & Invoicing Suite
- Metric summary cards: Total Billed, Outstanding / Pending, Material Sold (Kg & Metric Tonnes), Total Bags Dispatched.
- Invoices List: Filter by Paid / Partial / Pending status, search by customer, invoice number, or item.
- Customer Directory: Save regular buyers and auto-fill customer details in one click.
- Company Settings: Edit business name, logo tagline, address, GSTIN, PAN, bank details, and default terms.
- Offline & Front-End Only: Instant local storage, JSON backup export and restore.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run

```bash
# Navigate to project folder
cd poly-bag-billing

# Install dependencies (already pre-installed)
npm install

# Start Vite development server
npm run dev
```

Visit the local URL shown in your terminal (usually `http://localhost:5173`).

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory ready to be hosted on any static hosting provider (GitHub Pages, Vercel, Netlify, Cloudflare Pages, S3).
