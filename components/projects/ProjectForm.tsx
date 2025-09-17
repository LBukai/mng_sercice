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
    costCenter: '',
    projectNumber: '',
    is_archgpt: false,
    ...project,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    costCenter?: string;
    projectNumber?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      costCenter?: string;
      projectNumber?: string;
    } = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
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

        {/* ArchGPT Checkbox */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="is_archgpt"
              name="is_archgpt"
              checked={formData.is_archgpt || false}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="is_archgpt" className="font-medium text-gray-700">
              ArchGPT Project
            </label>
            <p className="text-gray-500">
              Enable enhanced AI capabilities and specialized workflows for this project.
            </p>
          </div>
        </div>

        {/* Info section for ArchGPT */}
        {formData.is_archgpt && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">
                  ArchGPT Project Features
                </h3>
                <div className="mt-2 text-sm text-purple-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Advanced AI model integration and specialized modes</li>
                    <li>Enhanced workspace capabilities with custom workflows</li>
                    <li>Priority access to cutting-edge AI features</li>
                    <li>Specialized model configurations and fine-tuning options</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              formData.is_archgpt 
                ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isEditMode ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </form>
    </div>
  );
};