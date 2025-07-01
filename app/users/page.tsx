'use client';

import { useEffect, useState } from 'react';
import { UserTable } from '@/components/users/UserTable';
import { BulkUserForm } from '@/components/users/BulkUserForm';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Modal } from '@/components/common/Modal';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types/user';

export default function UsersPage() {
  const { users, isLoading, error, fetchUsers } = useUsers();
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBulkCreateUsers = async (usersData: Omit<User, 'id'>[]): Promise<boolean> => {
    setIsCreating(true);
    try {
      // If your useUsers hook doesn't have createUsers, we'll need to add it
      // For now, let's create them one by one
      let allSuccessful = true;
      
      for (const userData of usersData) {
        // You'll need to implement a bulk create API or call create multiple times
        // This is a placeholder - implement based on your API
        const success = await createUser(userData);
        if (!success) {
          allSuccessful = false;
          break;
        }
      }
      
      if (allSuccessful) {
        setShowBulkAddModal(false);
        await fetchUsers(); // Refresh the user list
      }
      
      return allSuccessful;
    } finally {
      setIsCreating(false);
    }
  };

  // Placeholder for individual user creation - replace with your actual implementation
  const createUser = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    try {
      // Replace this with your actual user creation logic
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="User Management" 
        action={
          <button
            onClick={() => setShowBulkAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Multiple Users
          </button>
        }
      />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading && users.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <UserTable 
            users={users} 
            onUserChange={fetchUsers} 
            isLoading={isLoading} 
          />
        )}
      </div>
      
      {/* Bulk Add Users Modal */}
      <Modal
        isOpen={showBulkAddModal}
        onClose={() => setShowBulkAddModal(false)}
        title="Add Multiple Users"
        size="xl"
      >
        <BulkUserForm
          onSubmit={handleBulkCreateUsers}
          onCancel={() => setShowBulkAddModal(false)}
          isLoading={isCreating}
        />
      </Modal>
    </div>
  );
}