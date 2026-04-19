import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut 
} from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  email: string;
  name: string;
  photoURL?: string;
  createdAt: string;
  plan: 'Free' | 'Premium Ultra';
  notificationsEnabled: boolean;
  saved: string[];
  followingActors: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  toggleSave: (movieId: string) => Promise<void>;
  isSaved: (movieId: string) => boolean;
  toggleFollowActor: (actorId: string) => Promise<void>;
  isFollowingActor: (actorId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = '@the-cine-now:profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            if (!data.saved) data.saved = [];
            if (!data.followingActors) data.followingActors = [];
            setProfile(data);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } else {
            const newProfile: UserProfile = {
              email: currentUser.email || '',
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
              plan: 'Premium Ultra',
              notificationsEnabled: true,
              saved: [],
              followingActors: [],
            };
            await setDoc(doc(db, 'users', currentUser.uid), newProfile);
            setProfile(newProfile);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to local storage if offline
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) setProfile(JSON.parse(stored));
        }
      } else {
        setProfile(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const toggleSave = async (movieId: string) => {
    if (!profile || !user) return;

    const idStr = movieId.toString();
    const isAlreadySaved = profile.saved.includes(idStr);
    const newSaved = isAlreadySaved
      ? profile.saved.filter((id) => id !== idStr)
      : [...profile.saved, idStr];

    const newProfile = { ...profile, saved: newSaved };
    setProfile(newProfile);
    
    // Save to local storage for quick access
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));

    // Sync with Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (error) {
      console.error('Failed to sync saved movies to Firestore:', error);
    }
  };

  const isSaved = (movieId: string) => {
    return profile?.saved.includes(movieId.toString()) || false;
  };

  const toggleFollowActor = async (actorId: string) => {
    if (!profile || !user) {
      Alert.alert(
        'Login Necessário', 
        'Faça login no Perfil para cadastrar e acompanhar seus atores favoritos.'
      );
      return;
    }

    const idStr = actorId.toString();
    const isAlreadyFollowing = profile.followingActors?.includes(idStr);
    const newFollowing = isAlreadyFollowing
      ? profile.followingActors.filter((id) => id !== idStr)
      : [...(profile.followingActors || []), idStr];

    const newProfile = { ...profile, followingActors: newFollowing };
    setProfile(newProfile);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (error) {
      console.error('Failed to sync following actors to Firestore:', error);
    }
  };

  const isFollowingActor = (actorId: string) => {
    return profile?.followingActors?.includes(actorId.toString()) || false;
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, toggleSave, isSaved, toggleFollowActor, isFollowingActor }}>
      {!loading && children}
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
