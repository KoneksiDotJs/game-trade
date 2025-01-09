import {create} from 'zustand'
import {persist} from 'zustand/middleware'

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create(
    persist<AuthState>(
        (set) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({token, user}),
            logout: () => set({token: null, user: null})
        }),
        {
            name: 'auth-storage'
        }
    )
)