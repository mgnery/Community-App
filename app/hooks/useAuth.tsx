import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// AUTH CONTEXT — Mock Authentication
// When connecting to a real database, replace the signIn and
// signUp functions below with actual API calls. The context
// structure and isAuthenticated state can remain the same.
// ============================================================

interface User {
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "barangay-auth-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted auth state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  // ============================================================
  // MOCK SIGN IN — Replace with actual API call to your database
  // Example: const response = await fetch('/api/auth/login', { ... })
  // ============================================================
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Basic validation
      if (!email || !password) {
        return { success: false, error: "Please fill in all fields." };
      }

      // ADDED: Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Please enter a valid email address." };
      }

      // ADDED: Password minimum length check
      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };
      }

      // Mock success — accept any valid-looking credentials for testing
      const mockUser: User = {
        email: email,
        fullName: "Juan Dela Cruz",
      };

      setUser(mockUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      return { success: true };
    } catch (e) {
      console.error("Sign in error:", e);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  // ============================================================
  // MOCK SIGN UP — Replace with actual API call to your database
  // Example: const response = await fetch('/api/auth/register', { ... })
  // ============================================================
  const signUp = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Basic validation
      if (!fullName || !email || !password) {
        return { success: false, error: "Please fill in all fields." };
      }

      // ADDED: Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Please enter a valid email address." };
      }

      // ADDED: Password minimum length check
      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };
      }

      // ADDED: Full name minimum length check
      if (fullName.trim().length < 2) {
        return { success: false, error: "Please enter your full name." };
      }

      // Mock success — create user with provided info
      const mockUser: User = {
        email: email,
        fullName: fullName,
      };

      setUser(mockUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      return { success: true };
    } catch (e) {
      console.error("Sign up error:", e);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthProvider;
