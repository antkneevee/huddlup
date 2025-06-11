import React, { useState, useEffect } from 'react';
import { useTeamsContext } from '../context/TeamsContext.jsx';
import TeamFormModal from '../components/TeamFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import TeamPlaybooksModal from '../components/TeamPlaybooksModal.jsx';
import Toast from '../components/Toast.jsx';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const TeamsPage = ({ user, openSignIn }) => {
  const { teams, createTeam, editTeam, deleteTeam } = useTeamsContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [playbookTeam, setPlaybookTeam] = useState(null);
  const [playbooks, setPlaybooks] = useState([]);
  const [playsMap, setPlaysMap] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!auth.currentUser) {
      openSignIn && openSignIn();
    }
  }, [user]);

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
  }, [user]);

  useEffect(() => {
    const fetchPlays = async () => {
      if (!auth.currentUser) return;
      const snap = await getDocs(
        collection(db, 'users', auth.currentUser.uid, 'plays')
      );
      const obj = {};
      snap.forEach((d) => {
        obj[d.id] = d.data();
      });
      setPlaysMap(obj);
    };
    fetchPlays();
  }, [user]);

  const openCreate = () => {
    if (!auth.currentUser) {
      openSignIn && openSignIn();
      return;
    }
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (team) => {
    if (!auth.currentUser) {
      openSignIn && openSignIn();
      return;
    }
    setEditing(team);
    setShowForm(true);
  };

  const openPlaybooks = (team) => {
    if (!auth.currentUser) {
      openSignIn && openSignIn();
      return;
    }
    setPlaybookTeam(team);
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async (data) => {
    if (!auth.currentUser) {
      openSignIn && openSignIn();
      return;
    }
    if (editing) {
      await editTeam(editing.id, data);
    } else {
      await createTeam(data.teamName, data.logoFile);
    }
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!auth.currentUser) {
      openSignIn && openSignIn();
      return;
    }
    if (deleteId) {
      await deleteTeam(deleteId);
      setDeleteId(null);
    }
  };

  const handlePlaybooksClose = (saved) => {
    setPlaybookTeam(null);
    if (saved) {
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Teams</h1>
        <button onClick={openCreate} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
          Add Team
        </button>
      </div>
      {teams.map((team) => {
        const bookNames =
          team.playbooks && team.playbooks.length > 0
            ? team.playbooks
                .map((id) => playbooks.find((pb) => pb.id === id)?.name)
                .filter(Boolean)
                .join(', ')
            : '';
        return (
          <div key={team.id} className="bg-gray-800 p-4 rounded mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {team.teamLogoUrl && (
                  <img
                    src={team.teamLogoUrl}
                    alt="Team Logo"
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
                <div>
                  <span className="font-bold text-lg">{team.teamName}</span>
                  {bookNames && (
                    <div className="text-sm text-gray-300">{bookNames}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(team)}
                  className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => openPlaybooks(team)}
                  className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-sm"
                >
                  Playbooks
                </button>
                <button
                  onClick={() => toggleExpanded(team.id)}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                >
                  {expanded[team.id] ? 'Hide' : 'View'}
                </button>
                <button
                  onClick={() => setDeleteId(team.id)}
                  className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            {expanded[team.id] && (
              <div className="mt-4 space-y-4">
                {team.playbooks && team.playbooks.length > 0 ? (
                  team.playbooks.map((pbId) => {
                    const book = playbooks.find((pb) => pb.id === pbId);
                    if (!book) return null;
                    return (
                      <div key={pbId}>
                        <h3 className="font-semibold mb-2">{book.name}</h3>
                        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                          {book.playIds.map((pid) => {
                            const play = playsMap[pid];
                            if (!play) return null;
                            return (
                              <div key={pid} className="bg-gray-700 p-1 rounded">
                                {play.image ? (
                                  <img
                                    src={play.image}
                                    alt={play.name}
                                    className="w-full h-24 object-contain rounded bg-white"
                                  />
                                ) : (
                                  <div className="w-full h-24 flex items-center justify-center bg-gray-600 text-gray-300 text-xs rounded">
                                    No Image
                                  </div>
                                )}
                                <div className="text-xs mt-1 truncate" title={play.name}>{play.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-300">No playbooks assigned.</div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {showForm && (
        <TeamFormModal
          initialData={editing || {}}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
      {deleteId && (
        <ConfirmModal
          title="Delete Team"
          message="Are you sure you want to delete this team?"
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
          confirmText="Delete"
        />
      )}
      {playbookTeam && (
        <TeamPlaybooksModal
          team={playbookTeam}
          onClose={handlePlaybooksClose}
        />
      )}
      {showConfirmation && (
        <Toast message="Playbooks saved to team!" />
      )}
    </div>
  );
};

export default TeamsPage;
