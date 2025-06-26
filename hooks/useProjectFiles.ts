import { useState, useCallback } from 'react';
import { File } from '@/types/file';
import { fileApiService } from '@/services/fileApi';
import { useAlert } from '@/contexts/AlertContext';

export const useProjectFiles = (projectId: string) => {
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchProjectFiles = useCallback(async () => {
    if (!projectId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await fileApiService.getProjectFiles(projectId);
      if (!data) {
        setProjectFiles([]);
        return [];
      }
      setProjectFiles(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch project files: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  const uploadFilesToProject = useCallback(async (files: FileList) => {
    if (!projectId || !files.length) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      
      const uploadedFiles = await fileApiService.uploadFilesToProject(projectId, formData);
      showAlert('success', 'Files uploaded successfully');
      // Refresh the project files list
      await fetchProjectFiles();
      return uploadedFiles;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to upload files: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchProjectFiles, showAlert]);

  return {
    projectFiles,
    isLoading,
    error,
    fetchProjectFiles,
    uploadFilesToProject,
  };
};