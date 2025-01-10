import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setAuth: (token) => {
        //   console.log('Setting auth:', { token });
        set({ token });
      },
      logout: () => set({ token: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
