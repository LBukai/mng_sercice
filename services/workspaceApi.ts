// services/workspaceApi.ts
import { Workspace } from '../types/workspace';
import authApiService from './authApi';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const getProjectWorkspaces = async (projectId: number): Promise<Workspace[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/workspaces`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project workspaces: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching project workspaces:', error);
    throw error;
  }
};

export const addWorkspaceToProject = async (projectId: number, workspace: Workspace): Promise<Workspace> => {
  try {
    // Wrap workspace in an array as required by the API
    const workspaceArray = [workspace];
    
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(workspaceArray),
    });

    if (!response.ok) {
      throw new Error(`Failed to add workspace to project: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error adding workspace to project:', error);
    throw error;
  }
};

export const deleteWorkspace = async (workspaceId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workspace: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
};

export const getWorkspace = async (workspaceId: number): Promise<Workspace> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workspace: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching workspace:', error);
    throw error;
  }
};

export const updateWorkspace = async (workspaceId: number, workspace: Workspace): Promise<Workspace> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(workspace),
    });

    if (!response.ok) {
      throw new Error(`Failed to update workspace: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }
};