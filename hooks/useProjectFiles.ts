import { useState, useCallback } from 'react';
import { File } from '@/types/file';
import { fileApiService } from '@/services/fileApi';
import { useAlert } from '@/contexts/AlertContext';

interface FileUploadData {
  files: FileList;
  ttl: string;
}

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

  const uploadFilesToProject = useCallback(async (data: FileUploadData) => {
    if (!projectId || !data.files.length) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const uploadedFiles = await fileApiService.uploadFilesToProject(projectId, data);
      showAlert('success', `${data.files.length} file(s) uploaded successfully`);
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

  const removeFileFromProject = useCallback(async (fileId: string) => {
    if (!projectId || !fileId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove file from project: ${response.statusText}`);
      }

      showAlert('success', 'File removed from project successfully');
      
      // Update the local state to remove the file
      setProjectFiles(prev => prev.filter(file => file.id !== fileId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to remove file from project: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  return {
    projectFiles,
    isLoading,
    error,
    fetchProjectFiles,
    uploadFilesToProject,
    removeFileFromProject,
  };
};