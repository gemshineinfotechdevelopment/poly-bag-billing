import React, { useState } from 'react';
import {
  Package, PlusCircle, Search, Edit2, Trash2, AlertTriangle,
  CheckCircle, Plus, X, ArrowUpRight
} from 'lucide-react';
import { UNITS } from '../constants/defaults';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function ProductsPage({
  products = [],
  onSaveProduct,
  onDeleteProduct,
  onAdjustStock,
  onSelectProductForNewInvoice,
  autoOpenAdd = false,
  autoRestockProduct = null,
  onResetAutoOpen,
  onCancelToPrevious
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'in-stock', 'low-stock', 'out-of-stock'
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Quick Restock State
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  React.useEffect(() => {
    if (autoOpenAdd) {
      setFormData(initialEmptyProduct);
      setEditingProduct(null);
      setIsEditing(true);
      if (onResetAutoOpen) onResetAutoOpen();
    } else if (autoRestockProduct) {
      setRestockProduct(autoRestockProduct);
      setRestockQty('');
      if (onResetAutoOpen) onResetAutoOpen();
    }
  }, [autoOpenAdd, autoRestockProduct]);

  const handleCloseModal = () => {
    setIsEditing(false);
    setEditingProduct(null);
    if (onCancelToPrevious) onCancelToPrevious();
  };

  const handleCloseRestockModal = () => {
    setRestockProduct(null);
    setRestockQty('');
    if (onCancelToPrevious) onCancelToPrevious();
  };


  const initialEmptyProduct = {
    name: '',
    category: 'Flat Poly Bag',
    unit: 'kg',
    sellingPrice: '',
    costPrice: '',
    currentStock: '',
    minStockAlert: 10,
    hsnCode: '39232100',
    notes: ''
  };

  const [formData, setFormData] = useState(initialEmptyProduct);

  // Metrics Calculations
  let totalStockValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach(p => {
    const stock = parseFloat(p.currentStock) || 0;
    const price = parseFloat(p.sellingPrice) || 0;
    const minAlert = parseFloat(p.minStockAlert) || 10;
    totalStockValue += stock * price;

    if (stock <= 0) {
      outOfStockCount++;
    } else if (stock <= minAlert) {
      lowStockCount++;
    }
  });

  // Filter products
  const filtered = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.notes || '').toLowerCase().includes(q)
    );

    if (!matchSearch) return false;

    const stock = parseFloat(p.currentStock) || 0;
    const minAlert = parseFloat(p.minStockAlert) || 10;

    if (filterStatus === 'in-stock') return stock > minAlert;
    if (filterStatus === 'low-stock') return stock > 0 && stock <= minAlert;
    if (filterStatus === 'out-of-stock') return stock <= 0;
    return true;
  });

  const handleOpenAdd = () => {
    setFormData(initialEmptyProduct);
    setEditingProduct(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (product) => {
    setFormData(product);
    setEditingProduct(product);
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    onSaveProduct({
      ...formData,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      currentStock: parseFloat(formData.currentStock) || 0,
      minStockAlert: parseFloat(formData.minStockAlert) || 10,
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`
    });

    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleQuickRestockSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(restockQty);
    if (!isNaN(qty) && qty > 0 && restockProduct) {
      onAdjustStock(restockProduct.id, qty);
      setRestockProduct(null);
      setRestockQty('');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-7 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Inventory Catalog
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {products.length} products
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-2 mb-1.5 tracking-tight text-white">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage packaging products, live stock levels, and quick restock
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products or category..."
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs sm:text-sm">
          {[
            { id: 'all', label: 'All' },
            { id: 'in-stock', label: 'In Stock' },
            { id: 'low-stock', label: `Low (${lowStockCount})` },
            { id: 'out-of-stock', label: `Out (${outOfStockCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No products found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search query or filter.'
              : 'Add your first product to track stock and autofill in bills!'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" /> Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map(p => {
            const stock = parseFloat(p.currentStock) || 0;
            const minAlert = parseFloat(p.minStockAlert) || 10;
            const isOutOfStock = stock <= 0;
            const isLowStock = !isOutOfStock && stock <= minAlert;

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {p.category || 'General'}
                    </span>

                    {/* Stock Status Pill */}
                    {isOutOfStock ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-red-100 text-red-700">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> In Stock
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h3>
                  {p.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.notes}</p>
                  )}

                  {/* Stock & Price Box */}
                  <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Available Stock</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-lg font-black ${
                          isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-700' : 'text-slate-900'
                        }`}>
                          {formatNumber(stock, p.unit === 'kg' ? 1 : 0)}
                        </span>
                        <span className="text-xs font-bold text-slate-600 uppercase">{p.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Selling Rate</span>
                      <div className="text-base font-black text-indigo-700 mt-0.5">
                        {formatCurrency(p.sellingPrice)}
                        <span className="text-xs text-slate-500 font-semibold">/{p.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Quick Restock Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setRestockProduct(p);
                        setRestockQty('');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Quick add incoming stock"
                    >
                      <Plus className="w-3.5 h-3.5" /> Restock
                    </button>

                    {/* Quick Create Bill */}
                    {onSelectProductForNewInvoice && (
                      <button
                        type="button"
                        onClick={() => onSelectProductForNewInvoice(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Create a new invoice with this product"
                      >
                        Bill Now <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add / Edit Product Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-fadeIn max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Transparent Poly Bags 10x14"
                  className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Category / Type</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Flat Poly Bag">Flat Poly Bag</option>
                    <option value="Carry Bag">Carry Bag (D-Cut/W-Cut)</option>
                    <option value="Garbage Roll">Garbage Roll</option>
                    <option value="Zip-Lock Pouch">Zip-Lock Pouch</option>
                    <option value="Packaging Roll">Packaging Film / Roll</option>
                    <option value="Courier Bag">Courier Bag</option>
                    <option value="Custom Packaging">Custom Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Billing Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    {UNITS.map(u => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Selling Rate (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="180"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Cost Price (₹) (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="140"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Current Stock Quantity ({formData.unit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Low Stock Alert Level</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description / Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 50 micron clear LDPE bags"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs cursor-pointer"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Quick Restock Popup */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-fadeIn max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-900">Add Stock / Restock</h4>
              <button
                onClick={handleCloseRestockModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-bold text-slate-900">{restockProduct.name}</p>
            <p className="text-xs text-slate-500 mb-3 mt-0.5">
              Current stock: <strong>{restockProduct.currentStock} {restockProduct.unit}</strong>
            </p>

            <form onSubmit={handleQuickRestockSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Incoming Quantity ({restockProduct.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  min="0.1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder={`e.g. +50`}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseRestockModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  + Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

