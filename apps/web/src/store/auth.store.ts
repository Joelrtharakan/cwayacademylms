import { create } from "zustand";
import axios from "axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  avatar?: string;
  bio?: string;
  phone?: string;
  church?: string;
  location?: string;
  preferredLanguage?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<string | null>;
  initAuth: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Create custom Axios client
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, token) => {
    set({ user, accessToken: token, isLoading: false });
    // Update Authorization header on default client
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, isLoading: false });
    delete api.defaults.headers.common["Authorization"];
  },

  refreshAccessToken: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      
      // Fetch user profile on successful token refresh
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { user } = userResponse.data;

      get().setAuth(user, accessToken);
      return accessToken;
    } catch (err) {
      get().clearAuth();
      return null;
    }
  },

  initAuth: async () => {
    set({ isLoading: true });
    await get().refreshAccessToken();
    set({ isLoading: false });
  },
}));

// Set up Axios interceptors for handling 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
      originalRequest._retry = true;
      const newAccessToken = await useAuthStore.getState().refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
