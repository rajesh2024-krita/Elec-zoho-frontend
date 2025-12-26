
import React, { useState } from 'react';
import { AIProvider, AIConfig, PROVIDER_MODELS, AIKeys } from '../types';

interface SettingsProps {
  config: AIConfig;
  onConfigChange: (config: AIConfig) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onConfigChange, onClose }) => {
  const [localKeys, setLocalKeys] = useState<AIKeys>(config.keys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyChange = (provider: keyof AIKeys, value: string) => {
    const updatedKeys = { ...localKeys, [provider]: value };
    setLocalKeys(updatedKeys);
    onConfigChange({ ...config, keys: updatedKeys });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-8 py-6 border-b flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Configuration</h3>
            <p className="text-xs text-gray-500 mt-1">Configure your preferred models and keys</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* Provider Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">AI Provider</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(AIProvider).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const firstModel = PROVIDER_MODELS[p][0];
                    onConfigChange({ ...config, provider: p, modelId: firstModel.id });
                  }}
                  className={`py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                    config.provider === p 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100' 
                      : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Available Models</label>
            <div className="grid grid-cols-1 gap-2">
              {PROVIDER_MODELS[config.provider].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onConfigChange({ ...config, modelId: m.id })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    config.modelId === m.id 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <span className={`text-sm font-bold block ${config.modelId === m.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {m.name}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-mono">{m.id}</span>
                  </div>
                  {config.modelId === m.id && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* API Keys Manual Entry */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">API Authentication</label>
            
            <div className="space-y-4">
              {/* Gemini Key Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-gray-700">Gemini Key</span>
                  <button onClick={() => toggleKeyVisibility('gemini')} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">
                    {showKeys['gemini'] ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input 
                  type={showKeys['gemini'] ? 'text' : 'password'}
                  value={localKeys.GEMINI || ''}
                  onChange={(e) => handleKeyChange('GEMINI', e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {!localKeys.GEMINI && (
                  <p className="text-[10px] text-gray-400 px-1">If empty, will use system managed key if available.</p>
                )}
              </div>

              {/* OpenAI Key Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-gray-700">OpenAI Key</span>
                  <button onClick={() => toggleKeyVisibility('openai')} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">
                    {showKeys['openai'] ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input 
                  type={showKeys['openai'] ? 'text' : 'password'}
                  value={localKeys.OPENAI || ''}
                  onChange={(e) => handleKeyChange('OPENAI', e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Groq Key Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-gray-700">Groq Key</span>
                  <button onClick={() => toggleKeyVisibility('groq')} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">
                    {showKeys['groq'] ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input 
                  type={showKeys['groq'] ? 'text' : 'password'}
                  value={localKeys.GROQ || ''}
                  onChange={(e) => handleKeyChange('GROQ', e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
