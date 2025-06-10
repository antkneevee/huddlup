import React from 'react';

const AlertModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white text-black rounded p-4 w-full max-w-sm">
      <p>{message}</p>
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="px-3 py-1 rounded bg-blue-600 text-white">
          OK
        </button>
      </div>
    </div>
  </div>
);

export default AlertModal;
