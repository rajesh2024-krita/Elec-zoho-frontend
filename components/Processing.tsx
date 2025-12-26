
import React from 'react';

export const Processing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your image...</h2>
      <p className="text-gray-500 max-w-sm text-center">
        Our AI is scanning every detail to extract the text accurately. This usually takes 2-4 seconds.
      </p>
    </div>
  );
};
