// hooks/useProjectModels.ts
import { useState, useCallback } from 'react';
import { Model } from '@/types/model';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useProjectModels = (projectId: string) => {
  const [projectModels, setProjectModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchProjectModels = useCallback(async () => {
    if (!projectId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects/${projectId}/models`);
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to load project models');
      }
      
      const data = await res.json();
      if (!data) {
        setProjectModels([]);
        return [];
      }
      setProjectModels(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch project models: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch project models: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  const updateProjectModels = useCallback(async (modelIds: number[]) => {
    if (!projectId) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Wrap the array inside { models: [...] }
      const payload = {
        models: modelIds.map(modelId => ({
          model_id: modelId
        }))
      };

      const res = await fetch(`/api/projects/${projectId}/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        await handleApiError(res, 'Failed to update project models');
      }

      showAlert('success', 'Project models updated successfully');
      await fetchProjectModels();
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update project models: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update project models: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchProjectModels, showAlert]);


  return {
    projectModels,
    isLoading,
    error,
    fetchProjectModels,
    updateProjectModels,
  };
};