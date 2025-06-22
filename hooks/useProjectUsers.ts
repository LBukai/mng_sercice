import { useState, useCallback } from 'react';
import { projectApiService } from '@/services/projectApi';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserAndRole, ProjectRole, ProjectUser, ProjectRoleDefinition } from '@/types/projectUser';

export const useProjectUsers = (projectId: string) => {
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const { isLoggingOut } = useAuth();

  const fetchProjectUsers = useCallback(async () => {
    if (!projectId || isLoggingOut) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectApiService.getProjectUsers(projectId);
      console.log("TEST", "useProjectUsers", data);
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
  }, [projectId, showAlert, isLoggingOut]);

  const addUsersToProject = useCallback(async (usersData: UserAndRole[]) => {
    if (!projectId || isLoggingOut) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      await projectApiService.addUsersToProject(projectId, usersData);
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
  }, [projectId, fetchProjectUsers, showAlert, isLoggingOut]);

  const updateUserRole = useCallback(async (userId: string, role: ProjectRole) => {
    if (!projectId || !userId || isLoggingOut) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      // The API service sends just the role value
      await projectApiService.updateUserRole(projectId, userId, role);
      showAlert('success', 'User role updated successfully');
      
      // Fetch updated project users rather than trying to update the state manually
      // This ensures the data structure matches what the API returns
      await fetchProjectUsers();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to update user role: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showAlert, isLoggingOut, fetchProjectUsers]);

  const removeUserFromProject = useCallback(async (userId: string) => {
    if (!projectId || !userId || isLoggingOut) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      await projectApiService.removeUserFromProject(projectId, userId);
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
  }, [projectId, showAlert, isLoggingOut]);

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