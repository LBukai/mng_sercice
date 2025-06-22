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
  }, [showAlert, isLoggingOut]);

  const getUserById = useCallback(async (id: string) => {
    if (isLoggingOut) return null;
    
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
  }, [showAlert, isLoggingOut]);

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

  const createMultipleUsers = useCallback(async (usersData: Omit<User, 'id'>[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const createdUsers: User[] = [];
      let failedCount = 0;
      
      // Process users sequentially to handle errors better
      for (const userData of usersData) {
        try {
          const newUser = await apiService.createUser(userData);
          createdUsers.push(newUser);
        } catch (err) {
          failedCount++;
          console.error(`Failed to create user ${userData.username}:`, err);
          // Continue with other users even if one fails
        }
      }
      
      // Update the state with the newly created users
      setUsers(prev => [...prev, ...createdUsers]);
      
      // Show appropriate message based on results
      if (failedCount === 0) {
        showAlert('success', `Successfully created ${createdUsers.length} users`);
      } else if (createdUsers.length > 0) {
        showAlert('warning', `Created ${createdUsers.length} users, but ${failedCount} failed`);
      } else {
        showAlert('error', 'Failed to create any users');
      }
      
      return createdUsers;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to create users: ${errorMessage}`);
      return [];
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
    createMultipleUsers,
    updateUser,
    deleteUser,
  };
};