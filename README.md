# PolyPack - Poly Bag Billing & GST Packaging Suite

A lightweight, front-end only React application designed for **poly bag manufacturing, trading, and retail billing**.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Lucide Icons**. All data is automatically stored in your browser via `localStorage` with offline JSON export/import backup.

---

## 📁 Clean Architecture

The project has been organized with a self-contained page structure:

```
src/
├── pages/
│   ├── InvoicesPage.jsx      # All invoice views (List, Form editor, and Printable A4 view)
│   ├── CalculatorPage.jsx    # Poly bag weight, yield, and costing engine
│   ├── CustomersPage.jsx     # Customer & client directory
│   └── SettingsPage.jsx      # Company profile & billing terms
├── components/
│   ├── Navbar.jsx            # Top navigation bar & quick bill trigger
│   └── Footer.jsx            # Shared application footer
├── utils/
│   ├── formatters.js         # Currency (INR), date, and amount-in-words
│   ├── polyBagCalc.js        # Polymer density & physical bag weight formulas
│   └── storage.js            # Safe localStorage and backup handlers
├── constants/
│   └── defaults.js           # Bag types, materials, units, and initial data
├── App.jsx                   # Application root shell
├── index.css                 # Tailwind CSS & print styles
└── main.jsx                  # React entry point
```

---

## 🌟 Key Features

1. **Self-Contained Pages**:
   - `InvoicesPage.jsx`: Contains the invoice dashboard metrics, list table, search, status filter, creation form with flexible line items, and the compact A4 print layout.
   - `CalculatorPage.jsx`: Complete engineering tool for poly bag weight (grams/bag), yield (bags/kg), and profit margins.
   - `CustomersPage.jsx`: Save repeat buyers with phone & address for 1-click billing.
   - `SettingsPage.jsx`: Update your shop/company name, address, and phone number.

2. **Simple & Flexible Product Billing**:
   - Type any generic product name (`"Poly Bags"`, `"Plastic Covers"`, `"Packaging Rolls"`).
   - Select unit: `Pcs`, `Kg`, `Packets`, `Rolls`, `Bags`, `Bundles`, `Boxes`.
   - Optional toggle for technical bag specs (Width $\times$ Length, Micron, Gauge) whenever needed.

3. **Compact, Print-Ready A4 Invoice**:
   - Clean, lightweight 1-page layout without bank clutter or large blank fields.
   - Bank details and UPI QR code removed.
   - Fits on a single page with `window.print()` or Save as PDF.

---

## 🚀 Running the App

```powershell
# Start local dev server
npm run dev
```

Visit the local URL (usually `http://localhost:5173`).
