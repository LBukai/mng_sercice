import { useState, useCallback } from 'react';
import { User } from '@/types/user';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useWorkspaceUsers = (workspaceId: string) => {
  const [workspaceUsers, setWorkspaceUsers] = useState<(User | { user: User })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchWorkspaceUsers = useCallback(async () => {
    if (!workspaceId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/workspaces/${workspaceId}/users`);
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to load workspace users');
      }
      
      const data = await res.json();
      
      if (!data) {
        setWorkspaceUsers([]);
        return [];
      }
      
      setWorkspaceUsers(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch workspace users: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch workspace users: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, showAlert]);

  const addUsersToWorkspace = useCallback(async (userIds: string[]) => {
    if (!workspaceId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const payload = userIds.map(userId => ({
        user_id: parseInt(userId, 10) // Convert to number as per API spec
      }));
      
      const res = await fetch(`/api/workspaces/${workspaceId}/users`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        await handleApiError(res, `Failed to add users (${res.status})`);
      }
      
      showAlert('success', 'Users added to workspace successfully');
      
      await fetchWorkspaceUsers();
      
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to add users to workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to add users to workspace: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, fetchWorkspaceUsers, showAlert]);

  const removeUserFromWorkspace = useCallback(async (userId: string) => {
    if (!workspaceId || !userId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/workspaces/${workspaceId}/users/${userId}`, { method: 'DELETE' });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to remove user from workspace');
      }
      
      showAlert('success', 'User removed from workspace successfully');
      
      setWorkspaceUsers(prev => 
        prev.filter(userData => {
          const user = 'user' in userData ? userData.user : userData;
          return user.id !== userId;
        })
      );
      
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to remove user from workspace: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to remove user from workspace: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, showAlert]);

  return {
    workspaceUsers,
    isLoading,
    error,
    fetchWorkspaceUsers,
    addUsersToWorkspace,
    removeUserFromWorkspace
  };
};