import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTeamsContext } from '../context/TeamsContext.jsx';

const TeamPlaybooksModal = ({ team, onClose }) => {
  const { editTeam } = useTeamsContext();
  const [playbooks, setPlaybooks] = useState([]);
  const [selectedIds, setSelectedIds] = useState(team.playbooks || []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (auth.currentUser) {
        const snap = await getDocs(
          collection(db, 'users', auth.currentUser.uid, 'playbooks')
        );
        const arr = [];
        snap.forEach((d) => arr.push(d.data()));
        setPlaybooks(arr);
      } else {
        const arr = [];
        for (const key in localStorage) {
          if (key.startsWith('Playbook-')) {
            try {
              const book = JSON.parse(localStorage.getItem(key));
              arr.push(book);
            } catch {
              // ignore bad data
            }
          }
        }
        setPlaybooks(arr);
      }
    };
    fetchBooks();
  }, []);

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    await editTeam(team.id, { playbooks: selectedIds });
    onClose(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white text-black rounded p-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-2">Team Playbooks</h2>
        <div className="max-h-64 overflow-y-auto mb-2">
          {playbooks.map((pb) => (
            <label key={pb.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(pb.id)}
                onChange={() => toggle(pb.id)}
              />
              {pb.name}
            </label>
          ))}
          {playbooks.length === 0 && (
            <div className="text-sm text-center">No playbooks found.</div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => onClose(false)} className="px-3 py-1 rounded bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamPlaybooksModal;
