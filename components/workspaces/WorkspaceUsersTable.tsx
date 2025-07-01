import { useState } from 'react';
import { User } from '@/types/user';
import { Workspace } from '@/types/workspace';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Modal } from '@/components/common/Modal';
import { AddWorkspaceUsersForm } from './AddWorkspaceUsersForm';

interface WorkspaceUsersTableProps {
  workspaceUsers: User[];
  workspace: Workspace;
  isLoading: boolean;
  error: string | null;
  onUserRemove: (userId: string) => Promise<boolean>;
  onAddUsers: (userIds: string[]) => Promise<boolean>;
}

export const WorkspaceUsersTable = ({
  workspaceUsers,
  workspace,
  isLoading,
  error,
  onUserRemove,
  onAddUsers
}: WorkspaceUsersTableProps) => {
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from this workspace?`)) {
      await onUserRemove(userId);
    }
  };

  const handleAddUsers = async (userIds: string[]) => {
    const success = await onAddUsers(userIds);
    if (success) {
      setShowAddUsersModal(false);
    }
    return success;
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Workspace Users</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Users assigned to this workspace.</p>
          </div>
          <button
            onClick={() => setShowAddUsersModal(true)}
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
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
              ) : workspaceUsers.length > 0 ? (
                workspaceUsers.map((user, index) => (
                  <tr key={user.id || `user-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveUser(user.id!, user.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users assigned to this workspace
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Users Modal */}
      <Modal 
        isOpen={showAddUsersModal} 
        onClose={() => setShowAddUsersModal(false)}
        title="Add Users to Workspace"
        size="md"
      >
        <AddWorkspaceUsersForm 
          workspace={workspace}
          existingUsers={workspaceUsers.map(u => u.id as string)}
          onSubmit={handleAddUsers}
          onCancel={() => setShowAddUsersModal(false)}
        />
      </Modal>
    </>
  );
};