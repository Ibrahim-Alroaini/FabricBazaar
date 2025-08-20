import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    emirate: string;
    zipCode: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('sessionId');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      }).then(res => res.json()),
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem('sessionId', data.sessionId);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Welcome back!",
        description: `You're now logged in as ${data.user.name}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    }
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (userData: any) =>
      fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      }).then(res => res.json()),
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem('sessionId', data.sessionId);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Account created!",
        description: `Welcome to Alreef Fabric, ${data.user.name}!`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      const sessionId = localStorage.getItem('sessionId');
      return fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      }).then(res => res.json());
    },
    onSettled: () => {
      setUser(null);
      localStorage.removeItem('sessionId');
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    }
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const signup = async (userData: any) => {
    await signupMutation.mutateAsync(userData);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading: isLoading || loginMutation.isPending || signupMutation.isPending,
      login,
      signup,
      logout
    }}>
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