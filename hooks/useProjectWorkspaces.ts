import { useState, useCallback } from 'react';
import { Workspace } from '@/types/workspace';
import { workspaceApiService } from '@/services/workspaceApi';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

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
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch project workspaces: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch project workspaces: ${errorMessage}`);
      }
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
      await fetchProjectWorkspaces();
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to add workspaces to project: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to add workspaces to project: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchProjectWorkspaces, showAlert]);

  const removeWorkspaceFromProject = useCallback(async (workspaceId: string) => {
    if (!projectId || !workspaceId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/workspaces/${workspaceId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to delete workspace');
      }
      
      showAlert('success', 'Workspace deleted successfully');
      
      setProjectWorkspaces(prev => prev.filter(workspace => workspace.id !== workspaceId));
      
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to delete workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to delete workspace: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  return {
    projectWorkspaces,
    isLoading,
    error,
    fetchProjectWorkspaces,
    addWorkspacesToProject,
    removeWorkspaceFromProject,
  };
};