// hooks/useArchGPT.ts
import { useState, useCallback } from 'react';
import { workspaceApiService } from '@/services/workspaceApi';
import { ArchGPTWorkspaceRequest } from '@/types/archgpt';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useArchGPT = () => {
  const [archGPTModes, setArchGPTModes] = useState<string[]>([]);
  const [isLoadingModes, setIsLoadingModes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchArchGPTModes = useCallback(async () => {
    try {
      setIsLoadingModes(true);
      setError(null);
      const modes = await workspaceApiService.getArchGPTModes();
      setArchGPTModes(modes);
      return modes;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch ArchGPT modes: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch ArchGPT modes: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoadingModes(false);
    }
  }, [showAlert]);

  const createArchGPTWorkspace = useCallback(async (
    projectId: string, 
    workspaceData: ArchGPTWorkspaceRequest
  ) => {
    try {
      setError(null);
      await workspaceApiService.createArchGPTWorkspace(projectId, workspaceData);
      showAlert('success', 'ArchGPT workspace created successfully');
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to create ArchGPT workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to create ArchGPT workspace: ${errorMessage}`);
      }
      return false;
    }
  }, [showAlert]);

  return {
    archGPTModes,
    isLoadingModes,
    error,
    fetchArchGPTModes,
    createArchGPTWorkspace,
  };
};