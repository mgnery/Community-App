import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../../lib/supabase";

export interface User {
  email: string;
  fullName: string;
  phone: string;
  purok: string;
  barangay: string;
  residentId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the profile from the database given an auth user
  const fetchProfile = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      if (profile) {
        setUser({
          email: profile.email || authUser.email || "",
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          purok: profile.purok || "",
          barangay: profile.barangay || "",
          residentId: profile.resident_id || "",
        });
      } else {
        // Fallback if profile doesn't exist yet (e.g. immediately after signup if trigger is slow)
        setUser({
          email: authUser.email || "",
          fullName: authUser.user_metadata?.full_name || "New Resident",
          phone: "",
          purok: "",
          barangay: "",
          residentId: authUser.user_metadata?.resident_id || "",
        });
      }
    } catch (e) {
      console.error("Profile fetch exception:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setIsLoading(true);
          await fetchProfile(session?.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, error: "Please fill in all fields." };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error("Sign in error:", e);
      return { success: false, error: e.message || "An unexpected error occurred." };
    }
  };

  const signUp = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!fullName || !email || !password) {
        return { success: false, error: "Please fill in all fields." };
      }

      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters." };
      }

      const residentId = `BI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            resident_id: residentId,
          },
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error("Sign up error:", e);
      return { success: false, error: e.message || "An unexpected error occurred." };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (
    updates: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: "Not authenticated." };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: false, error: "Session expired." };

      // Map User interface back to database columns
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.purok !== undefined) dbUpdates.purok = updates.purok;
      if (updates.barangay !== undefined) dbUpdates.barangay = updates.barangay;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", session.user.id);

      if (error) throw error;

      // Update local state to reflect changes immediately
      setUser({ ...user, ...updates });
      return { success: true };
    } catch (e: any) {
      console.error("Update profile error:", e);
      return { success: false, error: e.message || "Failed to update profile." };
    }
  };

  const changePassword = async (
    currentPassword: string, // current password isn't strictly needed for supabase.auth.updateUser but keeping it for UI compatibility
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "New password must be at least 6 characters." };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error("Change password error:", e);
      return { success: false, error: e.message || "Failed to change password." };
    }
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
        updateProfile,
        changePassword,
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
