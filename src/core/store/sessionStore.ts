import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionState {
  userId: string | null;
  lastActivity: number;
}

export interface SessionActions {
  setUserId: (userId: string) => void;
  updateLastActivity: () => void;
  clearSession: () => void;
}

const initialState: SessionState = {
  userId: null,
  lastActivity: Date.now(),
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,
      setUserId: (userId: string) => set({ userId }),
      updateLastActivity: () => set({ lastActivity: Date.now() }),
      clearSession: () => set({ ...initialState, lastActivity: Date.now() }),
    }),
    {
      name: 'itm-session-state', // unique name
    }
  )
);

