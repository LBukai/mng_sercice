import { useState, useCallback } from 'react';
import { Project } from '@/types/project';
import { projectApiService } from '@/services/projectApi';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const { isLoggingOut } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (isLoggingOut) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectApiService.getProjects();
      setProjects(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch projects: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, isLoggingOut]);

  const getProjectById = useCallback(async (id: string) => {
    if (isLoggingOut) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectApiService.getProjectById(id);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch project: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, isLoggingOut]);

  const createProject = useCallback(async (projectData: Omit<Project, 'id'>) => {
    if (isLoggingOut) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      const newProject = await projectApiService.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      showAlert('success', 'Project created successfully');
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to create project: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, isLoggingOut]);

  const updateProject = useCallback(async (id: string, projectData: Partial<Project>) => {
    if (isLoggingOut) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      const updatedProject = await projectApiService.updateProject(id, projectData);
      setProjects(prev => 
        prev.map(project => project.id === id ? { ...project, ...updatedProject } : project)
      );
      showAlert('success', 'Project updated successfully');
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to update project: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, isLoggingOut]);

  const deleteProject = useCallback(async (id: string) => {
    if (isLoggingOut) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      await projectApiService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      showAlert('success', 'Project deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to delete project: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, isLoggingOut]);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
  };
};