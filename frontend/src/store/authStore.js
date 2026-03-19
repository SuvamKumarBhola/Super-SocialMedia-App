import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  activeOrgId: localStorage.getItem('activeOrgId') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, activeOrgId, ...userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('activeOrgId', activeOrgId);
      set({ user: userData, token, activeOrgId, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token, activeOrgId, ...userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('activeOrgId', activeOrgId);
      set({ user: userData, token, activeOrgId, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeOrgId');
    set({ user: null, token: null, activeOrgId: null });
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to fetch profile', error);
      get().logout();
    }
  }
}));

export default useAuthStore;
