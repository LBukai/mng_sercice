"use server";
import { User } from "@/types/user";
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

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

export async function createUser(userData: Omit<User, "id">): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  let data = await response.json()

  if (!response.ok) {
    throw new Error(`Failed to create user: ${data.error}`);
  }

  return data;
}

export async function updateUser(
  id: string,
  userData: Partial<User>
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT", // Using PUT as per OpenAPI spec
    headers: await getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  return response.json();
}

export async function updateUserAdminStatus(
  id: string,
  isAdmin: boolean
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/admin`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ isAdmin }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user admin status: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }
}

export async function getUserById(id: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}