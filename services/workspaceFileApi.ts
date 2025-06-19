// services/workspaceFileApi.ts
import { ProjectFile } from '../types/file';
import authApiService from './authApi';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const workspaceFileApiService = {
  // Get files assigned to workspace
  getWorkspaceFiles: async (workspaceId: number): Promise<ProjectFile[]> => {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/files`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workspace files: ${response.statusText}`);
    }

    return response.json();
  },
  
  // Add files to workspace
  addFilesToWorkspace: async (workspaceId: number, fileIds: string[]): Promise<void> => {
    const filesPayload = fileIds.map(id => ({ id }));
    
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/files`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(filesPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to add files to workspace: ${response.statusText}`);
    }
  },
  
  // Remove a file from workspace
  removeFileFromWorkspace: async (workspaceId: number, fileId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove file from workspace: ${response.statusText}`);
    }
  },
  
  // Remove all files from workspace
  removeAllFilesFromWorkspace: async (workspaceId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/files`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove all files from workspace: ${response.statusText}`);
    }
  }
};

export default workspaceFileApiService;