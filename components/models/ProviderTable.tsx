// components/models/ProviderTable.tsx
import { useState } from 'react';
import { Provider } from '@/types/provider';
import { ProviderForm } from './ProviderForm';
import { Modal } from '@/components/common/Modal';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { useProviders } from '@/hooks/useProviders';

interface ProviderTableProps {
  providers: Provider[];
  onProviderChange: () => void;
  isLoading?: boolean;
}

export const ProviderTable = ({ providers, onProviderChange, isLoading = false }: ProviderTableProps) => {
  const [sortField, setSortField] = useState<keyof Provider>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { createProvider, updateProvider, deleteProvider } = useProviders();

  const handleSort = (field: keyof Provider) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === undefined) return sortDirection === 'asc' ? -1 : 1;
    if (fieldB === undefined) return sortDirection === 'asc' ? 1 : -1;
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter providers based on search term
  const filteredProviders = sortedProviders.filter(provider => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (provider.name || '').toLowerCase().includes(search) ||
      String(provider.id || '').toLowerCase().includes(search)
    );
  });

  const handleAddProvider = async (providerData: Omit<Provider, 'id'>) => {
    const result = await createProvider(providerData);
    if (result) {
      setShowAddModal(false);
      onProviderChange(); // Refresh the provider list
    }
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
  };

  const handleUpdateProvider = async (providerData: Provider) => {
    if (!providerData.id) return;
    
    const result = await updateProvider(String(providerData.id), providerData);
    if (result) {
      setEditingProvider(null);
      onProviderChange(); // Refresh the provider list
    }
  };

  const handleDeleteClick = (provider: Provider) => {
    setProviderToDelete(provider);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete?.id) return;
    
    const result = await deleteProvider(String(providerToDelete.id));
    if (result) {
      setShowDeleteModal(false);
      setProviderToDelete(null);
      onProviderChange(); // Refresh the provider list
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Provider List</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Provider
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search providers..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {filteredProviders.length} of {providers.length} providers
          </p>
        )}
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
              <th className="py-3 px-6 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {isLoading ? (
              <>
                <SkeletonLoader type="table-row" count={5} />
              </>
            ) : sortedProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <tr key={provider.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {provider.id}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {provider.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEditProvider(provider)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(provider)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-6 text-center text-gray-500">
                  {searchTerm ? `No providers found matching "${searchTerm}"` : 'No providers found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Provider Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New Provider"
        size="md"
      >
        <ProviderForm 
          onSubmit={handleAddProvider}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Provider Modal */}
      <Modal 
        isOpen={!!editingProvider} 
        onClose={() => setEditingProvider(null)}
        title="Edit Provider"
        size="md"
      >
        {editingProvider && (
          <ProviderForm 
            provider={editingProvider}
            onSubmit={handleUpdateProvider}
            onCancel={() => setEditingProvider(null)}
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
            Are you sure you want to delete the provider `&quot;`{providerToDelete?.name}`&quot;`? This action cannot be undone and may affect associated models.
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