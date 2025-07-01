import { useState, useCallback } from 'react';
import { UserProject } from '@/types/userProject';
import { userProjectApiService } from '@/services/userProjectApi';
import { useAlert } from '@/contexts/AlertContext';

export const useUserProjects = () => {
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchUserProjects = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userProjectApiService.getUserProjects(userId);
      // Ensure we always set an array, never null
      setUserProjects(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch user projects: ${errorMessage}`);
      // Set empty array on error to prevent null reference errors
      setUserProjects([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  return {
    userProjects,
    isLoading,
    error,
    fetchUserProjects,
  };
};