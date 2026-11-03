import React, { useState, useEffect } from 'react';
import { Package, FileText, BarChart3, Users, Settings, Menu, X, Boxes, LayoutDashboard, Truck } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  invoicesCount = 0,
  lowStockCount = 0,
  isMongoConnected = false,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = propSetIsOpen || setInternalIsOpen;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Business & profit overview',
      icon: LayoutDashboard
    },
    {
      id: 'invoices',
      label: 'Selling & Bills',
      description: 'Customer invoices & GST bills',
      icon: FileText,
      badge: invoicesCount
    },
    {
      id: 'purchases',
      label: 'Purchases',
      description: 'Vendor bills & incoming stock',
      icon: Truck
    },
    {
      id: 'products',
      label: 'Products',
      description: 'Catalog & live inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'customers',
      label: 'Customers',
      description: 'Buyer directory',
      icon: Users
    },
    {
      id: 'reports',
      label: 'Reports',
      description: 'P&L, sales & GST analytics',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Company & bill settings',
      icon: Settings
    }
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    // On small mobile screens (<768px), auto-collapse sidebar after tap
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (Allows tapping outside to dismiss drawer) */}
      {isOpen && (
        <div
          className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Top Header Bar with Hamburger Button */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-6 h-[58px] sm:h-[60px] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -ml-1 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer group"
            title={isOpen ? "Collapse side menu" : "Open side menu"}
            aria-label="Toggle side navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-105 transition-transform" />
          </button>

          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer"
            onClick={() => handleSelectTab('dashboard')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xs shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">PolyPack</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                  Billing
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* MongoDB Connection Status Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
            isMongoConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isMongoConnected ? 'Database Online' : 'Local Mode'}</span>
          </div>

          {/* Mobile current page indicator badge */}
          <div className="md:hidden flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
          </div>
        </div>
      </header>

      {/* Side Navigation Panel */}
      <aside
        className={`no-print fixed top-0 md:top-[60px] left-0 bottom-0 w-72 sm:w-64 bg-white border-r border-slate-200 z-50 md:z-30 shadow-2xl md:shadow-xs transition-transform duration-300 ease-in-out flex flex-col justify-between p-4 pt-4 sm:pt-6 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header with Close Button */}
        <div className="md:hidden flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-900">PolyPack Menu</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1">
          {/* Vertical Nav Links in Ordered Sequence */}
          <nav className="space-y-1.5 sm:space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <div>
                      <div className="leading-tight text-sm font-semibold">{item.label}</div>
                      <div
                        className={`text-xs font-normal leading-tight mt-0.5 ${
                          isActive ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.badgeColor && !isActive && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Collapse Shortcut */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-xs font-semibold text-slate-400">Navigation Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Collapse menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Thumb navigation for smartphones) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-xs mt-0.5 font-semibold">Home</span>
        </button>

        <button
          onClick={() => handleSelectTab('invoices')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'invoices' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs mt-0.5 font-semibold">Bills</span>
          {invoicesCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white leading-tight">
              {invoicesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectTab('purchases')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'purchases' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-xs mt-0.5 font-semibold">Inward</span>
        </button>

        <button
          onClick={() => handleSelectTab('products')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'products' ? 'text-indigo-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span className="text-xs mt-0.5 font-semibold">Stock</span>
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
            ['customers', 'reports', 'settings'].includes(activeTab) ? 'text-indigo-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs mt-0.5 font-semibold">More</span>
        </button>
      </nav>
    </>
  );
}
