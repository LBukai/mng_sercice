import { useState, useCallback } from 'react';
import { Workspace } from '@/types/workspace';
import { useAlert } from '@/contexts/AlertContext';

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load workspace');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch workspace: ${errorMessage}`);
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