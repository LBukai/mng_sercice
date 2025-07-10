// services/projectApi.ts
"use server";

import { Project } from "@/types/project";
import { UserAndRole, ProjectRole, ProjectUser } from "@/types/projectUser";
import { auth } from "@/app/auth";

const API_BASE_URL = process.env.API_BASE_URL;//"http://localhost:8080";

const getAuthHeaders = async () => {
  const session = await auth();
  return {
    "Content-Type": "application/json",
    Authorization: session?.sessionToken
      ? `Bearer ${session.sessionToken}`
      : "",
  };
};

export async function getProjects(): Promise<Project[]> {
  const head = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "GET",
    headers: head,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  return response.json();
}

export async function getProjectById(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }

  return response.json();
}

export async function createProject(projectData: Omit<Project, "id">): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }

    return response.json();
}

export async function updateProject(
    id: string,
    projectData: Partial<Project>
  ): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }
}

export async function getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/users`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch project users: ${response.statusText}`);
    }

    return response.json();
}

export async function addUsersToProject(
    projectId: string,
    usersData: UserAndRole[]
  ): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/users`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(usersData),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`${errorMessage}`);
    }
    
    // Handle both JSON and text responses
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }
    
    return responseData;
}

export async function updateUserRole(
    projectId: string,
    userId: string,
    role: ProjectRole
  ): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/users/${userId}`,
      {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ role }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`${errorMessage}`);
    }
    
    // Handle both JSON and text responses
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }
    
    return responseData;
}

export async function removeUserFromProject(
    projectId: string,
    userId: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/users/${userId}`,
      {
        method: "DELETE",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(
        `Failed to remove user from project: ${response.statusText}`
      );
    }
}