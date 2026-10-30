import React, { useState } from 'react';
import { Building2, Save, Check, RotateCcw, ShieldCheck, QrCode } from 'lucide-react';
import { DEFAULT_COMPANY } from '../constants/defaults';

export default function CompanySettings({ company, onSaveCompany }) {
  const [formData, setFormData] = useState(company || DEFAULT_COMPANY);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveCompany(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset business settings to initial defaults?')) {
      setFormData(DEFAULT_COMPANY);
      onSaveCompany(DEFAULT_COMPANY);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Business Profile & GST Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Customize company name, address, tax IDs, and bank account for invoices</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            type="submit"
            form="companyForm"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            {savedAlert ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      <form id="companyForm" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> 1. Manufacturing Business Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Factory Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-indigo-950 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Business Line</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Manufacturers of Quality Polyethylene Bags, Rolls & Liners"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Factory / Office Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State & Pincode</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="Pincode"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / Mobile</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (Tax ID)</label>
              <input
                type="text"
                value={formData.gstin || ''}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                placeholder="27AABCU9603R1ZM"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Income Tax PAN</label>
              <input
                type="text"
                value={formData.pan || ''}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                placeholder="AABCU9603R"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank & UPI Payment Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2. Bank Account Details (Printed on Invoice)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="State Bank of India"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.accountName || ''}
                onChange={(e) => handleChange('accountName', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber || ''}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="384920194857"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code & Branch</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.ifscCode || ''}
                  onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                  placeholder="SBIN0004210"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.branch || ''}
                  onChange={(e) => handleChange('branch', e.target.value)}
                  placeholder="Industrial Branch"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UPI ID (Virtual Payment Address for QR Code)
              </label>
              <input
                type="text"
                value={formData.upiId || ''}
                onChange={(e) => handleChange('upiId', e.target.value)}
                placeholder="apexpoly@sbi"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg font-bold text-indigo-700"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                A scan-to-pay QR code will be generated on invoices automatically when this is provided.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Terms & Signatory */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            3. Legal Terms & Signatory Declaration
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Signatory Label</label>
            <input
              type="text"
              value={formData.authorizedSignatory || ''}
              onChange={(e) => handleChange('authorizedSignatory', e.target.value)}
              placeholder="For APEX POLY PACK INDUSTRIES"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Standard Terms & Conditions (Shown on invoice footer)
            </label>
            <textarea
              rows={5}
              value={formData.termsAndConditions || ''}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg leading-relaxed"
            />
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Save Business Profile
          </button>
        </div>
      </form>
    </div>
  );
}

