import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Search, Phone, MapPin, Users } from 'lucide-react';

export default function CustomersPage({
  customers = [],
  onSaveCustomer,
  onDeleteCustomer,
  onSelectCustomerForNewInvoice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const initialEmpty = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    billingAddress: '',
    gstin: ''
  };

  const [formData, setFormData] = useState(initialEmpty);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData(initialEmpty);
    setEditingCustomer(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (customer) => {
    setFormData(customer);
    setEditingCustomer(customer);
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    onSaveCustomer({
      ...formData,
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`
    });

    setIsEditing(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-7 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Buyer Directory
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {customers.length} registered buyers
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-2 mb-1.5 tracking-tight text-white">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Save frequent buyers & clients to autofill billing and GST information
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Customers Cards or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-base font-bold text-slate-700">No customers found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No registered buyers match your search query.'
              : 'Add your first customer to autofill billing and GST info easily on new bills!'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Customer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map(cust => (
            <div
              key={cust.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{cust.name}</h3>
                  {cust.gstin && (
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold shrink-0">
                      {cust.gstin}
                    </span>
                  )}
                </div>

                {cust.contactPerson && (
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">Attn: {cust.contactPerson}</p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {cust.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.phone}</span>
                    </div>
                  )}
                  {cust.billingAddress && (
                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-slate-100 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-500 line-clamp-2">{cust.billingAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {onSelectCustomerForNewInvoice && (
                  <button
                    type="button"
                    onClick={() => onSelectCustomerForNewInvoice(cust)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Create Bill →
                  </button>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCustomer(cust.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-fadeIn max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-3.5 pb-2.5 border-b border-slate-100">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer / Shop Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sharma General Stores"
                  className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Mr. Sharma"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="GSTIN"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Address</label>
                <textarea
                  rows={2}
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  placeholder="Address, Market, City"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

