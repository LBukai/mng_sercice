import { useState, useCallback } from 'react';
import { User } from '@/types/user';
import { getUsers, createUser as createUserApi, updateUser as updateUserApi, deleteUser as deleteUserApi, getUserById as getUserByIdApi } from '@/services/userApi';
import { useAlert } from '@/contexts/AlertContext';
import { handleApiError, ApiError } from '@/utils/apiErrorHandler';

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
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch users: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch users: ${errorMessage}`);
      }
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
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to fetch user: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to fetch user: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const createUser = useCallback(async (userData: Omit<User, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newUser = await createUserApi(userData);
      setUsers(prev => [...prev, newUser]);
      showAlert('success', 'User created successfully');
      return newUser;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to create user: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to create user: ${errorMessage}`);
      }
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
      
      for (const userData of usersData) {
        try {
          const newUser = await createUserApi(userData);
          createdUsers.push(newUser);
          successCount++;
        } catch (err) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            // Re-throw auth errors to trigger sign-out
            throw err;
          }
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
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to create users: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to create users: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        await handleApiError(response, 'Failed to update user');
      }

      const updatedUser = await response.json();
      
      setUsers(prev => 
        prev.map(user => user.id === id ? { ...user, ...updatedUser } : user)
      );
      showAlert('success', 'User updated successfully');
      return updatedUser;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to update user: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to update user: ${errorMessage}`);
      }
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
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status !== 401 && err.status !== 403) {
          showAlert('error', `Failed to delete user: ${err.message}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        showAlert('error', `Failed to delete user: ${errorMessage}`);
      }
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