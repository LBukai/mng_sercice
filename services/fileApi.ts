// services/fileApi.ts
import { File } from '@/types/file';

interface FileUploadData {
  files: FileList;
  ttl: string;
}

export const fileApiService = {
  // Get files for a project
  getProjectFiles: async (projectId: string): Promise<File[]> => {
    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project files: ${response.statusText}`);
    }

    return response.json();
  },

  // Upload files to a project with TTL
  uploadFilesToProject: async (projectId: string, data: FileUploadData): Promise<File[]> => {
    const formData = new FormData();
    
    // Add files to FormData
    Array.from(data.files).forEach((file) => {
      formData.append('files', file);
    });
    
    // Add metadata with TTL for each file
    const metadata = Array.from(data.files).map((file) => ({
      name: file.name,
      ttl: data.ttl,
    }));
    
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload files to project: ${response.statusText}`);
    }

    return response.json();
  },
};