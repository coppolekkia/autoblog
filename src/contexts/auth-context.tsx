// contexts/auth-context.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider, // Aggiunto
  signInWithPopup,    // Aggiunto
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import type { Auth } from "firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: typeof createUserWithEmailAndPassword;
  signIn: typeof signInWithEmailAndPassword;
  signInWithGoogle: () => Promise<any>; // Aggiunta funzione signInWithGoogle
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth as Auth, email, password);
  };

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth as Auth, email, password);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth as Auth, provider);
  };

  const signOut = () => {
    return firebaseSignOut(auth as Auth);
  };

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle, // Aggiunto al valore del contesto
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
