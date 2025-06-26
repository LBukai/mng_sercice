import { useState } from 'react';
import { ProjectUser, ProjectRole } from '@/types/projectUser';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Modal } from '@/components/common/Modal';
import { AddProjectUsersForm } from './AddProjectUsersForm';

interface ProjectUsersTableProps {
  projectUsers: ProjectUser[];
  isLoading: boolean;
  error: string | null;
  onUserRoleUpdate: (userId: string, role: ProjectRole) => Promise<boolean>;
  onUserRemove: (userId: string) => Promise<boolean>;
  onAddUsers: () => void;
}

export const ProjectUsersTable = ({
  projectUsers,
  isLoading,
  error,
  onUserRoleUpdate,
  onUserRemove,
  onAddUsers
}: ProjectUsersTableProps) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: ProjectRole) => {
    setUpdatingUserId(userId);
    await onUserRoleUpdate(userId, newRole);
    setUpdatingUserId(null);
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from this project?`)) {
      await onUserRemove(userId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'Project Lead':
        return 'bg-purple-100 text-purple-800';
      case 'User':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Project Users</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Users assigned to this project and their roles.</p>
        </div>
        <button
          onClick={onAddUsers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-100 border-l-4 border-red-400 text-red-700">
          {error}
        </div>
      )}

      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <>
                <SkeletonLoader type="table-row" count={3} />
              </>
            ) : projectUsers.length > 0 ? (
              projectUsers.map((projectUser) => (
                <tr key={projectUser.user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {projectUser.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {projectUser.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {projectUser.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={typeof projectUser.role === 'string' ? projectUser.role : projectUser.role.role}
                      onChange={(e) => handleRoleChange(projectUser.user.id!, e.target.value as ProjectRole)}
                      disabled={updatingUserId === projectUser.user.id}
                      className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="User">User</option>
                      <option value="Project Lead">Project Lead</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveUser(projectUser.user.id!, projectUser.user.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No users assigned to this project
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};