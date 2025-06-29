import { useState, useCallback } from 'react';
import { User } from '@/types/user';
import { getUsers, createUser as createUserApi, updateUser as updateUserApi, deleteUser as deleteUserApi, getUserById as getUserByIdApi } from '@/services/userApi';
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
      const data = await getUsers();
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
      const data = await getUserByIdApi(id);
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
      
      // Log the data being sent for debugging
      console.log('Creating user with data:', userData);
      
      const newUser = await createUserApi(userData);
      setUsers(prev => [...prev, newUser]);
      showAlert('success', 'User created successfully');
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error creating user:', err, 'User data:', userData);
      setError(errorMessage);
      showAlert('error', `Failed to create user: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const createUsers = useCallback(async (usersData: Omit<User, 'id'>[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const createdUsers: User[] = [];
      let successCount = 0;
      
      // Create users one by one (you can optimize this with a bulk API endpoint if available)
      for (const userData of usersData) {
        try {
          const newUser = await createUserApi(userData);
          createdUsers.push(newUser);
          successCount++;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          showAlert('error', `Failed to create user ${userData.name}: ${errorMessage}`);
        }
      }
      
      if (createdUsers.length > 0) {
        setUsers(prev => [...prev, ...createdUsers]);
      }
      
      if (successCount === usersData.length) {
        showAlert('success', `All ${successCount} users created successfully`);
        return true;
      } else if (successCount > 0) {
        showAlert('warning', `${successCount} of ${usersData.length} users created successfully`);
        return false;
      } else {
        showAlert('error', 'Failed to create any users');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      showAlert('error', `Failed to create users: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await updateUserApi(id, userData);
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
      await deleteUserApi(id);
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
    createUsers,
    updateUser,
    deleteUser,
  };
};