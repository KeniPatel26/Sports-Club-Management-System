import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data fetching hook with loading, data, error, and refetch capability
 */
export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFunction();
      if (res && res.success !== undefined) {
        setData(res.data);
      } else {
        setData(res);
      }
    } catch (err) {
      console.error('useFetch error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute, setData };
};

export default useFetch;
