import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'lenstext_auth';
const AUTO_LOGOUT_HOURS = 12;
const AUTO_LOGOUT_MS = AUTO_LOGOUT_HOURS * 60 * 60 * 1000;

// Hardcoded credentials (you can move these to environment variables)
const VALID_CREDENTIALS = [
  { username: 'defence', password: 'Elec@26!' },
  { username: 'user', password: 'user123' },
  // Add more users as needed
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const authData = JSON.parse(saved);
        const currentTime = Date.now();
        const loginTime = authData.loginTime;
        
        // Check if 12 hours have passed
        if (currentTime - loginTime > AUTO_LOGOUT_MS) {
          localStorage.removeItem(STORAGE_KEY);
          return false;
        }
        return authData.isAuthenticated;
      } catch {
        return false;
      }
    }
    return false;
  });

  const [user, setUser] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const authData = JSON.parse(saved);
        const currentTime = Date.now();
        const loginTime = authData.loginTime;
        
        if (currentTime - loginTime > AUTO_LOGOUT_MS) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return authData.user || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Check for auto-logout on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const authData = JSON.parse(saved);
        const currentTime = Date.now();
        const loginTime = authData.loginTime;
        
        if (currentTime - loginTime > AUTO_LOGOUT_MS) {
          logout();
        }
      } catch {
        logout();
      }
    }

    // Set up interval to check for auto-logout every minute
    const intervalId = setInterval(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const authData = JSON.parse(saved);
          const currentTime = Date.now();
          const loginTime = authData.loginTime;
          
          if (currentTime - loginTime > AUTO_LOGOUT_MS) {
            logout();
          }
        } catch {
          logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  const login = (username: string, password: string): boolean => {
    const isValid = VALID_CREDENTIALS.some(
      cred => cred.username === username && cred.password === password
    );

    if (isValid) {
      const authData = {
        isAuthenticated: true,
        user: username,
        loginTime: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      setUser(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};