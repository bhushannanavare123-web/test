import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Placeholder state - will be expanded later
  user: null,
  isLoading: false,
  error: null,
  
  // Placeholder actions - will be implemented later
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useAppStore;
