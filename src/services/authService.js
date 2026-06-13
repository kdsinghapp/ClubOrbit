import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const authService = {
  async loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async registerWithEmail({ email, password, displayName }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  },

  async loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  },

  async logout() {
    return signOut(auth);
  },

  async resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  },

  async getIdToken(forceRefresh = false) {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  },
};
