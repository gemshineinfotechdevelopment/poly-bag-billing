import React, { useState, useEffect } from 'react';
import { Package, FileText, Calculator, Users, Settings, Menu, X, ShieldCheck, Boxes, LayoutDashboard, Truck } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  invoicesCount = 0,
  lowStockCount = 0,
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
      id: 'calculator',
      label: 'Bag Calculator',
      description: 'Weight & cost estimator',
      icon: Calculator,
      highlight: true
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
  };

  return (
    <>
      {/* Top Header Bar with Hamburger Button */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -ml-1 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer group"
            title={isOpen ? "Collapse side menu" : "Open side menu"}
            aria-label="Toggle side navigation menu"
          >
            <Menu className="w-6 h-6 group-hover:scale-105 transition-transform" />
          </button>

          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => handleSelectTab('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xs shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">PolyPack</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  Billing
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation Panel (Push sidebar: side-by-side with content, never covers it!) */}
      <aside
        className={`no-print fixed top-[49px] left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30 shadow-xs transition-transform duration-300 ease-in-out flex flex-col justify-between p-4 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto pr-1 flex-1">
          {/* Vertical Nav Links in Ordered Sequence */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] font-normal leading-tight mt-0.5 ${
                          isActive ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Collapse Shortcut */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400">Navigation Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Collapse menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
