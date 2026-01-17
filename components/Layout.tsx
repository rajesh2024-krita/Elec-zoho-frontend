import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { AIConfig, PROVIDER_MODELS } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  config: AIConfig;
  onOpenSettings: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, config, onOpenSettings }) => {
  const currentModelName =
    PROVIDER_MODELS[config.provider].find(m => m.id === config.modelId)?.name ||
    config.modelId;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO + TITLE */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Defence Electronics AI Module
            </h1>
          </div>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link to="/claim" className="hover:text-blue-600">Claim</Link>
            <Link to="/vendor" className="hover:text-blue-600">Vendor</Link>
            <Link to="/sales" className="hover:text-blue-600">Sales</Link>
            <Link to="/finance" className="hover:text-blue-600">Finance</Link>

            {/* Model Name */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Powered by
              </span>
              <span className="text-sm font-semibold text-blue-600 leading-tight">
                {currentModelName}
              </span>
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-blue-600 border border-transparent hover:border-gray-200"
            >
              ⚙️
            </button>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t shadow-sm">
            <div className="flex flex-col p-4 gap-4 text-sm font-semibold">

              <Link
                to="/claim"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600"
              >
                Claim
              </Link>

              <Link
                to="/vendor"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600"
              >
                Vendor
              </Link>

              <Link
                to="/sales"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600"
              >
                Sales
              </Link>
              
              <Link
                to="/finance"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-600"
              >
                Finance
              </Link>

              {/* Powered By */}
              <div className="border-t pt-3 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Powered by</span>
                <span className="text-sm font-semibold text-blue-600">{currentModelName}</span>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-gray-600">⚙️ Settings</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
          <span>© 2026 Defence Electronics AI Module.</span>
          {/* <div className="flex gap-4">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span>
          </div> */}
        </div>
      </footer>
    </div>
  );
};
