// services/modelApi.ts
"use server";
import { Model } from "@/types/model";
import { DefaultModel } from "@/types/defaultModel";
import { auth } from "@/app/auth";

const API_BASE_URL = process.env.API_BASE_URL;

const getAuthHeaders = async () => {
  const session = await auth();
  return {
    "Content-Type": "application/json",
    Authorization: session?.sessionToken
      ? `Bearer ${session.sessionToken}`
      : "",
  };
};

export async function getModels(): Promise<Model[]> {
  const response = await fetch(`${API_BASE_URL}/models`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  return response.json();
}

export async function createModel(modelData: Omit<Model, "id">): Promise<Model> {
  // Ensure provider_id is sent as integer
  const requestData = {
    name: modelData.name,
    provider_id: typeof modelData.provider_id === 'string' 
      ? parseInt(modelData.provider_id, 10) 
      : modelData.provider_id
  };

  const response = await fetch(`${API_BASE_URL}/models`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(requestData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create model: ${data.error || response.statusText}`);
  }

  return data;
}

export async function updateModel(
  id: string,
  modelData: Partial<Model>
): Promise<Model> {
  // Ensure provider_id is sent as integer if provided
  const requestData = { ...modelData };
  if (requestData.provider_id !== undefined) {
    requestData.provider_id = typeof requestData.provider_id === 'string' 
      ? parseInt(requestData.provider_id, 10) 
      : requestData.provider_id;
  }

  const response = await fetch(`${API_BASE_URL}/models/${id}`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update model: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteModel(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/models/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete model: ${response.statusText}`);
  }
}

export async function getModelById(id: string): Promise<Model> {
  const response = await fetch(`${API_BASE_URL}/models/${id}`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch model: ${response.statusText}`);
  }

  return response.json();
}

export async function getDefaultModel(): Promise<DefaultModel> {
  const response = await fetch(`${API_BASE_URL}/models/default`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch default model: ${response.statusText}`);
  }

  return response.json();
}

export async function setDefaultModel(modelId: string | number): Promise<void> {
  // Ensure ID is sent as integer
  const id = typeof modelId === 'string' ? parseInt(modelId, 10) : modelId;
  
  const response = await fetch(`${API_BASE_URL}/models/default`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(`Failed to set default model: ${response.statusText}`);
  }
}