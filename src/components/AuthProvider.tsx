import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { UserProfile } from '../types';
import { jwtDecode } from 'jwt-decode';

interface GoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('google_id_token');
      if (savedToken) {
        try {
          const decoded: any = jwtDecode(savedToken);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            setUser({
              uid: decoded.sub,
              email: decoded.email,
              displayName: decoded.name,
              photoURL: decoded.picture
            });
            const profileData = await api.post('/profile/sync');
            setProfile(profileData);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (credential: string) => {
    try {
      setLoading(true);
      localStorage.setItem('google_id_token', credential);
      
      const decoded: any = jwtDecode(credential);
      setUser({
        uid: decoded.sub,
        email: decoded.email,
        displayName: decoded.name,
        photoURL: decoded.picture
      });

      const profileData = await api.post('/profile/sync');
      setProfile(profileData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      logout();
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('google_id_token');
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
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
