// hooks/useWorkspaces.ts
import { useState, useCallback, useEffect } from 'react';
import { Workspace } from '@/types/workspace';
import { 
  getProjectWorkspaces, 
  addWorkspaceToProject, 
  deleteWorkspace 
} from '@/services/workspaceApi';
import { useAlert } from '@/contexts/AlertContext';

export const useWorkspaces = (projectId: string) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchWorkspaces = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProjectWorkspaces(Number(projectId));
      setWorkspaces(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch workspaces: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const addWorkspace = useCallback(async (workspace: Workspace) => {
    try {
      setIsLoading(true);
      setError(null);
      await addWorkspaceToProject(Number(projectId), workspace);
      showAlert('success', 'Workspace added successfully');
      await fetchWorkspaces();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to add workspace: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchWorkspaces, showAlert]);

  const removeWorkspace = useCallback(async (workspaceId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteWorkspace(workspaceId);
      showAlert('success', 'Workspace removed successfully');
      await fetchWorkspaces();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to remove workspace: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWorkspaces, showAlert]);

  return {
    workspaces,
    isLoading,
    error,
    fetchWorkspaces,
    addWorkspace,
    removeWorkspace,
  };
};