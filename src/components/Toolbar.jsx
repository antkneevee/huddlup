import React, { useState } from 'react';
import { PlusCircle, RotateCcw, Download, Share as ShareIcon } from 'lucide-react';

const Toolbar = ({ onNewPlay, onUndo, onExport, onShare }) => {
  const [aspect, setAspect] = useState('1.333');

  const handleExportClick = () => {
    if (onExport) {
      onExport(parseFloat(aspect));
    }
  };


  const handleShareClick = () => {
    if (onShare) {
      onShare(parseFloat(aspect));
    }
  };


  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
        onClick={onNewPlay}
      >
        <PlusCircle className="w-4 h-4 mr-1" /> New Play
      </button>
      <button
        className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
        onClick={onUndo}
      >
        <RotateCcw className="w-4 h-4 mr-1" /> Undo
      </button>
      <div className="flex items-center gap-2">
        <select
          value={aspect}
          onChange={(e) => setAspect(e.target.value)}
          className="bg-gray-700 text-white p-1 rounded"
        >
          <option value="2">2.25 x 1.125</option>
          <option value="1.333">1.5 x 1.125</option>
          <option value="1">1.125 x 1.125</option>
        </select>
        <button
          className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
          onClick={handleExportClick}
        >
          <Download className="w-4 h-4 mr-1" /> Export
        </button>
      </div>
      <button
        className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"

        onClick={handleShareClick}

      >
        <ShareIcon className="w-4 h-4 mr-1" /> Share
      </button>
    </div>
  );
};

export default Toolbar;
