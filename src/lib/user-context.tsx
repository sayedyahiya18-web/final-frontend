'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  limit
} from 'firebase/firestore';

export type ScannedProduct = {
  barcode: string;
  name: string;
  brand: string;
  timestamp: number;
  isSafe: boolean;
};

export type CommunityPost = {
  id: string;
  username: string;
  community: string;
  productName: string;
  brand: string;
  healthScore: number;
  isSafe: boolean;
  recommendation: string;
  warning: string | null;
  timestamp: number;
  details?: {
    realityCheck?: any;
    smartSwap?: any;
    ingredientInsights?: any[];
    ingredients?: string;
  };
};

export type ExerciseGoal = {
  totalMinutes: number;
  activity: string;
  completedMinutes: number;
};

export type UserPreferences = {
  username: string;
  city: string;
  allergies: string[];
  conditions: string[];
  dietType: 'vegetarian' | 'non-veg' | 'vegan';
  proteinGoal: number;
  routine: string;
  community: string | null;
  scanHistory: ScannedProduct[];
  exerciseGoal: ExerciseGoal;
};

type UserContextType = {
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => Promise<void>;
  addToHistory: (product: ScannedProduct) => Promise<void>;
  addExerciseGoal: (minutes: number, activity: string) => Promise<void>;
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, isSignUp: boolean, username?: string, city?: string) => Promise<void>;
  logout: () => Promise<void>;
  communityPosts: CommunityPost[];
  postToCommunity: (post: Omit<CommunityPost, 'id' | 'timestamp'>) => Promise<void>;
  joinCommunity: (name: string) => Promise<void>;
};

const defaultExerciseGoal: ExerciseGoal = {
  totalMinutes: 0,
  activity: 'walking',
  completedMinutes: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch preferences from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setPrefs(userDoc.data() as UserPreferences);
        }
      } else {
        setUser(null);
        setPrefs(null);
      }
      setLoading(false);
    });

    // Listen for community posts
    const q = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));
      setCommunityPosts(posts);
    });

    return () => {
      unsubscribe();
      unsubscribePosts();
    };
  }, []);

  const login = async (email: string, password: string, isSignUp: boolean, username?: string, city?: string) => {
    if (isSignUp) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // Initialize user doc
      const initialPrefs: UserPreferences = {
        username: username && username.trim() !== '' ? username : 'User',
        city: city || '',
        allergies: [],
        conditions: [],
        dietType: 'non-veg',
        proteinGoal: 60,
        routine: 'Sedentary',
        community: null,
        scanHistory: [],
        exerciseGoal: defaultExerciseGoal
      };
      await setDoc(doc(db, 'users', res.user.uid), initialPrefs);
      setPrefs(initialPrefs);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const setPreferences = async (prefs: UserPreferences) => {
    if (!user) return;
    const merged = { ...prefs, exerciseGoal: prefs.exerciseGoal || defaultExerciseGoal };
    await setDoc(doc(db, 'users', user.uid), merged);
    setPrefs(merged);
  };

  const addToHistory = async (product: ScannedProduct) => {
    if (!user || !preferences) return;
    const newHistory = [product, ...(preferences.scanHistory || [])].slice(0, 50);
    await updateDoc(doc(db, 'users', user.uid), {
      scanHistory: newHistory
    });
    setPrefs({ ...preferences, scanHistory: newHistory });
  };

  const addExerciseGoal = async (minutes: number, activity: string) => {
    if (!user || !preferences) return;
    const current = preferences.exerciseGoal || defaultExerciseGoal;
    const newGoal: ExerciseGoal = {
      totalMinutes: current.totalMinutes + minutes,
      activity: activity || current.activity,
      completedMinutes: current.completedMinutes,
    };
    await updateDoc(doc(db, 'users', user.uid), {
      exerciseGoal: newGoal
    });
    setPrefs({ ...preferences, exerciseGoal: newGoal });
  };

  const joinCommunity = async (name: string) => {
    if (!user || !preferences) return;
    await updateDoc(doc(db, 'users', user.uid), {
      community: name
    });
    setPrefs({ ...preferences, community: name });
  };

  const postToCommunity = async (post: Omit<CommunityPost, 'id' | 'timestamp'>) => {
    if (!user) return;
    await addDoc(collection(db, 'community_posts'), {
      ...post,
      timestamp: Date.now()
    });
  };

  return (
    <UserContext.Provider
      value={{
        preferences,
        setPreferences,
        addToHistory,
        addExerciseGoal,
        isLoggedIn: !!user,
        user,
        loading,
        login,
        logout,
        communityPosts,
        postToCommunity,
        joinCommunity,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
