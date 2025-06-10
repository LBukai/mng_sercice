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

    if (isLoggingOut) return [];// TODO more elegant solution needed

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
  }, [showAlert]);

  const getProjectById = useCallback(async (id: string) => {

    if (isLoggingOut) null;// TODO more elegant solution needed
    
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
  }, [showAlert]);

  const createProject = useCallback(async (projectData: Omit<Project, 'id'>) => {
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
  }, [showAlert]);

  const updateProject = useCallback(async (id: string, projectData: Partial<Project>) => {
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
  }, [showAlert]);

  const deleteProject = useCallback(async (id: string) => {
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
  }, [showAlert]);

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