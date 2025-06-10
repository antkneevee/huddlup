import React, { useState } from 'react';
import { PlusCircle, RotateCcw, Download, Share as ShareIcon, Save, FilePlus } from 'lucide-react';

const Toolbar = ({
  onNewPlay,
  onUndo,
  onExport,
  onShare,
  onSave,
  onSaveAs,
  playName,
  playTags,
  onPlayNameChange,
  onPlayTagsChange,
}) => {
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
    <div className="flex flex-wrap gap-2 items-center">
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
      {onSave && (
        <button
          className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
          onClick={onSave}
        >
          <Save className="w-4 h-4 mr-1" /> Save
        </button>
      )}
      {onSaveAs && (
        <button
          className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
          onClick={onSaveAs}
        >
          <FilePlus className="w-4 h-4 mr-1" /> Save As
        </button>
      )}

      <input
        type="text"
        value={playName}
        onChange={(e) => onPlayNameChange(e.target.value)}
        placeholder="Play Name"
        className="p-1 rounded bg-gray-700 text-white"
      />
      <input
        type="text"
        value={playTags}
        onChange={(e) => onPlayTagsChange(e.target.value)}
        placeholder="Tags"
        className="p-1 rounded bg-gray-700 text-white"
      />
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
