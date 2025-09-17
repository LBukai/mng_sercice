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

  const updateWorkspace = useCallback(async (id: string, workspaceData: Partial<Workspace>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/workspaces/${id}`, { 
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData) 
      });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to update workspace');
      }
      
      const data = await res.json();
      showAlert('success', 'Workspace updated successfully');
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update workspace: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateWorkspaceModel = useCallback(async (id: string, modelId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/workspaces/${id}/model`, { 
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: modelId }) 
      });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to update workspace model');
      }
      
      const data = await res.json();
      showAlert('success', 'Workspace model updated successfully');
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update workspace model: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update workspace model: ${errorMessage}`);
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
    updateWorkspace,
    updateWorkspaceModel,
  };
};