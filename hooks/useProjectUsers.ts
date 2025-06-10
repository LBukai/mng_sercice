import { useState, useCallback } from 'react';
import { projectApiService } from '@/services/projectApi';
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
      const data = await projectApiService.getProjectUsers(projectId);
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
  }, [projectId, fetchProjectUsers, showAlert]);

  const updateUserRole = useCallback(async (userId: string, role: ProjectRole) => {
    if (!projectId || !userId) return false;
    
    // Add validation for empty role values
    if (!role) {
      console.error("Empty role value passed to updateUserRole");
      showAlert('error', 'Failed to update user role: Empty role value');
      return false;
    }
    
    // Debug log role value
    console.log(`Updating user ${userId} to role:`, role);
    console.log(`Role type: ${typeof role}, value: ${role}`);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Log the current state
      console.log("Current project users before update:", projectUsers);
      
      await projectApiService.updateUserRole(projectId, userId, role);
      showAlert('success', 'User role updated successfully');
      
      // Update the local state using proper immutable pattern
      setProjectUsers(prev => {
        // Create a new array with updated role
        const updated = prev.map(pu => {
          if (pu.user.id === userId) {
            // Important: Create a completely new object with the updated role
            // The role is an object with a role property
            return {
              ...pu,
              role:  role 
            };
          }
          return pu;
        });
        
        console.log("Updated project users after role change:", updated);
        return updated;
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to update user role: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectUsers, showAlert]);

  const removeUserFromProject = useCallback(async (userId: string) => {
    if (!projectId || !userId) return false;
    
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