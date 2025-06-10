import React, { useEffect, useState } from 'react';

const TeamFormModal = ({ initialData = {}, onSave, onCancel }) => {
  const [name, setName] = useState(initialData.teamName || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData.teamLogoUrl || '');

  useEffect(() => {
    setName(initialData.teamName || '');
    setLogoPreview(initialData.teamLogoUrl || '');
    setLogoFile(null);
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setLogoFile(null);
      return;
    }
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG or JPEG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ teamName: name.trim(), logoFile });
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
          {logoPreview && (
            <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-cover rounded" />
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
