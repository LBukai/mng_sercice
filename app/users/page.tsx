'use client';

import { useEffect } from 'react';
import { UserTable } from '@/components/users/UserTable';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useUsers } from '@/hooks/useUsers';

export default function UsersPage() {
  const { users, isLoading, error, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="User Management" />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <UserTable 
          users={users} 
          onUserChange={fetchUsers} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}