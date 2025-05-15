import { createContext, useContext } from "react";

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: 'trainer' | 'client';
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

// Create a context with default values
const defaultAuth: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultAuth);

// Export a hook that can be used to access the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// This is a placeholder component - we'll implement the actual auth provider in React JSX
// in a separate file since we're having issues with TypeScript + JSX here
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return null;
}
