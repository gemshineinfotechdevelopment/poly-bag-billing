import React, { useState, useEffect } from 'react';
import { Building2, Save, Check, RotateCcw, Pencil, X, Lock, Unlock, FileText } from 'lucide-react';
import { DEFAULT_COMPANY } from '../constants/defaults';

export default function SettingsPage({ company, onSaveCompany }) {
  const [formData, setFormData] = useState(company || DEFAULT_COMPANY);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  // Sync form data if external company prop changes (e.g. initial load from MongoDB Atlas)
  useEffect(() => {
    if (company) {
      setFormData(company);
    }
  }, [company]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(company || DEFAULT_COMPANY);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveCompany(formData);
    setSavedAlert(true);
    setIsEditing(false);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset to initial defaults?')) {
      setFormData(DEFAULT_COMPANY);
      onSaveCompany(DEFAULT_COMPANY);
      setIsEditing(false);
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
    }
  };

  const inputClass = (isName = false) => `w-full px-3 py-2 text-xs rounded-xl border transition-colors ${
    isName ? 'font-bold text-indigo-950' : 'text-slate-800'
  } ${
    isEditing
      ? 'bg-white border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs'
      : 'bg-slate-50/90 border-slate-200 text-slate-700 cursor-not-allowed select-text'
  }`;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-7 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/30">
              Configuration
            </span>
            {isEditing ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Unlock className="w-3 h-3" /> Edit Mode Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-2 mb-1.5 tracking-tight text-white">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Company profile, contact info, tax settings & print layout
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {savedAlert && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}

          {!isEditing ? (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Changes
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>

              <button
                type="submit"
                form="companyForm"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Status Notice Banner */}
      {!isEditing ? (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-600">
              <Lock className="w-4 h-4" />
            </div>
            <span>
              Settings are locked in <strong>read-only mode</strong>. Click <strong>Edit Changes</strong> to update company or bill information.
            </span>
          </div>
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Changes
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center text-amber-800">
              <Unlock className="w-4 h-4" />
            </div>
            <span>
              <strong>Editing Mode:</strong> You can now modify the fields below. Don't forget to click <strong>Save Settings</strong> when done.
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-100/70 border border-amber-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 2. Company Profile & Billing Form */}
      <form id="companyForm" onSubmit={handleSubmit} className="space-y-5">
        {/* Business Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> Company Details
            </h3>
            {!isEditing && (
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Shop Name *</label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Company Name"
                className={inputClass(true)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tagline (Optional)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="e.g. Poly Bag Manufacturers & Flexible Packaging"
                className={inputClass()}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Shop / Factory Address</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Street address / Unit number"
                className={inputClass()}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                className={inputClass()}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">State & Pincode</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                  className={inputClass()}
                />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="Pincode"
                  className={inputClass()}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone / Mobile</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Contact number"
                className={inputClass()}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                className={inputClass()}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.gstin || ''}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                placeholder={isEditing ? "Leave blank if not GST registered" : "Not registered"}
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl border transition-colors ${
                  isEditing
                    ? 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs'
                    : 'bg-slate-50/90 border-slate-200 text-slate-700 cursor-not-allowed select-text'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Invoice Footer Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Bill Footer Note & Signatory
            </h3>
            {!isEditing && (
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Authorized Signatory Label</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.authorizedSignatory || ''}
              onChange={(e) => handleChange('authorizedSignatory', e.target.value)}
              placeholder="Authorized Signatory"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Remarks / Terms on Bill
            </label>
            <textarea
              rows={2}
              disabled={!isEditing}
              value={formData.termsAndConditions || ''}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              placeholder="e.g. Goods once sold will not be taken back. Subject to local jurisdiction."
              className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors ${
                isEditing
                  ? 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs'
                  : 'bg-slate-50/90 border-slate-200 text-slate-700 cursor-not-allowed select-text'
              }`}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Pencil className="w-4 h-4" /> Edit Changes
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
