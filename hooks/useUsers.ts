import { useState, useCallback } from 'react';
import { User } from '@/types/user';
import { useAlert } from '@/contexts/AlertContext';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/users')
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch users: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const getUserById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/users/${id}`)
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load user');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to fetch user: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const createUser = useCallback(async (userData: Omit<User, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/users`, { method: 'POST', body: JSON.stringify(userData) })
      const newUser = await res.json();
      if (!res.ok) throw new Error(newUser.error || 'Failed to create project');
      setUsers(prev => [...prev, newUser]);
      showAlert('success', 'User created successfully');
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to create user: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) })
      const updatedUser = await res.json();
      if (!res.ok) throw new Error(updatedUser.error || 'Failed to update project');
      setUsers(prev => 
        prev.map(user => user.id === id ? { ...user, ...updatedUser } : user)
      );
      showAlert('success', 'User updated successfully');
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to update user: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(prev => prev.filter(user => user.id !== id));
      showAlert('success', 'User deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to delete user: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};