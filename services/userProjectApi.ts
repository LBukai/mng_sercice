// services/userProjectApi.ts
import { UserProject } from '@/types/userProject';

export const userProjectApiService = {
  // Get projects for a specific user
  getUserProjects: async (userId: string): Promise<UserProject[]> => {
    const response = await fetch(`/api/users/${userId}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user projects: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Ensure we always return an array, never null or undefined
    return Array.isArray(data) ? data : [];
  },
};