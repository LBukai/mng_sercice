// hooks/useProviders.ts
import { useState, useCallback } from 'react';
import { Provider } from '@/types/provider';
import { getProviders, createProvider as createProviderApi, updateProvider as updateProviderApi, deleteProvider as deleteProviderApi, getProviderById as getProviderByIdApi } from '@/services/providerApi';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchProviders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProviders();
      setProviders(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch providers: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch providers: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const getProviderById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProviderByIdApi(id);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch provider: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch provider: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const createProvider = useCallback(async (providerData: Omit<Provider, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newProvider = await createProviderApi(providerData);
      setProviders(prev => [...prev, newProvider]);
      showAlert('success', 'Provider created successfully');
      return newProvider;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to create provider: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to create provider: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateProvider = useCallback(async (id: string, providerData: Partial<Provider>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/providers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerData),
      });

      if (!response.ok) {
        await handleApiError(response, 'Failed to update provider');
      }

      const updatedProvider = await response.json();
      
      setProviders(prev => 
        prev.map(provider => provider.id === id ? { ...provider, ...updatedProvider } : provider)
      );
      showAlert('success', 'Provider updated successfully');
      return updatedProvider;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update provider: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update provider: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const deleteProvider = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteProviderApi(id);
      setProviders(prev => prev.filter(provider => provider.id !== id));
      showAlert('success', 'Provider deleted successfully');
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to delete provider: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to delete provider: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  return {
    providers,
    isLoading,
    error,
    fetchProviders,
    getProviderById,
    createProvider,
    updateProvider,
    deleteProvider,
  };
};