'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface User {
  id?: string;
  email?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  x_avatar_url?: string;  // Twitter profile picture
  x_connected?: boolean;  // Whether X account is connected
  followers_count?: number;
  points?: number;
  bio?: string;
  account_type?: string;
  tier?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isConnectedToX: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkXConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnectedToX, setIsConnectedToX] = useState(false);

  useEffect(() => {
    // Load auth data from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const xConnected = localStorage.getItem('x_connected') === 'true';
    
    console.log('AuthContext - Initial load:', {
      hasToken: !!storedToken,
      hasStoredUser: !!storedUser,
      xConnected
    });
    
    if (storedToken && storedUser) {
      try {
        let parsedUser = JSON.parse(storedUser);
        console.log('AuthContext - Parsed user:', parsedUser);
        
        // If the parsed user has a 'data' property, it's the wrapped response
        if (parsedUser.data && typeof parsedUser.data === 'object') {
          parsedUser = parsedUser.data;
          // Update localStorage with the correct structure
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        
        setToken(storedToken);
        setUser(parsedUser);
        // Check if X is connected via x_connected boolean or localStorage flag
        setIsConnectedToX(parsedUser.x_connected === true || xConnected);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    } else if (xConnected) {
      // Even without full user data, check if X is connected
      setIsConnectedToX(true);
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUser({ 
          username: storedUsername
        });
      }
    }

    // Check OAuth callback params
    handleOAuthCallback();
    
    // Always try to fetch fresh data if connected
    if (xConnected) {
      checkXConnection();
    }
  }, []);

  const handleOAuthCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for access_token in URL (OAuth success)
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const username = params.get('username');
    
    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      if (username) {
        localStorage.setItem('username', username);
      }
      
      toast.success('𝕏  account connected successfully', {
        position: "top-right",
        autoClose: 5000,
      });
      
      // Mark as connected
      setIsConnectedToX(true);
      localStorage.setItem('x_connected', 'true');
      
      // Try to refresh user data
      await checkXConnection();
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    
    // Check for successful X connection (alternative format)
    if (params.get('x_connected') === 'true') {
      toast.success('𝕏  account connected successfully', {
        position: "top-right",
        autoClose: 5000,
      });
      
      // Mark as connected
      setIsConnectedToX(true);
      localStorage.setItem('x_connected', 'true');
      
      // Try to refresh user data
      await checkXConnection();
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Check for X connection errors
    if (params.get('x_error') === 'true' || params.get('error')) {
      toast.error('Failed to connect 𝕏  account', {
        position: "top-right",
        autoClose: 5000,
      });
      
      localStorage.removeItem('x_connected');
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const checkXConnection = async () => {
    const storedToken = token || localStorage.getItem('token');
    
    try {
      // Call the users/me endpoint to get user data
      const response = await fetch('https://api.wispr.top/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken && { 'Authorization': `Bearer ${storedToken}` })
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Extract the actual user data from the wrapped response
        const userData = responseData.data || responseData;
        
        // Check if user has X account connected via x_connected boolean
        const isConnected = userData.x_connected === true;
        
        if (isConnected) {
          setUser(userData);
          setIsConnectedToX(true);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('x_connected', 'true');
          
          console.log('User profile loaded:', {
            username: userData.username,
            display_name: userData.display_name,
            xAvatar: userData.x_avatar_url,
            avatar: userData.avatar_url,
            bio: userData.bio
          });
        } else {
          // User exists but X not connected
          setUser(userData);
          setIsConnectedToX(false);
          localStorage.removeItem('x_connected');
        }
      } else if (response.status === 401) {
        // Not authenticated - check localStorage for connection status
        const xConnected = localStorage.getItem('x_connected') === 'true';
        if (xConnected) {
          // We know X is connected from localStorage but can't get full user data
          setIsConnectedToX(true);
          const storedUser = localStorage.getItem('user');
          
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // Invalid user data
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      
      // Fall back to localStorage
      const xConnected = localStorage.getItem('x_connected') === 'true';
      const storedUser = localStorage.getItem('user');
      
      if (xConnected && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsConnectedToX(true);
        } catch {
          setIsConnectedToX(xConnected);
        }
      } else {
        setIsConnectedToX(xConnected);
      }
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsConnectedToX(newUser.x_connected === true);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsConnectedToX(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setIsConnectedToX(updatedUser.x_connected === true);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isConnectedToX,
      login,
      logout,
      updateUser,
      checkXConnection
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};