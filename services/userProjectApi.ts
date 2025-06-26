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

    return response.json();
  },
};