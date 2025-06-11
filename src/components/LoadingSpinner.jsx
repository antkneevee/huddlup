import React from 'react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
  </div>
);

export default LoadingSpinner;
