import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Sync user to firestore
          const userRef = doc(db, 'users', user.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userRef);
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, auth);
          }
          
          if (userDoc && !userDoc.exists()) {
            try {
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`, auth);
            }
          }
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change sync:', error);
        // Even if firestore sync fails, we still want to let the user in if authenticated
        if (user) setUser(user);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
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
