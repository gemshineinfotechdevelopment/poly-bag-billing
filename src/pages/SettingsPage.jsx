import React, { useState, useEffect } from 'react';
import { Building2, Save, Check, RotateCcw, Database, CheckCircle2, AlertCircle, RefreshCw, UploadCloud, Server, ExternalLink } from 'lucide-react';
import { DEFAULT_COMPANY } from '../constants/defaults';
import { getBackendStatus, connectAtlasUriApi, seedLocalDataToAtlas } from '../utils/api';
import { getSavedInvoices, getProductsList, getPurchasesList, getCustomersList, getCompanyProfile } from '../utils/storage';

export default function SettingsPage({ company, onSaveCompany, onSyncLocalToAtlas }) {
  const [formData, setFormData] = useState(company || DEFAULT_COMPANY);
  const [savedAlert, setSavedAlert] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [mongoUri, setMongoUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Check database status on mount
  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    const status = await getBackendStatus();
    setDbStatus(status);
  };

  const handleConnectAtlas = async (e) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;

    setIsConnecting(true);
    setConnectMessage(null);
    const result = await connectAtlasUriApi(mongoUri.trim());
    setIsConnecting(false);

    if (result.success) {
      setConnectMessage({ type: 'success', text: result.message });
      setMongoUri('');
      checkDatabase();
    } else {
      setConnectMessage({ type: 'error', text: result.message || 'Connection failed. Please verify credentials and IP access.' });
    }
  };

  const handleSyncAllToAtlas = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const payload = {
      invoices: getSavedInvoices(),
      products: getProductsList(),
      purchases: getPurchasesList(),
      customers: getCustomersList(),
      company: getCompanyProfile()
    };

    const res = await seedLocalDataToAtlas(payload);
    setIsSyncing(false);
    if (res.success) {
      setSyncMessage({
        type: 'success',
        text: `Uploaded ${res.counts?.invoices || 0} invoices, ${res.counts?.products || 0} products, ${res.counts?.purchases || 0} purchases & ${res.counts?.customers || 0} customers to MongoDB Atlas!`
      });
      checkDatabase();
    } else {
      setSyncMessage({ type: 'error', text: res.error || 'Failed to upload local data.' });
    }
  };

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
    if (confirm('Reset to initial defaults?')) {
      setFormData(DEFAULT_COMPANY);
      onSaveCompany(DEFAULT_COMPANY);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/30">
              Configuration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-2 mb-1.5 tracking-tight text-white">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Company profile, contact info, tax settings & print layout
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-3.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            type="submit"
            form="companyForm"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            {savedAlert ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MongoDB Atlas Database Integration Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                MongoDB Atlas Database
              </h3>
              <p className="text-[11px] text-slate-500">
                Cloud persistence for all invoices, products, purchases & customers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={checkDatabase}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Refresh database status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Badge */}
        <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          dbStatus?.connected
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            {dbStatus?.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {dbStatus?.connected ? 'Connected to MongoDB Atlas' : 'Local Storage Mode (Atlas Disconnected)'}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {dbStatus?.connected
                  ? `Active Database: "${dbStatus.databaseName || 'polypack'}" in cloud`
                  : 'Data is safely stored locally in your browser. Connect Atlas to store online.'}
              </p>
            </div>
          </div>

          {dbStatus?.connected && dbStatus.counts && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 text-emerald-800">
                {dbStatus.counts.invoices || 0} Bills
              </span>
              <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 text-emerald-800">
                {dbStatus.counts.products || 0} Products
              </span>
              <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 text-emerald-800">
                {dbStatus.counts.customers || 0} Clients
              </span>
            </div>
          )}
        </div>

        {/* Connect URI Input Form */}
        <form onSubmit={handleConnectAtlas} className="space-y-2.5 pt-1">
          <label className="block text-[11px] font-bold text-slate-700">
            MongoDB Atlas Connection String (URI)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              placeholder="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/polypack?retryWrites=true&w=majority"
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isConnecting || !mongoUri.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              {isConnecting ? 'Connecting...' : 'Connect Atlas'}
            </button>
          </div>

          <p className="text-[10px] text-slate-400">
            Tip: You can find this in MongoDB Cloud Console → Clusters → Connect → Connect your application (Drivers: Node.js).
          </p>

          {connectMessage && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${
              connectMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              {connectMessage.text}
            </div>
          )}
        </form>

        {/* Sync Local Storage Data to Atlas */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Migrate Local Data to Atlas</span>
            <span className="text-[11px] text-slate-500">Upload your existing bills, products, and customer records to MongoDB Atlas</span>
          </div>

          <button
            type="button"
            onClick={handleSyncAllToAtlas}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {isSyncing ? 'Uploading...' : 'Sync Data to Atlas'}
          </button>
        </div>

        {syncMessage && (
          <div className={`p-2.5 rounded-lg text-xs font-medium ${
            syncMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {syncMessage.text}
          </div>
        )}
      </div>

      <form id="companyForm" onSubmit={handleSubmit} className="space-y-4">
        {/* Business Info */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" /> Company Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Shop Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold text-indigo-950 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tagline (Optional)</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="e.g. Packaging Bags & Plastic Covers"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Shop / Office Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">State & Pincode</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="Pincode"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone / Mobile</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={formData.gstin || ''}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                placeholder="Leave blank if not GST registered"
                className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Invoice Footer Details */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            Bill Footer Note & Signatory
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Authorized Signatory Label</label>
            <input
              type="text"
              value={formData.authorizedSignatory || ''}
              onChange={(e) => handleChange('authorizedSignatory', e.target.value)}
              placeholder="Authorized Signatory"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Remarks / Terms on Bill
            </label>
            <textarea
              rows={2}
              value={formData.termsAndConditions || ''}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              placeholder="e.g. Thank you for your business!"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

