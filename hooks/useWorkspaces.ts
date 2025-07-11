import { useState, useCallback } from 'react';
import { Workspace } from '@/types/workspace';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const getWorkspaceById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/workspaces/${id}`);
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to load workspace');
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch workspace: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  return {
    workspaces,
    isLoading,
    error,
    getWorkspaceById,
  };
};