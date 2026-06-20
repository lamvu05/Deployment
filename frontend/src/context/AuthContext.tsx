import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService } from '../services/authService';
import type { AuthState, LoginPayload, RegisterPayload, User } from '../types';

// ── State & Actions ──────────────────────────────────────────────
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
};

// ── Context ───────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  updateProfileState: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Rehydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'AUTH_FAILURE' });
      return;
    }
    dispatch({ type: 'AUTH_START' });
    authService
      .getMe()
      .then((user) => dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } }))
      .catch(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_FAILURE' });
      });
  }, []);

  const login = async (payload: LoginPayload) => {
    dispatch({ type: 'AUTH_START' });
    const { user, token } = await authService.login(payload);
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
  };

  const register = async (payload: RegisterPayload) => {
    dispatch({ type: 'AUTH_START' });
    const { user, token } = await authService.register(payload);
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
  };

  const googleLogin = async (idToken: string) => {
    dispatch({ type: 'AUTH_START' });
    const { user, token } = await authService.googleLogin(idToken);
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
  };

  const updateProfileState = (updatedUser: User) => {
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, updateProfileState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────
export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
