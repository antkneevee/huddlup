import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export const createTeam = async (teamName, teamLogoUrl, userId) => {
  const data = {
    teamName,
    createdBy: userId,
    createdAt: serverTimestamp(),
    playbooks: [],
  };
  if (teamLogoUrl) {
    data.teamLogoUrl = teamLogoUrl;
  }
  const ref = await addDoc(collection(db, 'teams'), data);
  return { id: ref.id, ...data };
};

export const editTeam = async (teamId, updates) => {
  const ref = doc(db, 'teams', teamId);
  await updateDoc(ref, updates);
};

export const deleteTeam = async (teamId) => {
  await deleteDoc(doc(db, 'teams', teamId));
};

export const getTeamsByUser = async (userId) => {
  const q = query(collection(db, 'teams'), where('createdBy', '==', userId));
  const snap = await getDocs(q);
  const teams = [];
  snap.forEach((d) => teams.push({ id: d.id, ...d.data() }));
  return teams;
};
