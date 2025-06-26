import { useState, useCallback } from 'react';
import { Workspace } from '@/types/workspace';
import { workspaceApiService } from '@/services/workspaceApi';
import { useAlert } from '@/contexts/AlertContext';

export const useProjectWorkspaces = (projectId: string) => {
  const [projectWorkspaces, setProjectWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchProjectWorkspaces = useCallback(async () => {
    if (!projectId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await workspaceApiService.getProjectWorkspaces(projectId);
      if (!data) {
        setProjectWorkspaces([]);
        return [];
      }
      setProjectWorkspaces(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch project workspaces: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  const addWorkspacesToProject = useCallback(async (workspacesData: Workspace[]) => {
    if (!projectId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      await workspaceApiService.addWorkspacesToProject(projectId, workspacesData);
      showAlert('success', 'Workspaces added to project successfully');
      // Refresh the project workspaces list
      await fetchProjectWorkspaces();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to add workspaces to project: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchProjectWorkspaces, showAlert]);

  return {
    projectWorkspaces,
    isLoading,
    error,
    fetchProjectWorkspaces,
    addWorkspacesToProject,
  };
};