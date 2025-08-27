
// services/providerApi.ts
"use server";
import { Provider } from "@/types/provider";
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

export async function getProviders(): Promise<Provider[]> {
  const response = await fetch(`${API_BASE_URL}/providers`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch providers: ${response.statusText}`);
  }

  return response.json();
}

export async function createProvider(providerData: Omit<Provider, "id">): Promise<Provider> {
  const response = await fetch(`${API_BASE_URL}/providers`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(providerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create provider: ${data.error || response.statusText}`);
  }

  return data;
}

export async function updateProvider(
  id: string,
  providerData: Partial<Provider>
): Promise<Provider> {
  const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(providerData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update provider: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteProvider(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete provider: ${response.statusText}`);
  }
}

export async function getProviderById(id: string): Promise<Provider> {
  const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch provider: ${response.statusText}`);
  }

  return response.json();
}