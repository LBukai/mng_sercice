import { useState, useCallback } from 'react';
import { File } from '@/types/file';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useWorkspaceFiles = (workspaceId: string) => {
  const [workspaceFiles, setWorkspaceFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchWorkspaceFiles = useCallback(async () => {
    if (!workspaceId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/workspaces/${workspaceId}/files`);
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to load workspace files');
      }
      
      const data = await res.json();
      if (!data) {
        setWorkspaceFiles([]);
        return [];
      }
      setWorkspaceFiles(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch workspace files: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch workspace files: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, showAlert]);

  const addFilesToWorkspace = useCallback(async (fileIds: string[]) => {
    if (!workspaceId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = fileIds.map(fileId => ({
        id: parseInt(fileId, 10) // Convert to number as per API spec
      }));
      
      const res = await fetch(`/api/workspaces/${workspaceId}/files`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        await handleApiError(res, `Failed to add files (${res.status}: ${res.statusText})`);
      }
            
      showAlert('success', 'Files added to workspace successfully');
      await fetchWorkspaceFiles();
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to add files to workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to add files to workspace: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, fetchWorkspaceFiles, showAlert]);

  const removeFileFromWorkspace = useCallback(async (fileId: string) => {
    if (!workspaceId || !fileId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}`, { method: 'DELETE' });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to remove file from workspace');
      }
      
      showAlert('success', 'File removed from workspace successfully');
      
      setWorkspaceFiles(prev => prev.filter(file => file.id !== fileId));
      
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to remove file from workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to remove file from workspace: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, showAlert]);

  return {
    workspaceFiles,
    isLoading,
    error,
    fetchWorkspaceFiles,
    addFilesToWorkspace,
    removeFileFromWorkspace
  };
};