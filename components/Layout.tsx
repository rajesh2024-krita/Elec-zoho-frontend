import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { AIConfig, PROVIDER_MODELS } from '../types';
import LogoutButton from './LogoutButton';
import { useAuth } from '../contexts/AuthContext';

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
  // Inside your Layout component, add logout button in header/nav:
  const auth = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-[60]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO + TITLE */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Defence Electronics AI Module
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link to="/claim" className="hover:text-blue-600">Claim</Link>
            <Link to="/purchase-order" className="hover:text-blue-600">Purchase Order</Link>
            <Link to="/sales" className="hover:text-blue-600">Sales</Link>
            <Link to="/finance" className="hover:text-blue-600">Finance</Link>


            {/* <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Powered by
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {currentModelName}
              </span>
            </div>

            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              ⚙️
            </button> */}

            {auth.isAuthenticated && <LogoutButton />}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[50] md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* OFFCANVAS MENU */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-[55] transform
      transition-transform duration-300 md:hidden
      ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 text-gray-700 font-medium">
          <Link to="/claim" onClick={() => setMenuOpen(false)}
            className="hover:text-blue-600">Claim</Link>

          <Link to="/purchase-order" onClick={() => setMenuOpen(false)}
            className="hover:text-blue-600">Purchase Order</Link>

          <Link to="/sales" onClick={() => setMenuOpen(false)}
            className="hover:text-blue-600">Sales</Link>

          <Link to="/finance" onClick={() => setMenuOpen(false)}
            className="hover:text-blue-600">Finance</Link>

          {auth.isAuthenticated && (
            <div className="pt-4 border-t">
              <LogoutButton />
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
          <span>© 2026 Defence Electronics AI Module.</span>
        </div>
      </footer>
    </div>
  );

};
