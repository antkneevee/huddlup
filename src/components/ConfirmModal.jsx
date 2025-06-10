import React from 'react';

const ConfirmModal = ({ title, message, confirmText = 'OK', onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white text-black rounded p-4 w-full max-w-sm">
      {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
      <p>{message}</p>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-300">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white">
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
