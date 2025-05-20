// components/projects/ProjectUsersTable.tsx
import { useState } from 'react';
import { ProjectUser } from '@/types/projectUser';
import { ProjectRole } from '@/types/projectUser';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { UserBadge } from '@/components/users/UserBadge';
import { Modal } from '@/components/common/Modal';

interface ProjectUsersTableProps {
  projectUsers: ProjectUser[];
  isLoading?: boolean;
  onUpdateRole: (userId: string, role: ProjectRole) => void;
  onRemoveUser: (userId: string) => void;
}

export const ProjectUsersTable = ({ 
  projectUsers, 
  isLoading = false, 
  onUpdateRole,
  onRemoveUser
}: ProjectUsersTableProps) => {
  const [userToEdit, setUserToEdit] = useState<ProjectUser | null>(null);
  const [userToRemove, setUserToRemove] = useState<ProjectUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('user');

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as ProjectRole);
  };

  const handleUpdateRole = () => {
    if (userToEdit && userToEdit.user.id) {
      onUpdateRole(userToEdit.user.id, selectedRole);
      setUserToEdit(null);
    }
  };

  const handleRemoveUser = () => {
    if (userToRemove && userToRemove.user.id) {
      onRemoveUser(userToRemove.user.id);
      setUserToRemove(null);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    console.log("TEST", role);
    switch (role) {
      case 'project_lead':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Project Users</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-center">Role</th>
              <th className="py-3 px-6 text-center">Admin</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-3 px-6">
                  <SkeletonLoader type="table-row" count={3} />
                </td>
              </tr>
            ) : projectUsers.length > 0 ? (
              projectUsers.map((projectUser) => (
                <tr key={projectUser.user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {projectUser.user.id}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {projectUser.user.name}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {projectUser.user.username}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {projectUser.user.email}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(projectUser.role.role)}`}>
                      {projectUser.role.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <UserBadge isAdmin={projectUser.user.isAdmin} />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setUserToEdit(projectUser);
                          setSelectedRole(projectUser.role.role);
                        }}
                      >
                        Change Role
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => setUserToRemove(projectUser)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No users found in this project
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Role Modal */}
      <Modal 
        isOpen={!!userToEdit} 
        onClose={() => setUserToEdit(null)}
        title="Change User Role"
        size="sm"
      >
        <div>
          {userToEdit && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Change role for user: <span className="font-semibold">{userToEdit.user.name}</span>
              </p>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="project_lead">Project Lead</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Role
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
      
      {/* Remove User Confirmation Modal */}
      <Modal 
        isOpen={!!userToRemove} 
        onClose={() => setUserToRemove(null)}
        title="Remove User from Project"
        size="sm"
      >
        <div>
          {userToRemove && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to remove <span className="font-semibold">{userToRemove.user.name}</span> from this project? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setUserToRemove(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveUser}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};