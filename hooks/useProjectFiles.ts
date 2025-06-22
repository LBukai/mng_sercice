import { useState, useCallback, useEffect } from 'react';
import { ProjectFile } from '../types/file';
import { fileApiService } from '../services/fileApi';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

export const useProjectFiles = (projectId: string) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const { isLoggingOut } = useAuth();

  const fetchFiles = useCallback(async () => {
    if (!projectId || isLoggingOut) return;
    
    setLoading(true);
    try {
      const data = await fileApiService.getProjectFiles(projectId);
      setFiles(data);
    } catch (error) {
      showAlert('error', 'Error fetching files',);
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, showAlert, isLoggingOut]);

  const uploadFile = useCallback(async (file: File, ttl?: string) => {
    if (isLoggingOut) return;
    
    try {
      await fileApiService.uploadFile(projectId, file, ttl);
      showAlert('success', 'File uploaded successfully');
      fetchFiles(); // Refresh the file list
    } catch (error) {
      showAlert('error', 'Error uploading file');
      console.error('Error uploading file:', error);
    }
  }, [projectId, fetchFiles, showAlert, isLoggingOut]);

  const deleteFile = useCallback(async (fileId: string) => {
    if (isLoggingOut) return;
    
    try {
      await fileApiService.deleteFile(projectId, fileId);
      showAlert('success','File deleted successfully');
      fetchFiles(); // Refresh the file list
    } catch (error) {
      showAlert('error', 'Error deleting file');
      console.error('Error deleting file:', error);
    }
  }, [projectId, fetchFiles, showAlert, isLoggingOut]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    loading,
    fetchFiles,
    uploadFile,
    deleteFile,
  };
};