// hooks/useWorkspaceFiles.ts
import { useState, useCallback, useEffect } from 'react';
import { ProjectFile } from '../types/file';
import workspaceFileApiService from '../services/workspaceFileApi';
import { useAlert } from '../contexts/AlertContext';

export const useWorkspaceFiles = (workspaceId: number) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchFiles = useCallback(async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceFileApiService.getWorkspaceFiles(workspaceId);
      setFiles(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching workspace files';
      setError(errorMessage);
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, showAlert]);

  const addFiles = useCallback(async (fileIds: string[]): Promise<boolean> => {
    if (!workspaceId || fileIds.length === 0) return false;
    
    setLoading(true);
    try {
      await workspaceFileApiService.addFilesToWorkspace(workspaceId, fileIds);
      showAlert('success', 'Files added to workspace successfully');
      await fetchFiles(); // Refresh the file list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding files to workspace';
      showAlert('error', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, fetchFiles, showAlert]);

  const removeFile = useCallback(async (fileId: string) => {
    if (!workspaceId) return false;
    
    try {
      await workspaceFileApiService.removeFileFromWorkspace(workspaceId, fileId);
      showAlert('success', 'File removed from workspace successfully');
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error removing file from workspace';
      showAlert('error', errorMessage);
      return false;
    }
  }, [workspaceId, showAlert]);

  useEffect(() => {
    if (workspaceId) {
      fetchFiles();
    }
  }, [workspaceId, fetchFiles]);

  return {
    files,
    loading,
    error,
    fetchFiles,
    addFiles,
    removeFile
  };
};

export default useWorkspaceFiles;