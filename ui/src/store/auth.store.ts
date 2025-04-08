import axios from 'axios';
import { create } from 'zustand';
type LoginResponse = {
  access_token: string;
  is_authenticated: boolean;
}
interface AuthState {
  isAuthenticated: boolean;
  login: ({
    username,
    password,
  }: {
    username: string;
    password: string
  }) => Promise< LoginResponse | null>;
  logout: () => void;
  refreshToken: ({token}: {token: string}) => Promise<LoginResponse | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: async ({ username, password }) => {
    try {
      const response = await axios.post(`http://localhost:5000/login`, {
        username,
        password,
      });
      if (response.status === 200) {
        set({ isAuthenticated: true });
        const { access_token } = response.data as LoginResponse;
        return {
          access_token,
          is_authenticated: true,
        }
      } else {
        set({ isAuthenticated: false });
        return null;
        }
      
    } catch (error) {
      set({ isAuthenticated: false });
      return null;
    }
  },
  logout: () => set({ isAuthenticated: false }),
  refreshToken: async ({token}) => {
    try {
      const response = await axios.post(`http://${window.location.hostname}:5000/refresh`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        set({ isAuthenticated: true });
        const { access_token } = response.data as LoginResponse;
        return {
          access_token,
          is_authenticated: true,
        }
      } else {
        set({ isAuthenticated: false });
        return null;
      }
    } catch (error) {
      set({ isAuthenticated: false });
      return null;
    }
  },
}));
