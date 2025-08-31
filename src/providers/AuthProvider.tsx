'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getUserInfo } from '@lib/oauth2';

interface User {
  id: string;
  [key: string]: any; // Flexible for additional Fileion user data
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (!authToken) {
          setError('No auth token found');
          setLoading(false);
          return;
        }

        const userInfo = await getUserInfo(authToken);
        setUser(userInfo);
        setLoading(false);
      } catch (err) {
        console.error('AuthProvider error:', err);
        setError('Failed to fetch user data');
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}