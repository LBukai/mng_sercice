import { useState, useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { UserAndRole, ProjectRole, ProjectUser } from '@/types/projectUser';

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
      const data =await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load project users');
      if(!data){
        setProjectUsers(<ProjectUser[]>([]));
        return <ProjectUser[]>([]);
      }
      setProjectUsers(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch project users: ${errorMessage}`);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add users');
      showAlert('success', 'Users added to project successfully');
      // Refresh the project users list
      await fetchProjectUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to add users to project: ${errorMessage}`);
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
      
      // Wrap the role in an object as expected by the API
      const payload = { role: role };
      
      const res = await fetch(`/api/projects/${projectId}/users/${userId}`, { 
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user role');
      }
      
      showAlert('success', 'User role updated successfully');
      
      // Update the local state
      setProjectUsers(prev => 
        prev.map(pu => 
          pu.user.id === userId 
            ? { ...pu, role: { role } } 
            : pu
        )
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to update user role: ${errorMessage}`);
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
      if (!res.ok) throw new Error('Failed to remove user from project');
      showAlert('success', 'User removed from project successfully');
      
      // Update the local state
      setProjectUsers(prev => prev.filter(pu => pu.user.id !== userId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to remove user from project: ${errorMessage}`);
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