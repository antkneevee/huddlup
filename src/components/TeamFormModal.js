import React, { useEffect, useState } from 'react';

const TeamFormModal = ({ initialData = {}, onSave, onCancel }) => {
  const [name, setName] = useState(initialData.teamName || '');
  const [logo, setLogo] = useState(initialData.teamLogoUrl || '');

  useEffect(() => {
    setName(initialData.teamName || '');
    setLogo(initialData.teamLogoUrl || '');
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ teamName: name.trim(), teamLogoUrl: logo });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-white text-black rounded p-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-2">
          {initialData.id ? 'Edit Team' : 'New Team'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team Name"
            className="p-1 rounded border"
            required
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {logo && (
            <img src={logo} alt="Logo preview" className="h-16 w-16 object-cover rounded" />
          )}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamFormModal;
