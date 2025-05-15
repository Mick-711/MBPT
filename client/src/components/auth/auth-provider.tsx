import React, { useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AuthContext } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: 'trainer' | 'client';
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  role: 'trainer' | 'client';
}

// Helper function
function getQueryFn({ on401 }: { on401: 'returnNull' | 'throw' }) {
  return async ({ queryKey }: { queryKey: (string)[] }) => {
    const res = await fetch(queryKey[0], {
      credentials: 'include',
    });

    if (on401 === 'returnNull' && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }

    return res.json();
  };
}

export function AuthProviderComponent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (data?.authenticated && data.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, [data]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return apiRequest('POST', '/api/auth/login', credentials);
    },
    onSuccess: async (response) => {
      const userData = await response.json();
      setUser(userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.fullName}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      return apiRequest('POST', '/api/auth/register', userData);
    },
    onSuccess: async (response) => {
      const userData = await response.json();
      setUser(userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.fullName}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}