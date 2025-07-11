import { useState, useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { UserAndRole, ProjectRole, ProjectUser } from '@/types/projectUser';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useProjectUsers = (projectId: string) => {
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchProjectUsers = useCallback(async () => {
    if (!projectId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects/${projectId}/users`);
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to load project users');
      }
      
      const data = await res.json();
      if (!data) {
        setProjectUsers([]);
        return [];
      }
      setProjectUsers(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch project users: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch project users: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  const addUsersToProject = useCallback(async (usersData: UserAndRole[]) => {
    if (!projectId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects/${projectId}/users`, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usersData) 
      });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to add users');
      }
      
      showAlert('success', 'Users added to project successfully');
      await fetchProjectUsers();
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to add users to project: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to add users to project: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchProjectUsers, showAlert]);

  const updateUserRole = useCallback(async (userId: string, role: ProjectRole) => {
    if (!projectId || !userId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = { role: role };
      
      const res = await fetch(`/api/projects/${projectId}/users/${userId}`, { 
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to update user role');
      }
      
      showAlert('success', 'User role updated successfully');
      
      setProjectUsers(prev => 
        prev.map(pu => 
          pu.user.id === userId 
            ? { ...pu, role: { role } } 
            : pu
        )
      );
      
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update user role: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update user role: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  const removeUserFromProject = useCallback(async (userId: string) => {
    if (!projectId || !userId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects/${projectId}/users/${userId}`, { method: 'DELETE' });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to remove user from project');
      }
      
      showAlert('success', 'User removed from project successfully');
      
      setProjectUsers(prev => prev.filter(pu => pu.user.id !== userId));
      
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to remove user from project: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to remove user from project: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert]);

  return {
    projectUsers,
    isLoading,
    error,
    fetchProjectUsers,
    addUsersToProject,
    updateUserRole,
    removeUserFromProject
  };
};