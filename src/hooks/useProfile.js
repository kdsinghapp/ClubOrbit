import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserProfile, getCurrentUserProfile, updateUserProfile } from '../services/profileService';
import { auth } from '../firebase';

export const useProfile = (uid = null) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Prevent duplicate fetches when uid briefly flickers undefined → value
  const lastFetchedUid = useRef(undefined);

  const fetchProfile = useCallback(async (targetUid) => {
    // uid abhi bhi resolve nahi hua (undefined = auth loading)
    if (targetUid === undefined) return;

    // same uid ke liye dobara fetch mat karo
    if (lastFetchedUid.current === targetUid) return;
    lastFetchedUid.current = targetUid;

    // logged out → clear
    if (targetUid === null && !auth.currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const profileData = targetUid
        ? await getUserProfile(targetUid)
        : await getCurrentUserProfile();

      setProfile(profileData);
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // no deps — uid is passed as argument

  useEffect(() => {
    fetchProfile(uid);
  }, [uid, fetchProfile]);

  const updateProfile = useCallback(async (profileData, profileImage = null) => {
    try {
      setLoading(true);
      setError(null);
      if (!auth.currentUser) throw new Error('No authenticated user found');
      const updatedProfile = await updateUserProfile(profileData, profileImage);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Profile update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(() => {
    // Force re-fetch by resetting lastFetchedUid
    lastFetchedUid.current = undefined;
    fetchProfile(uid);
  }, [uid, fetchProfile]);

  return { profile, loading, error, updateProfile, refreshProfile };
};


// Backward-compat wrapper — naya Firebase listener nahi banata,
// sirf AuthContext ka data return karta hai.
import { useAuthContext } from '../context/AuthContext';
export const useAuthUser = () => {
  const { user, loading } = useAuthContext();
  return { user, loading };
};