import { useState, useCallback } from 'react';
import { Project } from '@/types/project';
import { useAlert } from '@/contexts/AlertContext';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/projects')
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load projects');
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
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/projects/${id}`)
      const data =await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load project');
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
      const res = await fetch(`/api/projects`, { method: 'POST', body: JSON.stringify(projectData) })
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');
      setProjects(prev => [...prev, data]);
      showAlert('success', 'Project created successfully');
      return data;
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
      const res = await fetch(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(projectData) })
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update project');
      setProjects(prev => 
        prev.map(project => project.id === id ? { ...project, ...data } : project)
      );
      showAlert('success', 'Project updated successfully');
      return data;
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
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project');
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