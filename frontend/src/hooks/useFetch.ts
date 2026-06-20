import { useState, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic data-fetching hook
 * @example
 *   const { data, loading, error, execute } = useFetch<User[]>();
 *   useEffect(() => { execute(() => userService.getAllUsers()); }, []);
 */
export const useFetch = <T>() => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'An error occurred';
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
};
