import React, { useState } from 'react';

export const THICKNESS_MULTIPLIER = 0.75;


const PrintOptionsModal = ({ onClose, onPrint }) => {
  const [type, setType] = useState('wristband');
  const [layout, setLayout] = useState('4');
  const [width, setWidth] = useState('4');
  const [height, setHeight] = useState('2');
  const [playsPerPage, setPlaysPerPage] = useState('12');
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeNumber, setIncludeNumber] = useState(true);

  const handleSubmit = () => {
    if (onPrint) {
      onPrint({
        type,
        layout: parseInt(layout, 10),
        width: parseFloat(width),
        height: parseFloat(height),
        playsPerPage: parseInt(playsPerPage, 10),
        includeTitle,
        includeNumber,
        thicknessMultiplier: THICKNESS_MULTIPLIER,
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print();
        });
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded p-4 w-96">
        <h2 className="text-lg font-bold mb-2">Print Options</h2>
        <div className="mb-2">
          <label className="mr-2">
            <input
              type="radio"
              value="wristband"
              checked={type === 'wristband'}
              onChange={() => setType('wristband')}
            />{' '}
            Wristbands
          </label>
          <label className="ml-4">
            <input
              type="radio"
              value="playsheet"
              checked={type === 'playsheet'}
              onChange={() => setType('playsheet')}
            />{' '}
            Play Sheets
          </label>
          <label className="ml-4">
            <input
              type="radio"
              value="playbook"
              checked={type === 'playbook'}
              onChange={() => setType('playbook')}
            />{' '}
            Playbook
          </label>
        </div>
        {type === 'wristband' && (
          <>
            <div className="mb-2">
              <label className="block mb-1">Layout</label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
                className="w-full p-1 rounded border"
              >
                <option value="4">4 plays</option>
                <option value="6">6 plays</option>
                <option value="8">8 plays</option>
              </select>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block mb-1">Width</label>
                <select
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full p-1 rounded border"
                >
                  <option value="4">4"</option>
                  <option value="4.25">4.25"</option>
                  <option value="4.5">4.5"</option>
                  <option value="4.75">4.75"</option>
                  <option value="5">5"</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Height</label>
                <select
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-1 rounded border"
                >
                  <option value="2">2"</option>
                  <option value="2.25">2.25"</option>
                  <option value="2.5">2.5"</option>
                  <option value="2.75">2.75"</option>
                  <option value="3">3"</option>
                </select>
              </div>
            </div>
          </>
        )}

        {type === 'playsheet' && (
          <div className="mb-2">
            <label className="block mb-1">Plays Per Page</label>
            <select
              value={playsPerPage}
              onChange={(e) => setPlaysPerPage(e.target.value)}
              className="w-full p-1 rounded border"
            >
              <option value="12">12</option>
              <option value="18">18</option>
              <option value="24">24</option>
            </select>
          </div>
        )}

        {type === 'playbook' && (
          <p className="mb-2 text-sm">
            Each play will be printed on its own page with coaching notes.
          </p>
        )}
        <div className="mb-2 flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeTitle}
              onChange={() => setIncludeTitle(!includeTitle)}
              className="mr-1"
            />
            Include Title
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeNumber}
              onChange={() => setIncludeNumber(!includeNumber)}
              className="mr-1"
            />
            Include Number
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-3 py-1 rounded bg-blue-600 text-white">
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintOptionsModal;
