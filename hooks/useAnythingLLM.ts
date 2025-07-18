// hooks/useAnythingLLM.ts
import { useState, useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';

interface AnythingLLMResponse {
  token: string;
  redirectUrl: string;
}

export const useAnythingLLM = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const redirectToAnythingLLM = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/anythingllm/auth-token');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get AnythingLLM token: ${response.statusText}`);
      }
      
      const data: AnythingLLMResponse = await response.json();
      
      // Open AnythingLLM in a new tab/window
      window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to open AnythingLLM: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  return {
    redirectToAnythingLLM,
    isLoading,
    error,
  };
};