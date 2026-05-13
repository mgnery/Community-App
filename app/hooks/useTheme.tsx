import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";
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
  primaryHover: string;
  background: string;
  card: string;
  cardElevated: string;
  border: string;
  divider: string;
  foreground: string;
  mutedForeground: string;
  muted: string;
  inputBg: string;
  success: string;
  warning: string;
  danger: string;
  tabBar: string;
  tabBorder: string;
  headerBg: string;
  headerGradientEnd: string;
  headerText: string;
  headerSubtext: string;
  shadow: object;
  shadowSm: object;
}

// Platform-aware shadow factory
const makeShadow = (elevation: number, color: string = "#000") => Platform.select({
  ios: {
    shadowColor: color,
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: elevation * 0.018,
    shadowRadius: elevation * 0.8,
  },
  android: { elevation },
  default: {
    shadowColor: color,
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: elevation * 0.015,
    shadowRadius: elevation * 0.8,
  },
}) as object;

export const themeColors: Record<string, ThemeColors> = {
  light: {
    primary: "#1a56a8",
    primaryLight: "rgba(26,86,168,0.08)",
    primaryHover: "#144a91",
    background: "#f5f6f8",
    card: "#ffffff",
    cardElevated: "#ffffff",
    border: "#e8eaee",
    divider: "#f0f1f3",
    foreground: "#0f1729",
    mutedForeground: "#64748b",
    muted: "#f1f3f5",
    inputBg: "#f8f9fb",
    success: "#22c55e",
    warning: "#f97316",
    danger: "#dc2626",
    tabBar: "#ffffff",
    tabBorder: "transparent",
    headerBg: "#1a56a8",
    headerGradientEnd: "#1e63be",
    headerText: "#ffffff",
    headerSubtext: "rgba(255,255,255,0.85)",
    shadow: makeShadow(6),
    shadowSm: makeShadow(3),
  },
  dark: {
    primary: "#5b9bd5",
    primaryLight: "rgba(91,155,213,0.12)",
    primaryHover: "#4a8ac4",
    background: "#0f1117",
    card: "#1a1d25",
    cardElevated: "#1e2129",
    border: "#282d38",
    divider: "#21252e",
    foreground: "#eceef1",
    mutedForeground: "#8892a0",
    muted: "#1e222b",
    inputBg: "#161921",
    success: "#4ade80",
    warning: "#fb923c",
    danger: "#f87171",
    tabBar: "#1a1d25",
    tabBorder: "transparent",
    headerBg: "#1a1d25",
    headerGradientEnd: "#1e222b",
    headerText: "#eceef1",
    headerSubtext: "rgba(236,238,241,0.65)",
    shadow: makeShadow(4, "#000"),
    shadowSm: makeShadow(2, "#000"),
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