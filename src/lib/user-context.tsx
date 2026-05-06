'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ScannedProduct = {
  barcode: string;
  name: string;
  brand: string;
  timestamp: number;
  isSafe: boolean;
};

export type UserPreferences = {
  allergies: string[];
  conditions: string[];
  dietType: 'vegetarian' | 'non-veg' | 'vegan';
  proteinGoal: number;
  routine: string;
  scanHistory: ScannedProduct[];
};

type UserContextType = {
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;
  addToHistory: (product: ScannedProduct) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nutriai_user');
    if (saved) {
      const data = JSON.parse(saved);
      setPrefs(data.preferences);
      setIsLoggedIn(data.isLoggedIn);
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('nutriai_user', JSON.stringify({ isLoggedIn: true, preferences }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPrefs(null);
    localStorage.removeItem('nutriai_user');
  };

  const setPreferences = (prefs: UserPreferences) => {
    setPrefs(prefs);
    setIsLoggedIn(true); // Ensure logged in if preferences are set
    localStorage.setItem('nutriai_user', JSON.stringify({ isLoggedIn: true, preferences: prefs }));
  };

  const addToHistory = (product: ScannedProduct) => {
    if (!preferences) return;
    const newHistory = [product, ...(preferences.scanHistory || [])].slice(0, 50);
    const newPrefs = { ...preferences, scanHistory: newHistory };
    setPreferences(newPrefs);
  };

  return (
    <UserContext.Provider value={{ preferences, setPreferences, addToHistory, isLoggedIn, login, logout }}>
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
