// services/fileApi.ts
import { File } from '@/types/file';
import authApiService from './authApi';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const fileApiService = {
  // Get files for a project
  getProjectFiles: async (projectId: string): Promise<File[]> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project files: ${response.statusText}`);
    }

    return response.json();
  },

  // Upload files to a project
  uploadFilesToProject: async (projectId: string, formData: FormData): Promise<File[]> => {
    const token = authApiService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload files to project: ${response.statusText}`);
    }

    return response.json();
  },
};