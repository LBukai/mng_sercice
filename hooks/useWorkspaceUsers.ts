import { useState, useCallback } from 'react';
import { User } from '@/types/user';
import { useAlert } from '@/contexts/AlertContext';

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
      console.log('Fetching workspace users for workspace:', workspaceId);
      
      const res = await fetch(`/api/workspaces/${workspaceId}/users`);
      const data = await res.json();
      
      console.log('Workspace users response:', { status: res.status, data });
      
      if (!res.ok) throw new Error(data.error || 'Failed to load workspace users');
      if (!data) {
        console.log('No data returned, setting empty array');
        setWorkspaceUsers([]);
        return [];
      }
      
      console.log('Setting workspace users:', data);
      setWorkspaceUsers(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching workspace users:', err);
      setError(errorMessage);
      showAlert('error', `Failed to fetch workspace users: ${errorMessage}`);
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
      
      // Convert to the format expected by the API according to OpenAPI spec
      // POST /workspaces/{workspace_id}/users expects array of UserAndRole objects
      const payload = userIds.map(userId => ({
        user_id: parseInt(userId, 10) // Convert to number as per API spec
      }));
      
      console.log('Adding users to workspace:', workspaceId);
      console.log('Payload:', payload);
      
      const res = await fetch(`/api/workspaces/${workspaceId}/users`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Request failed:', {
          status: res.status,
          statusText: res.statusText,
          errorData,
          sentPayload: payload
        });
        
        throw new Error(errorData.error || `Failed to add users (${res.status})`);
      }
      
      const data = await res.json();
      console.log('Success response:', data);
      
      showAlert('success', 'Users added to workspace successfully');
      
      // Refresh the workspace users list
      await fetchWorkspaceUsers();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to add users to workspace: ${errorMessage}`);
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
      if (!res.ok) throw new Error('Failed to remove user from workspace');
      showAlert('success', 'User removed from workspace successfully');
      
      // Update the local state - need to handle both user formats
      setWorkspaceUsers(prev => 
        prev.filter(userData => {
          // Type guard to check if userData has a 'user' property
          const user = 'user' in userData ? userData.user : userData;
          return user.id !== userId;
        })
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to remove user from workspace: ${errorMessage}`);
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