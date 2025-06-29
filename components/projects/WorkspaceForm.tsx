import { useState } from 'react';
import { Workspace } from '@/types/workspace';

interface WorkspaceFormProps {
  onSubmit: (workspaceData: Omit<Workspace, 'id'>) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WorkspaceForm = ({ onSubmit, onCancel, isLoading = false }: WorkspaceFormProps) => {
  const [formData, setFormData] = useState<Omit<Workspace, 'id'>>({
    name: '',
  });
  const [errors, setErrors] = useState<Partial<Workspace>>({});

  const validateForm = () => {
    const newErrors: Partial<Workspace> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Workspace name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Workspace name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await onSubmit({
      name: formData.name.trim(),
    });

    if (success) {
      // Reset form on success
      setFormData({ name: '' });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof Workspace, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-1">
          Workspace Name *
        </label>
        <input
          type="text"
          id="workspaceName"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="Enter workspace name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> The workspace slug will be automatically generated based on the name you provide.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Workspace'}
        </button>
      </div>
    </form>
  );
};