import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

// ============================================================
// THEME COLOR PALETTES
// These provide all the colors used across the app. Every
// screen reads from useTheme().colors so the entire app
// updates instantly when the user toggles dark mode.
// ============================================================
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  card: string;
  border: string;
  foreground: string;
  mutedForeground: string;
  muted: string;
  success: string;
  warning: string;
  danger: string;
  tabBar: string;
  tabBorder: string;
  headerBg: string;
  headerText: string;
  headerSubtext: string;
}

export const themeColors: Record<string, ThemeColors> = {
  light: {
    primary: "#1a56a8",
    primaryLight: "rgba(26,86,168,0.1)",
    background: "#f9fafb",
    card: "#ffffff",
    border: "#e5e7eb",
    foreground: "#111827",
    mutedForeground: "#6b7280",
    muted: "#f3f4f6",
    success: "#22c55e",
    warning: "#f97316",
    danger: "#dc2626",
    tabBar: "#ffffff",
    tabBorder: "#e5e7eb",
    headerBg: "#1a56a8",
    headerText: "#ffffff",
    headerSubtext: "rgba(255,255,255,0.9)",
  },
  dark: {
    primary: "#5b9bd5",
    primaryLight: "rgba(91,155,213,0.15)",
    background: "#111318",
    card: "#1c1f26",
    border: "#2e333d",
    foreground: "#e8eaed",
    mutedForeground: "#8b929c",
    muted: "#22262e",
    success: "#4ade80",
    warning: "#fb923c",
    danger: "#f87171",
    tabBar: "#1c1f26",
    tabBorder: "#2e333d",
    headerBg: "#1c1f26",
    headerText: "#e8eaed",
    headerSubtext: "rgba(232,234,237,0.7)",
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoaded: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "barangay-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoaded, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export default ThemeProvider;