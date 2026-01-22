import React, { useState } from "react";
import { AIProvider, AIConfig, PROVIDER_MODELS, AIKeys } from "../types";

interface SettingsProps {
  config: AIConfig;
  onConfigChange: (config: AIConfig) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  config,
  onConfigChange,
  onClose,
}) => {

  // Default key from .env (NOT shown in UI)
  const GEMINI_DEFAULT_KEY = import.meta.env.VITE_GEMINI_KEY || "";

  const [localKeys, setLocalKeys] = useState<AIKeys>({
    ...config.keys,
    GEMINI: config.keys.GEMINI || "", // UI field is always EMPTY initially
  });

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyChange = (provider: keyof AIKeys, value: string) => {
    let updatedKeys = { ...localKeys, [provider]: value };
    setLocalKeys(updatedKeys);

    // Auto-use default key if user leaves Gemini empty
    if (provider === "GEMINI" && value.trim() === "") {
      updatedKeys = { ...updatedKeys, GEMINI: GEMINI_DEFAULT_KEY };
    }

    onConfigChange({ ...config, keys: updatedKeys });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-8 py-6 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-xl font-bold">AI Configuration</h3>
            <p className="text-xs text-gray-500 mt-1">Configure your provider & keys</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1">

          {/* Provider Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              AI Provider
            </label>
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
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase block">
              Available Models
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PROVIDER_MODELS[config.provider].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onConfigChange({ ...config, modelId: m.id })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border ${
                    config.modelId === m.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold">{m.name}</span>
                    <span className="block text-[10px] text-gray-400">{m.id}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Keys */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase block">API Keys</label>

            {/* Gemini */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold">Gemini Key</span>
                <button
                  onClick={() => toggleKeyVisibility("gemini")}
                  className="text-[10px] font-bold text-blue-600 uppercase"
                >
                  {showKeys["gemini"] ? "Hide" : "Show"}
                </button>
              </div>

              <input
                type={showKeys["gemini"] ? "text" : "password"}
                value={localKeys.GEMINI || ""}
                onChange={(e) => handleKeyChange("GEMINI", e.target.value)}
                placeholder="Enter Gemini API key (optional)"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
              />

              {!localKeys.GEMINI && (
                <p className="text-[10px] text-gray-400 px-1">
                  If left empty, your default system API key is used.
                </p>
              )}
            </div>

            {/* OpenAI */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold">OpenAI Key</span>
                <button
                  onClick={() => toggleKeyVisibility("openai")}
                  className="text-[10px] font-bold text-blue-600 uppercase"
                >
                  {showKeys["openai"] ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showKeys["openai"] ? "text" : "password"}
                value={localKeys.OPENAI || ""}
                onChange={(e) => handleKeyChange("OPENAI", e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
                placeholder="sk-xxxx"
              />
            </div>

            {/* Groq */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold">Groq Key</span>
                <button
                  onClick={() => toggleKeyVisibility("groq")}
                  className="text-[10px] font-bold text-blue-600 uppercase"
                >
                  {showKeys["groq"] ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showKeys["groq"] ? "text" : "password"}
                value={localKeys.GROQ || ""}
                onChange={(e) => handleKeyChange("GROQ", e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
                placeholder="gsk-xxxx"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
