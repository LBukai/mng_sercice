import { useState, useCallback } from 'react';
import { Project } from '@/types/project';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/projects');
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to load projects');
      }
      
      const data = await res.json();
      setProjects(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        // API errors (including auth errors) are handled by handleApiError
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          // Don't show alert for auth errors as user will be redirected
          showAlert('error', `Failed to fetch projects: ${err.message}`);
        }
      } else {
        // Network or other errors
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch projects: ${errorMessage}`);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const getProjectById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects/${id}`);
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to load project');
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch project: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch project: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const createProject = useCallback(async (projectData: Omit<Project, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects`, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData) 
      });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to create project');
      }
      
      const data = await res.json();
      setProjects(prev => [...prev, data]);
      showAlert('success', 'Project created successfully');
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to create project: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to create project: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateProject = useCallback(async (id: string, projectData: Partial<Project>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects/${id}`, { 
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData) 
      });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to update project');
      }
      
      const data = await res.json();
      setProjects(prev => 
        prev.map(project => project.id === id ? { ...project, ...data } : project)
      );
      showAlert('success', 'Project updated successfully');
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update project: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update project: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        await handleApiError(res, 'Failed to delete project');
      }
      
      setProjects(prev => prev.filter(project => project.id !== id));
      showAlert('success', 'Project deleted successfully');
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to delete project: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to delete project: ${errorMessage}`);
      }
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