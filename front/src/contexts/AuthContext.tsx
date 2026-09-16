import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  // useCallback with empty deps: only calls stable state setters and
  // localStorage, so identity never needs to change between renders.
  const applyTokens = useCallback(
    (access: string, refresh: string, userPayload: User) => {
      setAccessToken(access);
      setUser(userPayload);
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
      localStorage.setItem(USER_KEY, JSON.stringify(userPayload));
      setAuthHeader(access);
    },
    [],
  );

  const clearTokens = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthHeader(null);
  }, []);

  /** Use the stored refresh token to get a fresh access token. */
  const refreshAccess = async (): Promise<string | null> => {
    const attemptedRefresh = localStorage.getItem(REFRESH_KEY);
    if (!attemptedRefresh) return null;
    try {
      const res = await axios.post(
        API_ENDPOINTS.refresh,
        { refresh: attemptedRefresh },
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
      // The backend now blacklists a refresh token the instant it's rotated
      // (see settings.SIMPLE_JWT). Two tabs sharing one refresh token in
      // localStorage can race: both read the same token, one wins and
      // rotates it, the other's identical request gets rejected as
      // already-used. That's not a real auth failure - if localStorage now
      // holds a *different* refresh token than the one we just sent, the
      // sibling tab already won this race. Adopt its fresh access token
      // instead of logging the user out (and instead of clearTokens()
      // wiping the sibling's still-valid session out from under it).
      const currentRefresh = localStorage.getItem(REFRESH_KEY);
      const currentAccess = localStorage.getItem(ACCESS_KEY);
      if (
        currentRefresh &&
        currentAccess &&
        currentRefresh !== attemptedRefresh
      ) {
        setAccessToken(currentAccess);
        setAuthHeader(currentAccess);
        return currentAccess;
      }
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
  }, [clearTokens]);

  const login = useCallback(
    async (
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
    },
    [applyTokens],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Send the refresh token so the server can blacklist it - logout now
      // actually ends the session server-side, not just locally. Read from
      // localStorage rather than closing over a stale value.
      if (accessToken) {
        const refresh = localStorage.getItem(REFRESH_KEY);
        await axios.post(API_ENDPOINTS.logout, refresh ? { refresh } : {});
      }
    } catch {
      // Ignore network errors on logout - tokens get cleared locally either way.
    } finally {
      clearTokens();
    }
  }, [accessToken, clearTokens]);

  const register = useCallback(
    async (
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
          error:
            err.response?.data?.error || "Network error. Please try again.",
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Memoized so consumers only re-render when one of these actually changes,
  // not on every AuthProvider render (e.g. from an unrelated route change).
  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && !!accessToken,
      loading,
      login,
      logout,
      register,
    }),
    [user, accessToken, loading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
