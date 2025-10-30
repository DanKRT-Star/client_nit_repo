import { create } from 'zustand';
import { type User } from '../util/authUtils';
import { getCurrentUserService } from '../api/authApi';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  checkAuth: async () => {
  const token = localStorage.getItem('token');
  if (!token) return null; 

  try {
    const user = await getCurrentUserService();
    set({ user });
    return user;
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('token');
    return null;
  }
},

}));