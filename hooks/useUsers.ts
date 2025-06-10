import { useState, useCallback } from 'react';
import { User } from '@/types/user';
import { apiService } from '@/services/api';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';


export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const { isLoggingOut } = useAuth();

  const fetchUsers = useCallback(async () => {

    if (isLoggingOut) return [];

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getUsers();
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

    if (isLoggingOut) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getUserById(id);
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
      const newUser = await apiService.createUser(userData);
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
      const updatedUser = await apiService.updateUser(id, userData);
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
      await apiService.deleteUser(id);
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