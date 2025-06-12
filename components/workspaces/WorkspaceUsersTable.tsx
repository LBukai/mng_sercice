// components/workspaces/WorkspaceUsersTable.tsx
import React, { useState } from 'react';
import { WorkspaceUser, UserAndRole, WorkspaceRole } from '@/types/workspaceUser';
import { User } from '@/types/user';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';

interface AddUserFormProps {
  projectUsers: User[];
  workspaceUsers: WorkspaceUser[];
  onAddUsers: (users: UserAndRole[]) => Promise<void>;
  onCancel: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  projectUsers,
  workspaceUsers,
  onAddUsers,
  onCancel,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('Member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out users that are already in the workspace
  const availableUsers = projectUsers.filter(
    (user) => !(workspaceUsers || []).some((wu) => wu && wu.user && wu.user.id === user.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    setIsSubmitting(true);
    try {
      const users = selectedUsers.map((userId) => ({
        userId,
        role: selectedRole,
      }));
      await onAddUsers(users);
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Users
        </label>
        {availableUsers.length === 0 ? (
          <div className="mt-2 text-sm text-gray-500">
            All project users are already assigned to this workspace.
          </div>
        ) : (
          <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
            {availableUsers.map((user) => (
              <div key={user.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  value={user.id}
                  checked={selectedUsers.includes(user.id!)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id!]);
                    } else {
                      setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`user-${user.id}`} className="ml-2 block text-sm text-gray-900">
                  {user.name} ({user.email})
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as WorkspaceRole)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="Admin">Admin</option>
          <option value="Member">Member</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={selectedUsers.length === 0 || availableUsers.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Add Users
        </Button>
      </div>
    </form>
  );
};

interface WorkspaceUsersTableProps {
  workspaceUsers: WorkspaceUser[];
  projectUsers: User[];
  isLoading: boolean;
  error: string | null;
  onAddUsers: (users: UserAndRole[]) => Promise<void>;
  onRemoveUser: (userId: string) => Promise<void>;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
}

export const WorkspaceUsersTable: React.FC<WorkspaceUsersTableProps> = ({
  workspaceUsers = [], // Provide default empty array
  projectUsers,
  isLoading,
  error,
  onAddUsers,
  onRemoveUser,
  onUpdateRole,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<WorkspaceUser | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: string; role: string } | null>(null);

  const handleRemoveUser = async () => {
    if (userToRemove && userToRemove.user.id) {
      await onRemoveUser(userToRemove.user.id);
      setUserToRemove(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await onUpdateRole(userId, newRole);
    setEditingUser(null);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Workspace Users</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Users with access to this workspace.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          Add Users
        </Button>
      </div>
      <div className="border-t border-gray-200">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">
            Error loading workspace users.
          </div>
        ) : (workspaceUsers && workspaceUsers.length > 0) ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workspaceUsers.map((workspaceUser) => (
                <tr key={workspaceUser.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xl font-medium text-gray-600">
                          {workspaceUser.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{workspaceUser.user.name}</div>
                        <div className="text-sm text-gray-500">{workspaceUser.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser && editingUser.id === workspaceUser.user.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        onBlur={() => handleRoleChange(workspaceUser.user.id!, editingUser.role)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => setEditingUser({ id: workspaceUser.user.id!, role: workspaceUser.role || 'Member' })}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                      >
                        {workspaceUser.role || 'Member'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setUserToRemove(workspaceUser)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No users have been added to this workspace.
          </div>
        )}
      </div>

      {/* Add Users Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add Users to Workspace</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <AddUserForm
                projectUsers={projectUsers}
                workspaceUsers={workspaceUsers}
                onAddUsers={onAddUsers}
                onCancel={() => setIsAddModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Remove User Confirmation Modal */}
      {userToRemove && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Removal</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to remove <span className="font-medium">{userToRemove.user.name}</span> from this workspace?
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUserToRemove(null)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleRemoveUser}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceUsersTable;