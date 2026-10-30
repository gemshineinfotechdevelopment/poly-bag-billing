import React from 'react';
import { Package, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center">
            <Package className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-700">PolyPack Billing</span>
          <span>•</span>
          <span>Packaging & Poly Bag Invoicing</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Front-End Only • 100% Offline Local Storage</span>
        </div>
      </div>
    </footer>
  );
}

