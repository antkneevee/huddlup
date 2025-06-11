import { db, storage } from '../firebase';
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
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const createTeam = async (teamName, teamLogoUrl, userId) => {
  const data = {
    teamName,
    createdBy: userId,
    createdAt: serverTimestamp(),
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

export const uploadTeamLogo = async (teamId, file) => {
  if (!teamId || !file) return null;
  const fileRef = ref(storage, `teamLogos/${teamId}.png`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

export const getTeamsByUser = async (userId) => {
  const q = query(collection(db, 'teams'), where('createdBy', '==', userId));
  const snap = await getDocs(q);
  const teams = [];
  snap.forEach((d) => teams.push({ id: d.id, ...d.data() }));
  return teams;
};

export const getTeamPlaybooks = async (teamId) => {
  const snap = await getDocs(collection(db, 'teams', teamId, 'playbooks'));
  const arr = [];
  snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
  return arr;
};

export const addPlaybookToTeam = async (teamId, playbookData) => {
  if (!teamId || !playbookData?.id) return;
  const ref = doc(db, 'teams', teamId, 'playbooks', playbookData.id);
  await setDoc(ref, playbookData);
};

export const removePlaybookFromTeam = async (teamId, playbookId) => {
  if (!teamId || !playbookId) return;
  await deleteDoc(doc(db, 'teams', teamId, 'playbooks', playbookId));
};
