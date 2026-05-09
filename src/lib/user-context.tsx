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
  limit,
  where,
  getDocs
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

export type WalletTransaction = {
  amount: number;
  type: 'deposit' | 'withdraw' | 'bet_placed' | 'bet_won' | 'bet_refund';
  desc: string;
  timestamp: number;
};

export type Wallet = {
  balance: number;
  transactions: WalletTransaction[];
};

export type ChallengeProgress = {
  caloriesDaysHit: number;
  proteinDaysHit: number;
  dailyLogs: { day: number; calories: number; protein: number; date: number }[];
};

export type Challenge = {
  id: string;
  creatorId: string;
  creatorName: string;
  opponentId: string | null;
  opponentName: string | null;
  betAmount: number;
  duration: number;
  startDate: number | null;
  endDate: number | null;
  goals: {
    dailyCalories: number;
    dailyProtein: number;
  };
  creatorProgress: ChallengeProgress;
  opponentProgress: ChallengeProgress;
  status: 'waiting' | 'active' | 'completed';
  winner: string | null;
  inviteCode: string;
};

export type UserPreferences = {
  username: string;
  city: string;
  allergies: string[];
  conditions: string[];
  dietType: 'vegetarian' | 'non-veg' | 'vegan';
  routine: string;
  community: string | null;
  scanHistory: ScannedProduct[];
  exerciseGoal: ExerciseGoal;
  wallet: Wallet;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
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
  challenges: Challenge[];
  depositToWallet: (amount: number) => Promise<void>;
  createChallenge: (betAmount: number, duration: number, goals: { dailyCalories: number; dailyProtein: number }) => Promise<string>;
  joinChallenge: (inviteCode: string) => Promise<void>;
  logDailyProgress: (challengeId: string, calories: number, protein: number) => Promise<void>;
};

const defaultExerciseGoal: ExerciseGoal = {
  totalMinutes: 0,
  activity: 'walking',
  completedMinutes: 0,
};

const defaultWallet: Wallet = {
  balance: 0,
  transactions: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as any;
          setPrefs({ ...data, wallet: data.wallet || defaultWallet } as UserPreferences);
        }
      } else {
        setUser(null);
        setPrefs(null);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost));
      setCommunityPosts(posts);
    });

    return () => {
      unsubscribe();
      unsubscribePosts();
    };
  }, []);

  // Listen for challenges involving this user
  useEffect(() => {
    if (!user) { setChallenges([]); return; }

    const q1 = query(collection(db, 'challenges'), where('creatorId', '==', user.uid));
    const q2 = query(collection(db, 'challenges'), where('opponentId', '==', user.uid));

    const unsub1 = onSnapshot(q1, (snap) => {
      const created = snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
      setChallenges(prev => {
        const otherChallenges = prev.filter(c => c.creatorId !== user.uid);
        return [...created, ...otherChallenges];
      });
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const joined = snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
      setChallenges(prev => {
        const otherChallenges = prev.filter(c => c.opponentId !== user.uid);
        return [...otherChallenges, ...joined];
      });
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  const login = async (email: string, password: string, isSignUp: boolean, username?: string, city?: string) => {
    if (isSignUp) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const initialPrefs: UserPreferences = {
        username: username && username.trim() !== '' ? username : 'User',
        city: city || '',
        allergies: [],
        conditions: [],
        dietType: 'non-veg',
        routine: 'Sedentary',
        community: null,
        scanHistory: [],
        exerciseGoal: defaultExerciseGoal,
        wallet: defaultWallet,
      };
      await setDoc(doc(db, 'users', res.user.uid), initialPrefs);
      setPrefs(initialPrefs);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const logout = async () => { await signOut(auth); };

  const setPreferences = async (prefs: UserPreferences) => {
    if (!user) return;
    const merged = { ...prefs, exerciseGoal: prefs.exerciseGoal || defaultExerciseGoal, wallet: prefs.wallet || defaultWallet };
    await setDoc(doc(db, 'users', user.uid), merged);
    setPrefs(merged);
  };

  const addToHistory = async (product: ScannedProduct) => {
    if (!user || !preferences) return;
    const newHistory = [product, ...(preferences.scanHistory || [])].slice(0, 50);
    await updateDoc(doc(db, 'users', user.uid), { scanHistory: newHistory });
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
    await updateDoc(doc(db, 'users', user.uid), { exerciseGoal: newGoal });
    setPrefs({ ...preferences, exerciseGoal: newGoal });
  };

  const joinCommunity = async (name: string) => {
    if (!user || !preferences) return;
    await updateDoc(doc(db, 'users', user.uid), { community: name });
    setPrefs({ ...preferences, community: name });
  };

  const postToCommunity = async (post: Omit<CommunityPost, 'id' | 'timestamp'>) => {
    if (!user) return;
    await addDoc(collection(db, 'community_posts'), { ...post, timestamp: Date.now() });
  };

  // ── WALLET ──
  const depositToWallet = async (amount: number) => {
    if (!user || !preferences || amount <= 0) return;
    const wallet = preferences.wallet || defaultWallet;
    const tx: WalletTransaction = { amount, type: 'deposit', desc: 'Added funds', timestamp: Date.now() };
    const updated: Wallet = { balance: wallet.balance + amount, transactions: [tx, ...wallet.transactions].slice(0, 100) };
    await updateDoc(doc(db, 'users', user.uid), { wallet: updated });
    setPrefs({ ...preferences, wallet: updated });
  };

  // ── CHALLENGES ──
  const createChallenge = async (betAmount: number, duration: number, goals: { dailyCalories: number; dailyProtein: number }): Promise<string> => {
    if (!user || !preferences) throw new Error('Not logged in');
    const wallet = preferences.wallet || defaultWallet;
    if (wallet.balance < betAmount) throw new Error('Insufficient balance');

    const inviteCode = generateInviteCode();
    const emptyProgress: ChallengeProgress = { caloriesDaysHit: 0, proteinDaysHit: 0, dailyLogs: [] };

    const challengeData: Omit<Challenge, 'id'> = {
      creatorId: user.uid,
      creatorName: preferences.username,
      opponentId: null,
      opponentName: null,
      betAmount,
      duration,
      startDate: null,
      endDate: null,
      goals,
      creatorProgress: emptyProgress,
      opponentProgress: emptyProgress,
      status: 'waiting',
      winner: null,
      inviteCode,
    };

    await addDoc(collection(db, 'challenges'), challengeData);

    // Deduct from wallet
    const tx: WalletTransaction = { amount: -betAmount, type: 'bet_placed', desc: `Challenge bet (${inviteCode})`, timestamp: Date.now() };
    const updatedWallet: Wallet = { balance: wallet.balance - betAmount, transactions: [tx, ...wallet.transactions].slice(0, 100) };
    await updateDoc(doc(db, 'users', user.uid), { wallet: updatedWallet });
    setPrefs({ ...preferences, wallet: updatedWallet });

    return inviteCode;
  };

  const joinChallenge = async (inviteCode: string) => {
    if (!user || !preferences) throw new Error('Not logged in');
    const q = query(collection(db, 'challenges'), where('inviteCode', '==', inviteCode.toUpperCase()), where('status', '==', 'waiting'));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Challenge not found or already started');

    const challengeDoc = snap.docs[0];
    const challenge = challengeDoc.data() as Omit<Challenge, 'id'>;

    if (challenge.creatorId === user.uid) throw new Error('You cannot join your own challenge');

    const wallet = preferences.wallet || defaultWallet;
    if (wallet.balance < challenge.betAmount) throw new Error('Insufficient balance');

    const now = Date.now();
    await updateDoc(doc(db, 'challenges', challengeDoc.id), {
      opponentId: user.uid,
      opponentName: preferences.username,
      status: 'active',
      startDate: now,
      endDate: now + challenge.duration * 24 * 60 * 60 * 1000,
    });

    const tx: WalletTransaction = { amount: -challenge.betAmount, type: 'bet_placed', desc: `Joined challenge (${inviteCode})`, timestamp: now };
    const updatedWallet: Wallet = { balance: wallet.balance - challenge.betAmount, transactions: [tx, ...wallet.transactions].slice(0, 100) };
    await updateDoc(doc(db, 'users', user.uid), { wallet: updatedWallet });
    setPrefs({ ...preferences, wallet: updatedWallet });
  };

  const logDailyProgress = async (challengeId: string, calories: number, protein: number) => {
    if (!user || !preferences) return;

    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    if (!challengeSnap.exists()) return;

    const challenge = { id: challengeSnap.id, ...challengeSnap.data() } as Challenge;
    const isCreator = challenge.creatorId === user.uid;
    const progressField = isCreator ? 'creatorProgress' : 'opponentProgress';
    const currentProgress = isCreator ? challenge.creatorProgress : challenge.opponentProgress;

    const dayNum = currentProgress.dailyLogs.length + 1;
    if (dayNum > challenge.duration) return; // challenge over

    const hitCalories = calories >= challenge.goals.dailyCalories;
    const hitProtein = protein >= challenge.goals.dailyProtein;

    const updatedProgress: ChallengeProgress = {
      caloriesDaysHit: currentProgress.caloriesDaysHit + (hitCalories ? 1 : 0),
      proteinDaysHit: currentProgress.proteinDaysHit + (hitProtein ? 1 : 0),
      dailyLogs: [...currentProgress.dailyLogs, { day: dayNum, calories, protein, date: Date.now() }],
    };

    await updateDoc(challengeRef, { [progressField]: updatedProgress });

    // Check if challenge is complete (both logged all days)
    const otherProgress = isCreator ? challenge.opponentProgress : challenge.creatorProgress;
    if (updatedProgress.dailyLogs.length >= challenge.duration && otherProgress.dailyLogs.length >= challenge.duration) {
      const myScore = updatedProgress.caloriesDaysHit + updatedProgress.proteinDaysHit;
      const theirScore = otherProgress.caloriesDaysHit + otherProgress.proteinDaysHit;

      let winner: string | null = null;
      if (myScore > theirScore) winner = user.uid;
      else if (theirScore > myScore) winner = isCreator ? challenge.opponentId : challenge.creatorId;
      else winner = 'tie';

      await updateDoc(challengeRef, { status: 'completed', winner });

      // Distribute funds
      const totalPot = challenge.betAmount * 2;
      if (winner === 'tie') {
        // Refund both
        const refundTx: WalletTransaction = { amount: challenge.betAmount, type: 'bet_refund', desc: 'Challenge tied - refund', timestamp: Date.now() };
        // Refund current user
        const w = preferences.wallet || defaultWallet;
        const uw: Wallet = { balance: w.balance + challenge.betAmount, transactions: [refundTx, ...w.transactions].slice(0, 100) };
        await updateDoc(doc(db, 'users', user.uid), { wallet: uw });
        setPrefs({ ...preferences, wallet: uw });
        // Refund opponent
        const oppId = isCreator ? challenge.opponentId : challenge.creatorId;
        if (oppId) {
          const oppDoc = await getDoc(doc(db, 'users', oppId));
          if (oppDoc.exists()) {
            const oppData = oppDoc.data() as any;
            const oppWallet = oppData.wallet || defaultWallet;
            await updateDoc(doc(db, 'users', oppId), {
              wallet: { balance: oppWallet.balance + challenge.betAmount, transactions: [refundTx, ...oppWallet.transactions].slice(0, 100) }
            });
          }
        }
      } else if (winner === user.uid) {
        // Current user wins
        const winTx: WalletTransaction = { amount: totalPot, type: 'bet_won', desc: 'Challenge won!', timestamp: Date.now() };
        const w = preferences.wallet || defaultWallet;
        const uw: Wallet = { balance: w.balance + totalPot, transactions: [winTx, ...w.transactions].slice(0, 100) };
        await updateDoc(doc(db, 'users', user.uid), { wallet: uw });
        setPrefs({ ...preferences, wallet: uw });
      }
    }
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
        challenges,
        depositToWallet,
        createChallenge,
        joinChallenge,
        logDailyProgress,
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
