import { useState } from 'react';
import { Project } from '@/types/project';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (projectData: Omit<Project, 'id'> | Project) => void;
  onCancel: () => void;
}

export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  const isEditMode = !!project?.id;
  
  const [formData, setFormData] = useState<Project>({
    name: '',
    workspacecountLimit: 5,
    usercountLimit: 20,
    costCenter: '',
    projectNumber: '',
    ...project,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    workspacecountLimit?: string;
    usercountLimit?: string;
    costCenter?: string;
    projectNumber?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      workspacecountLimit?: string;
      usercountLimit?: string;
      costCenter?: string;
      projectNumber?: string;
    } = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (formData.workspacecountLimit !== undefined && formData.workspacecountLimit <= 0) {
      newErrors.workspacecountLimit = 'Workspace limit must be a positive number';
    }
    
    if (formData.usercountLimit !== undefined && formData.usercountLimit <= 0) {
      newErrors.usercountLimit = 'User limit must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium mb-6">
        {isEditMode ? 'Edit Project' : 'Add New Project'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="workspacecountLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Workspace Limit
            </label>
            <input
              type="number"
              id="workspacecountLimit"
              name="workspacecountLimit"
              value={formData.workspacecountLimit || ''}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.workspacecountLimit ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.workspacecountLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.workspacecountLimit}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="usercountLimit" className="block text-sm font-medium text-gray-700 mb-1">
              User Limit
            </label>
            <input
              type="number"
              id="usercountLimit"
              name="usercountLimit"
              value={formData.usercountLimit || ''}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.usercountLimit ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.usercountLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.usercountLimit}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="costCenter" className="block text-sm font-medium text-gray-700 mb-1">
              Cost Center
            </label>
            <input
              type="text"
              id="costCenter"
              name="costCenter"
              value={formData.costCenter || ''}
              onChange={handleChange}
              placeholder="e.g., H.123"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.costCenter ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.costCenter && (
              <p className="mt-1 text-sm text-red-600">{errors.costCenter}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="projectNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Project Number
            </label>
            <input
              type="text"
              id="projectNumber"
              name="projectNumber"
              value={formData.projectNumber || ''}
              onChange={handleChange}
              placeholder="e.g., K.987"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.projectNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.projectNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.projectNumber}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditMode ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </form>
    </div>
  );
};