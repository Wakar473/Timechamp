import { create } from 'zustand';
import type { User } from '../types';

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    initializeAuth: () => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            const user = JSON.parse(userStr);
            set({ user, token, isAuthenticated: true });
        }
    },
}));
