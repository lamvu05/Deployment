import { useState, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import type { LoginPayload, RegisterPayload } from '../types';

/**
 * Custom hook for auth actions with loading and error state
 */
export const useAuth = () => {
  const { login, register, googleLogin, logout, user, isAuthenticated, isLoading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      try {
        setSubmitting(true);
        setError(null);
        await login(payload);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Login failed. Please try again.';
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [login]
  );

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      try {
        setSubmitting(true);
        setError(null);
        await register(payload);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Registration failed. Please try again.';
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [register]
  );

  const handleGoogleLogin = useCallback(
    async (idToken: string) => {
      try {
        setSubmitting(true);
        setError(null);
        await googleLogin(idToken);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Google Login failed. Please try again.';
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [googleLogin]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    submitting,
    error,
    login: handleLogin,
    register: handleRegister,
    googleLogin: handleGoogleLogin,
    logout,
  };
};
