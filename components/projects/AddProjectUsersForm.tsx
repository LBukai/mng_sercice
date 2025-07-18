import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { UserAndRole, ProjectRole } from '@/types/projectUser';
import { getUsers } from '@/services/userApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AddProjectUsersFormProps {
  projectId: string;
  existingUsers: string[]; // IDs of users already in the project
  onSubmit: (usersData: UserAndRole[]) => Promise<boolean>;
  onCancel: () => void;
}

export const AddProjectUsersForm = ({ 
  existingUsers, 
  onSubmit, 
  onCancel 
}: AddProjectUsersFormProps) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('User');

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await getUsers();
        
        // Filter out users that are already in the project
        const availableUsers = users.filter(user => !existingUsers.includes(user.id as string));
        setAllUsers(availableUsers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to fetch users: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [existingUsers]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as ProjectRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to add to the project');
      return;
    }
    
    // Create the user and role data with proper serializable structure
    const usersData: UserAndRole[] = selectedUsers.map(userId => ({
      user_id: userId,
      role: selectedRole, // Pass the role as a simple string, not an object
    }));
    
    try {
      const success = await onSubmit(usersData);
      if (success) {
        // Reset form on success
        setSelectedUsers([]);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to add users: ${errorMessage}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Add Users to Project</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role for selected users
          </label>
          <select
            id="role"
            name="role"
            value={selectedRole}
            onChange={handleRoleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Project Lead">Project Lead</option>
            <option value="User">User</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Users to Add
          </label>
          
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : allUsers.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-sm">
              No available users to add to this project.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
              {allUsers.map(user => (
                <div key={user.id} className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id as string)}
                    onChange={() => handleUserToggle(user.id as string)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`user-${user.id}`} className="ml-3 block text-sm text-gray-700 cursor-pointer">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email} • {user.username}</div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={selectedUsers.length === 0 || isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Selected Users
          </button>
        </div>
      </form>
    </div>
  );
};