
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Uploader } from './components/Uploader';
import { Processing } from './components/Processing';
import { ResultView } from './components/ResultView';
import { Settings } from './components/Settings';
import { AppStep, ExtractionResult, FileData, AIConfig, AIProvider, PROVIDER_MODELS } from './types';
import { extractText } from './services/aiService';

const STORAGE_KEY = 'lenstext_config_v2';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved config", e);
      }
    }
    return {
      provider: AIProvider.GEMINI,
      modelId: PROVIDER_MODELS[AIProvider.GEMINI][0].id,
      keys: {}
    };
  });

  // Persist config changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aiConfig));
  }, [aiConfig]);

  // const handleFileSelected = async (data: FileData) => {
  //   setSelectedFile(data);
  //   setStep(AppStep.PROCESSING);
  //   setError(null);

  //   try {
  //     const extractedResult = await extractText(data, aiConfig);
  //     setResult(extractedResult);
  //     setStep(AppStep.RESULT);
  //   } catch (err: any) {
  //     console.error("Extraction error:", err);
  //     setError(err.message || 'An unexpected error occurred during document analysis.');
  //     setStep(AppStep.ERROR);
  //   }
  // };

  // In the handleFileSelected function, after getting extracted result:
  const handleFileSelected = async (data: FileData) => {
    setSelectedFile(data);
    setStep(AppStep.PROCESSING);
    setError(null);

    try {
      const extractedResult = await extractText(data, aiConfig);

      // Initialize calculations if not present in AI response
      const enhancedResult = {
        ...extractedResult,
        claimData: {
          ...extractedResult.claimData,
          discountModels: extractedResult.claimData.discountModels || [],
          monthlySchemes: extractedResult.claimData.monthlySchemes || [],
          calculations: extractedResult.claimData.calculations || undefined
        }
      };

      setResult(enhancedResult);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(err.message || 'An unexpected error occurred during document analysis.');
      setStep(AppStep.ERROR);
    }
  };


  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setStep(AppStep.UPLOAD);
  };

  return (
    <Layout config={aiConfig} onOpenSettings={() => setIsSettingsOpen(true)}>
      {isSettingsOpen && (
        <Settings
          config={aiConfig}
          onConfigChange={setAiConfig}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {step === AppStep.UPLOAD && (
        <Uploader onImageSelected={handleFileSelected} />
      )}

      {step === AppStep.PROCESSING && (
        <Processing />
      )}

      {step === AppStep.RESULT && result && selectedFile && (
        <ResultView
          result={result}
          file={selectedFile}
          onReset={handleReset}
        />
      )}

      {step === AppStep.ERROR && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-500 mb-8 max-w-md text-center text-sm font-medium">
            {error}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Check API Keys
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
