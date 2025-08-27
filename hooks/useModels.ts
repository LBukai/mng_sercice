// hooks/useModels.ts
import { useState, useCallback } from 'react';
import { Model } from '@/types/model';
import { DefaultModel } from '@/types/defaultModel';
import { getModels, createModel as createModelApi, updateModel as updateModelApi, deleteModel as deleteModelApi, getModelById as getModelByIdApi, getDefaultModel, setDefaultModel } from '@/services/modelApi';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [defaultModel, setDefaultModelState] = useState<DefaultModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getModels();
      setModels(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch models: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch models: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const fetchDefaultModel = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDefaultModel();
      setDefaultModelState(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch default model: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch default model: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const getModelById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getModelByIdApi(id);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch model: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch model: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const createModel = useCallback(async (modelData: Omit<Model, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newModel = await createModelApi(modelData);
      setModels(prev => [...prev, newModel]);
      showAlert('success', 'Model created successfully');
      return newModel;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to create model: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to create model: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateModel = useCallback(async (id: string, modelData: Partial<Model>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/models/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      });

      if (!response.ok) {
        await handleApiError(response, 'Failed to update model');
      }

      const updatedModel = await response.json();
      
      setModels(prev => 
        prev.map(model => model.id === id ? { ...model, ...updatedModel } : model)
      );
      showAlert('success', 'Model updated successfully');
      return updatedModel;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update model: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update model: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const deleteModel = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteModelApi(id);
      setModels(prev => prev.filter(model => model.id !== id));
      showAlert('success', 'Model deleted successfully');
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to delete model: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to delete model: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateDefaultModel = useCallback(async (modelId: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/models/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: modelId }),
      });

      if (!response.ok) {
        await handleApiError(response, 'Failed to set default model');
      }

      // Refresh default model
      await fetchDefaultModel();
      showAlert('success', 'Default model updated successfully');
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to set default model: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to set default model: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, fetchDefaultModel]);

  return {
    models,
    defaultModel,
    isLoading,
    error,
    fetchModels,
    fetchDefaultModel,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
    updateDefaultModel,
  };
};