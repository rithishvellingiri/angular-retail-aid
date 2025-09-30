import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  username: string;
  email: string;
  mobile: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Check admin credentials
      if (username === 'admin' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin',
          username: 'admin',
          email: 'admin@store.com',
          mobile: '+1234567890',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        setUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        toast({
          title: "Welcome Admin!",
          description: "Successfully logged in as administrator.",
        });
        return true;
      }

      // Check registered users (username or mobile)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => (u.username === username || u.mobile === username) && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${foundUser.username}.`,
        });
        return true;
      }

      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (username: string, email: string, mobile: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if username, email, or mobile already exists
      if (users.some((u: any) => u.username === username || u.email === email || u.mobile === mobile)) {
        toast({
          title: "Registration Failed",
          description: "Username, email, or mobile number already exists.",
          variant: "destructive",
        });
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        mobile,
        password,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      toast({
        title: "Registration Successful!",
        description: "Your account has been created and you are now logged in.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};