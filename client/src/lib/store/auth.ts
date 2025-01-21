import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


interface User {
  id: string;
  email: string;
  username: string; // Fix typo from 'usernmae'
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set): AuthState => ({
      token: null,
      user: null,
      setAuth: (token: string, user: User): void => {
        //   console.log('Setting auth:', { token });
        set({ token, user });
      },
      logout: (): void => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
