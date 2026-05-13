import { createContext, useContext, useCallback, useRef, ReactNode } from "react";

/**
 * Simple event emitter for tab-press reset signals.
 * When a tab icon is pressed while already on that tab,
 * the screen should reset its view to the default state
 * (e.g. go back from "create report" to the reports list).
 */

type Listener = () => void;
type TabName = string;

interface TabResetContextType {
  /** Emit a reset signal for a given tab */
  emit: (tabName: TabName) => void;
  /** Subscribe to reset signals. Returns an unsubscribe function. */
  subscribe: (tabName: TabName, listener: Listener) => () => void;
}

const TabResetContext = createContext<TabResetContextType | undefined>(undefined);

export function TabResetProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef<Map<TabName, Set<Listener>>>(new Map());

  const emit = useCallback((tabName: TabName) => {
    const listeners = listenersRef.current.get(tabName);
    if (listeners) {
      listeners.forEach((fn) => fn());
    }
  }, []);

  const subscribe = useCallback((tabName: TabName, listener: Listener) => {
    if (!listenersRef.current.has(tabName)) {
      listenersRef.current.set(tabName, new Set());
    }
    listenersRef.current.get(tabName)!.add(listener);

    return () => {
      listenersRef.current.get(tabName)?.delete(listener);
    };
  }, []);

  return (
    <TabResetContext.Provider value={{ emit, subscribe }}>
      {children}
    </TabResetContext.Provider>
  );
}

export function useTabReset() {
  const context = useContext(TabResetContext);
  if (!context) {
    throw new Error("useTabReset must be used within TabResetProvider");
  }
  return context;
}

export default TabResetProvider;
