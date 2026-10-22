import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCH01xXFgXaM1zdMGRMKuPdlSG4pKZ7c14",
  authDomain: "talentcore-6044f.firebaseapp.com",
  projectId: "talentcore-6044f",
  storageBucket: "talentcore-6044f.firebasestorage.app",
  messagingSenderId: "1033329509855",
  appId: "1:1033329509855:web:4b7349f78d40e80a0b706a",
  measurementId: "G-6WDLPGPGDL"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(app);
