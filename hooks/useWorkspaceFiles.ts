import { useState, useCallback } from 'react';
import { File } from '@/types/file';
import { useAlert } from '@/contexts/AlertContext';

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load workspace files');
      if (!data) {
        setWorkspaceFiles([]);
        return [];
      }
      setWorkspaceFiles(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch workspace files: ${errorMessage}`);
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
      
      // Convert to the format expected by the API according to OpenAPI spec
      // POST /workspaces/{workspace_id}/files expects array of File objects with id
      const payload = fileIds.map(fileId => ({
        id: parseInt(fileId, 10) // Convert to number as per API spec
      }));
      
      console.log('Adding files to workspace:', workspaceId);
      console.log('Payload:', payload);
      console.log('Original fileIds:', fileIds);
      
      const res = await fetch(`/api/workspaces/${workspaceId}/files`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      let errorData;
      try {
        errorData = await res.json();
        console.log('Response data:', errorData);
      } catch (parseError) {
        console.log('Failed to parse response as JSON:', parseError);
        errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
      }
      
      if (!res.ok) {
        console.error('Request failed:', {
          status: res.status,
          statusText: res.statusText,
          errorData,
          sentPayload: payload,
          url: `/api/workspaces/${workspaceId}/files`
        });
        
        throw new Error(errorData.error || `Failed to add files (${res.status}: ${res.statusText})`);
      }
      
      console.log('Success response:', errorData);
      
      showAlert('success', 'Files added to workspace successfully');
      // Refresh the workspace files list
      await fetchWorkspaceFiles();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Full error details:', err);
      setError(errorMessage);
      showAlert('error', `Failed to add files to workspace: ${errorMessage}`);
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
      if (!res.ok) throw new Error('Failed to remove file from workspace');
      showAlert('success', 'File removed from workspace successfully');
      
      // Update the local state
      setWorkspaceFiles(prev => prev.filter(file => file.id !== fileId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to remove file from workspace: ${errorMessage}`);
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