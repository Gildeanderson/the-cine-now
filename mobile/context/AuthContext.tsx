import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  uid: string;
  displayName: string | null;
  saved: string[];
}

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  toggleSave: (movieId: string) => Promise<void>;
  isSaved: (movieId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@the-cine-now:profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setProfile(JSON.parse(stored));
        } else {
          // Default guest profile
          const guestProfile: UserProfile = {
            uid: 'guest',
            displayName: 'Guest User',
            saved: [],
          };
          setProfile(guestProfile);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(guestProfile));
        }
      } catch (e) {
        console.error('Failed to load local profile:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const toggleSave = async (movieId: string) => {
    if (!profile) return;

    const idStr = movieId.toString();
    const isAlreadySaved = profile.saved.includes(idStr);
    const newSaved = isAlreadySaved
      ? profile.saved.filter((id) => id !== idStr)
      : [...profile.saved, idStr];

    const newProfile = { ...profile, saved: newSaved };
    setProfile(newProfile);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  const isSaved = (movieId: string) => {
    return profile?.saved.includes(movieId.toString()) || false;
  };

  return (
    <AuthContext.Provider value={{ profile, loading, toggleSave, isSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
