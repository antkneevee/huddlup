import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import {
  getTeamsByUser,
  createTeam as fbCreateTeam,
  editTeam as fbEditTeam,
  deleteTeam as fbDeleteTeam,
  uploadTeamLogo,
} from '../firebase/teams';

const TeamsContext = createContext({
  teams: [],
  selectedTeamId: '',
  setSelectedTeamId: () => {},
  loadTeams: async () => {},
  createTeam: async () => {},
  editTeam: async () => {},
  deleteTeam: async () => {},
});

export const TeamsContextProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const loadTeams = async (user = auth.currentUser) => {
    if (!user) {
      setTeams([]);
      return;
    }
    const data = await getTeamsByUser(user.uid);
    setTeams(data);
    if (data.length && !selectedTeamId) {
      setSelectedTeamId(data[0].id);
    }
  };

  const createTeam = async (name, logoFile) => {
    if (!auth.currentUser) return null;
    const team = await fbCreateTeam(name, null, auth.currentUser.uid);
    if (logoFile) {
      const url = await uploadTeamLogo(team.id, logoFile);
      await fbEditTeam(team.id, { teamLogoUrl: url });
      team.teamLogoUrl = url;
    }
    setTeams((prev) => [...prev, team]);
    return team;
  };

  const editTeam = async (
    teamId,
    { teamName, logoFile, playbooks } = {}
  ) => {
    const updates = {};
    if (teamName !== undefined) updates.teamName = teamName;
    if (playbooks !== undefined) updates.playbooks = playbooks;
    if (logoFile) {
      const url = await uploadTeamLogo(teamId, logoFile);
      updates.teamLogoUrl = url;
    }
    if (Object.keys(updates).length) {
      await fbEditTeam(teamId, updates);
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
      );
    }
  };

  const deleteTeam = async (teamId) => {
    await fbDeleteTeam(teamId);
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (selectedTeamId === teamId) setSelectedTeamId('');
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => loadTeams(u));
    return unsub;
  }, []);

  return (
    <TeamsContext.Provider
      value={{
        teams,
        selectedTeamId,
        setSelectedTeamId,
        loadTeams,
        createTeam,
        editTeam,
        deleteTeam,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeamsContext = () => useContext(TeamsContext);

export default TeamsContext;
