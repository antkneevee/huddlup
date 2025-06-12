import React, { useState, useEffect } from 'react';
import AddToPlaybookModal from './AddToPlaybookModal';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import { db, auth } from '../firebase';
import {
  collection,
  collectionGroup,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';

const PlayLibrary = ({ onSelectPlay, user, openSignIn, adminMode = false }) => {
  const [plays, setPlays] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlayId, setSelectedPlayId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [deletePlayId, setDeletePlayId] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      openSignIn();
      return;
    }

    const fetchPlays = async () => {
      if (adminMode) {
        if (auth.currentUser.email !== import.meta.env.VITE_SITE_OWNER_EMAIL) {
          setPlays([]);
          return;
        }
        const snap = await getDocs(collectionGroup(db, 'plays'));
        const arr = [];
        snap.forEach((d) => {
          const userId = d.ref.parent.parent.id;
          arr.push({ id: d.id, userId, ...d.data() });
        });
        setPlays(arr);
      } else {
        const snap = await getDocs(
          collection(db, 'users', auth.currentUser.uid, 'plays')
        );
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setPlays(arr);
      }
    };

    fetchPlays();
  }, [user, adminMode]);

  if (!auth.currentUser) {
    return <div className="p-4">Please sign in to view your plays.</div>;
  }

  if (adminMode && auth.currentUser.email !== import.meta.env.VITE_SITE_OWNER_EMAIL) {
    return <div className="p-4">Access denied.</div>;
  }

  const filteredPlays = plays.filter(play => {
    const query = searchQuery.toLowerCase();
    return (
      play.name.toLowerCase().includes(query) ||
      play.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const displayedPlays = filteredPlays.slice(0, itemsPerPage);

  const handleAddModalClose = (success) => {
    setShowAddModal(false);
    if (success) {
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
      setSelectedIds([]);
      setBulkMode(false);
    }
  };

  const toggleLock = async (playId, locked) => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'users', auth.currentUser.uid, 'plays', playId);
    await updateDoc(ref, { locked: !locked });
    setPlays((prev) =>
      prev.map((p) => (p.id === playId ? { ...p, locked: !locked } : p))
    );
  };

  const deletePlay = async (playId) => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'users', auth.currentUser.uid, 'plays', playId);
    await deleteDoc(ref);
    setPlays((prev) => prev.filter((p) => p.id !== playId));
  };

  const confirmDelete = async () => {
    if (!deletePlayId) return;
    await deletePlay(deletePlayId);
    setDeletePlayId(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleBulkAdd = () => {
    if (selectedIds.length > 0) {
      setShowAddModal(true);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Play Library</h1>
      <div className="flex mb-4 gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or tags"
          className="flex-grow p-2 rounded bg-gray-700 text-white"
        />
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="p-3 rounded bg-gray-700 text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
        <button
          onClick={() => {
            if (bulkMode) {
              setSelectedIds([]);
              setBulkMode(false);
            } else {
              setBulkMode(true);
            }
          }}
          className="p-2 rounded bg-gray-700 text-white"
        >
          {bulkMode ? 'Cancel' : 'Bulk Select'}
        </button>
        {bulkMode && (
          <button
            onClick={handleBulkAdd}
            disabled={selectedIds.length === 0}
            className="p-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            Add Selected
          </button>
        )}
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {displayedPlays.map((play) => (
          <div
            key={play.id}
            className="bg-gray-800 rounded p-2 cursor-pointer relative hover:bg-gray-700"
            onClick={() => {
              if (play.locked) {
                setShowUnlockModal(true);
                return;
              }
              onSelectPlay(play);
            }}
          >
            {bulkMode && (
              <input
                type="checkbox"
                className="absolute top-1 left-1"
                checked={selectedIds.includes(play.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelect(play.id);
                }}
              />
            )}
            <div className="absolute top-1 right-1 flex gap-1">
              <button
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlayId(play.id);
                  setSelectedIds([play.id]);
                  setShowAddModal(true);
                }}
              >
                Add
              </button>
              {!adminMode && (
                <>
                  <button
                    className="bg-gray-600 text-white p-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(play.id, play.locked);
                    }}
                  >
                    {play.locked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Unlock className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    className="bg-red-600 text-white p-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletePlayId(play.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
            {play.image ? (
              <img
                src={play.image}
                alt={play.name}
                className="w-full h-40 object-contain rounded mb-2 bg-white"
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center bg-gray-700 text-gray-400 rounded mb-2">
                No Image
              </div>
            )}
            <h2 className="text-lg font-bold">{play.name}</h2>
            {adminMode && (
              <div className="text-xs text-gray-400 mb-1">User: {play.userId}</div>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              {play.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="bg-gray-700 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showAddModal && (
        <AddToPlaybookModal
          playIds={bulkMode ? selectedIds : [selectedPlayId]}
          onClose={handleAddModalClose}
        />
      )}
      {showConfirmation && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow">
          Play successfully added to Playbook!
        </div>
      )}
      {showUnlockModal && (
        <AlertModal message="Unlock this play to edit" onClose={() => setShowUnlockModal(false)} />
      )}
      {deletePlayId && (
        <ConfirmModal
          title="Delete Play"
          message="Are you sure you want to delete this play?"
          confirmText="Delete"
          onCancel={() => setDeletePlayId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default PlayLibrary;
