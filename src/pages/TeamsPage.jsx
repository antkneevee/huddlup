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
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      {teams.map((team) => (
        <div key={team.id} className="bg-gray-800 p-4 rounded mb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {team.teamLogoUrl && (
              <img src={team.teamLogoUrl} alt="Team Logo" className="h-12 w-12 object-cover rounded" />
            )}
            <div>
              <span className="font-bold text-lg">{team.teamName}</span>
              {team.playbooks && team.playbooks.length > 0 && (
                <div className="text-sm text-gray-300">
                  {team.playbooks
                    .map((id) => playbooks.find((pb) => pb.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </div>
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
              onClick={() => setDeleteId(team.id)}
              className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
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
