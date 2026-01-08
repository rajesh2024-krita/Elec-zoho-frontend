
import React from 'react';
import { AIConfig, PROVIDER_MODELS } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  config: AIConfig;
  onOpenSettings: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, config, onOpenSettings }) => {
  const currentModelName = PROVIDER_MODELS[config.provider].find(m => m.id === config.modelId)?.name || config.modelId;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Defence Electronics AI Module</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Powered by</span>
              <span className="text-sm font-semibold text-blue-600 leading-tight">{currentModelName}</span>
            </div>
            <button 
              onClick={onOpenSettings}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-blue-600 border border-transparent hover:border-gray-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
      <footer className="py-6 border-t bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
          <span>© 2024 LensText AI. Intelligent Multi-Model OCR.</span>
          <div className="flex gap-4">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
