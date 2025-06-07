import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiResponse, ApiError } from '../lib/api';

// Generic API hook for data fetching
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const executeCall = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || response.message || 'Unknown error');
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Network error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    
    executeCall();
  }, [apiCall, ...dependencies]);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || response.message || 'Unknown error');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, ...dependencies]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}

// Hook for mutations (POST, PUT, DELETE)
export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(params);
      
      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || response.message || 'Unknown error';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        throw err;
      } else {
        const errorMsg = 'Network error occurred';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}