// hooks/useWorkspaceUsers.ts
import { useState, useCallback, useEffect } from 'react';
import { WorkspaceUser, UserAndRole } from '@/types/workspaceUser';
import { 
  getWorkspaceUsers, 
  addUsersToWorkspace, 
  removeUserFromWorkspace,
  updateWorkspaceUserRole
} from '@/services/workspaceUserApi';
import { useAlert } from '@/contexts/AlertContext';

export const useWorkspaceUsers = (workspaceId: number) => {
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchWorkspaceUsers = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getWorkspaceUsers(workspaceId);
      setWorkspaceUsers(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch workspace users: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, showAlert]);

  useEffect(() => {
    fetchWorkspaceUsers();
  }, [fetchWorkspaceUsers]);

  const addUsers = useCallback(async (users: UserAndRole[]) => {
    try {
      setIsLoading(true);
      setError(null);
      await addUsersToWorkspace(workspaceId, users);
      showAlert('success', 'Users added to workspace successfully');
      await fetchWorkspaceUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to add users to workspace: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, fetchWorkspaceUsers, showAlert]);

  const removeUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await removeUserFromWorkspace(workspaceId, userId);
      showAlert('success', 'User removed from workspace successfully');
      await fetchWorkspaceUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to remove user from workspace: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, fetchWorkspaceUsers, showAlert]);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateWorkspaceUserRole(workspaceId, userId, role);
      showAlert('success', 'User role updated successfully');
      await fetchWorkspaceUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to update user role: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, fetchWorkspaceUsers, showAlert]);

  return {
    workspaceUsers,
    isLoading,
    error,
    fetchWorkspaceUsers,
    addUsers,
    removeUser,
    updateUserRole,
  };
};