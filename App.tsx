import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';

import { Layout } from './components/Layout';
import { Uploader } from './components/Uploader';
import { Processing } from './components/Processing';
import { ResultView } from './components/ResultView';
import { VendorUploader } from './components/VendorUploader';
import { VendorResultView } from './components/VendorResultView';
import { Settings } from './components/Settings';

import {
  AppStep,
  ExtractionResult,
  FileData,
  AIConfig,
  AIProvider,
  PROVIDER_MODELS
} from './types';

import { VendorFileData, VendorExtractionResult } from './vendorTypes';

import { extractText } from './services/aiService';
import { extractVendorInfo } from './services/vendorAiService';
import Sales from './components/Sales';
import FinanceForm from './components/FinanceForm';

const STORAGE_KEY = 'lenstext_config_v2';

const AppContent: React.FC = () => {
  // ---------------- CLAIM FLOW STATE ----------------
  const [claimStep, setClaimStep] = useState<AppStep>(AppStep.UPLOAD);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  // ---------------- VENDOR FLOW STATE ----------------
  const [vendorStep, setVendorStep] = useState<AppStep>(AppStep.UPLOAD);
  const [vendorFile, setVendorFile] = useState<VendorFileData | null>(null);
  const [vendorResult, setVendorResult] = useState<VendorExtractionResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ---------------- AI CONFIG ----------------
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      provider: AIProvider.GEMINI,
      modelId: PROVIDER_MODELS[AIProvider.GEMINI][0].id,
      keys: {}
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aiConfig));
  }, [aiConfig]);

  // ---------------- CLAIM HANDLER ----------------
  const handleFileSelected = async (data: FileData) => {
    setSelectedFile(data);
    setClaimStep(AppStep.PROCESSING);
    setError(null);

    try {
      const extractedResult = await extractText(data, aiConfig);

      setResult({
        ...extractedResult,
        claimData: {
          ...extractedResult.claimData,
          discountModels: extractedResult.claimData.discountModels || [],
          monthlySchemes: extractedResult.claimData.monthlySchemes || []
        }
      });

      setClaimStep(AppStep.RESULT);
    } catch (err: any) {
      setError(err.message);
      setClaimStep(AppStep.ERROR);
    }
  };

  // ---------------- VENDOR HANDLER ----------------
  const handleVendorSelect = async (fileData: VendorFileData) => {
    setVendorFile(fileData);
    setVendorStep(AppStep.PROCESSING_VENDOR);
    setError(null);

    try {
      const extractedVendor = await extractVendorInfo(fileData, aiConfig);
      setVendorResult(extractedVendor);
      setVendorStep(AppStep.VENDOR_RESULT);
    } catch (err: any) {
      setError(err.message);
      setVendorStep(AppStep.ERROR);
    }
  };

  // ---------------- RESET FUNCTIONS ----------------
  const resetClaim = () => {
    setSelectedFile(null);
    setResult(null);
    setClaimStep(AppStep.UPLOAD);
  };

  const resetVendor = () => {
    setVendorFile(null);
    setVendorResult(null);
    setVendorStep(AppStep.UPLOAD);
  };

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        
        {/* Private routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Navigate to="/claim" replace />
          </PrivateRoute>
        } />
        
        <Route path="/claim" element={
          <PrivateRoute>
            <Layout config={aiConfig} onOpenSettings={() => setIsSettingsOpen(true)}>
              {isSettingsOpen && (
                <Settings
                  config={aiConfig}
                  onConfigChange={setAiConfig}
                  onClose={() => setIsSettingsOpen(false)}
                />
              )}
              
              {claimStep === AppStep.UPLOAD && (
                <Uploader onImageSelected={handleFileSelected} />
              )}

              {claimStep === AppStep.PROCESSING && <Processing />}

              {claimStep === AppStep.RESULT && result && selectedFile && (
                <ResultView result={result} file={selectedFile} onReset={resetClaim} />
              )}

              {claimStep === AppStep.ERROR && (
                <div>
                  <p>{error}</p>
                  <button onClick={resetClaim}>Retry</button>
                </div>
              )}
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/sales" element={
          <PrivateRoute>
            <Layout config={aiConfig} onOpenSettings={() => setIsSettingsOpen(true)}>
              <Sales />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/finance" element={
          <PrivateRoute>
            <Layout config={aiConfig} onOpenSettings={() => setIsSettingsOpen(true)}>
              <FinanceForm />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/purchase-order" element={
          <PrivateRoute>
            <Layout config={aiConfig} onOpenSettings={() => setIsSettingsOpen(true)}>
              {vendorStep === AppStep.UPLOAD && (
                <VendorUploader onVendorSelected={handleVendorSelect} />
              )}

              {vendorStep === AppStep.PROCESSING_VENDOR && <Processing />}

              {vendorStep === AppStep.VENDOR_RESULT &&
                vendorResult &&
                vendorFile && (
                  <VendorResultView
                    result={vendorResult}
                    file={vendorFile}
                    onReset={resetVendor}
                  />
                )}

              {vendorStep === AppStep.ERROR && (
                <div>
                  <p>{error}</p>
                  <button onClick={resetVendor}>Retry</button>
                </div>
              )}
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;