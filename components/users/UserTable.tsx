import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { UserForm } from './UserForm';
import { Modal } from '@/components/common/Modal';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { useUsers } from '@/hooks/useUsers';
import { UserBadge } from './UserBadge';

interface UserTableProps {
  users: User[];
  onUserChange: () => void;
  isLoading?: boolean;
}

export const UserTable = ({ users, onUserChange, isLoading = false }: UserTableProps) => {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const { createUser, updateUser, deleteUser } = useUsers();

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === undefined) return sortDirection === 'asc' ? -1 : 1;
    if (fieldB === undefined) return sortDirection === 'asc' ? 1 : -1;
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    const result = await createUser(userData);
    if (result) {
      setShowAddModal(false);
      onUserChange(); // Refresh the user list
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (userData: User) => {
    if (!userData.id) return;
    
    const result = await updateUser(userData.id, userData);
    if (result) {
      setEditingUser(null);
      onUserChange(); // Refresh the user list
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete?.id) return;
    
    const result = await deleteUser(userToDelete.id);
    if (result) {
      setShowDeleteModal(false);
      setUserToDelete(null);
      onUserChange(); // Refresh the user list
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">User List</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID
                {sortField === 'id' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('username')}
              >
                Username
                {sortField === 'username' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email
                {sortField === 'email' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-center"
              >
                Admin
              </th>
              <th className="py-3 px-6 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {isLoading ? (
              // Show skeleton loading rows when data is loading
              <>
                <SkeletonLoader type="table-row" count={5} />
              </>
            ) : sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/users/${user.id}`)}>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {user.id}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.name}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.username}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.email}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <UserBadge isAdmin={user.isAdmin} />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="md"
      >
        <UserForm 
          onSubmit={handleAddUser}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal 
        isOpen={!!editingUser} 
        onClose={() => setEditingUser(null)}
        title="Edit User"
        size="md"
      >
        {editingUser && (
          <UserForm 
            user={editingUser}
            onSubmit={handleUpdateUser}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete the user? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};