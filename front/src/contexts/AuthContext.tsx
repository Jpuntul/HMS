import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "../config/api";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (
    userData: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

const ACCESS_KEY = "hms_access";
const REFRESH_KEY = "hms_refresh";
const USER_KEY = "hms_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/** Helper: tag a config so the response interceptor doesn't retry it twice. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const setAuthHeader = (access: string | null) => {
  if (access) {
    axios.defaults.headers.common.Authorization = `Bearer ${access}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Access token lives in state for re-renders; refresh lives in localStorage
  // because it's only consumed by the interceptor when access expires.
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Guard against simultaneous 401s racing to refresh: only one refresh in
  // flight at a time, every other retry waits on its promise.
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const applyTokens = (access: string, refresh: string, userPayload: User) => {
    setAccessToken(access);
    setUser(userPayload);
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(userPayload));
    setAuthHeader(access);
  };

  const clearTokens = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthHeader(null);
  };

  /** Use the stored refresh token to get a fresh access token. */
  const refreshAccess = async (): Promise<string | null> => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    try {
      const res = await axios.post(
        API_ENDPOINTS.refresh,
        { refresh },
        // bypass the default Authorization header for the refresh call itself
        { headers: { Authorization: "" } },
      );
      const newAccess: string = res.data.access;
      const newRefresh: string | undefined = res.data.refresh;
      localStorage.setItem(ACCESS_KEY, newAccess);
      if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
      setAccessToken(newAccess);
      setAuthHeader(newAccess);
      return newAccess;
    } catch {
      return null;
    }
  };

  // Restore session + install axios interceptors exactly once.
  useEffect(() => {
    const savedAccess = localStorage.getItem(ACCESS_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedAccess && savedUser) {
      try {
        setAccessToken(savedAccess);
        setUser(JSON.parse(savedUser));
        setAuthHeader(savedAccess);
      } catch {
        clearTokens();
      }
    }
    setLoading(false);

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as RetriableConfig | undefined;
        if (
          !original ||
          error.response?.status !== 401 ||
          original._retry ||
          // Don't try to refresh the refresh endpoint itself.
          original.url?.includes("/auth/refresh/")
        ) {
          return Promise.reject(error);
        }
        original._retry = true;

        if (!refreshInFlight.current) {
          refreshInFlight.current = refreshAccess().finally(() => {
            refreshInFlight.current = null;
          });
        }
        const newAccess = await refreshInFlight.current;
        if (!newAccess) {
          clearTokens();
          return Promise.reject(error);
        }
        original.headers.Authorization = `Bearer ${newAccess}`;
        return axios(original);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const res = await axios.post(
        API_ENDPOINTS.login,
        { username, password },
        { headers: { Authorization: "" } },
      );
      const { access, refresh, user: userPayload } = res.data;
      if (!access || !refresh || !userPayload) {
        return { success: false, error: "Unexpected response from server" };
      }
      applyTokens(access, refresh, userPayload);
      return { success: true };
    } catch (error) {
      const err = error as AxiosError<{ detail?: string; error?: string }>;
      return {
        success: false,
        error:
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "Invalid username or password",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Fire-and-forget; the server doesn't actually need to do anything for
      // JWT logout, but the endpoint exists for parity / future hooks.
      if (accessToken) {
        await axios.post(API_ENDPOINTS.logout, {});
      }
    } catch {
      // Ignore network errors on logout - tokens get cleared either way.
    } finally {
      clearTokens();
    }
  };

  const register = async (
    userData: RegisterData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const res = await axios.post(API_ENDPOINTS.register, userData);
      if (res.data?.success) {
        return { success: true };
      }
      return {
        success: false,
        error: res.data?.error || "Registration failed",
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      return {
        success: false,
        error: err.response?.data?.error || "Network error. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!accessToken,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
