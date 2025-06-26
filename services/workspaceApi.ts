// services/workspaceApi.ts
import { Workspace } from '@/types/workspace';
import authApiService from './authApi';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const workspaceApiService = {
  // Get workspaces for a project
  getProjectWorkspaces: async (projectId: string): Promise<Workspace[]> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/workspaces`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project workspaces: ${response.statusText}`);
    }

    return response.json();
  },

  // Add workspaces to a project
  addWorkspacesToProject: async (projectId: string, workspacesData: Workspace[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(workspacesData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add workspaces to project: ${response.statusText}`);
    }
  },
};