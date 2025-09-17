'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/hooks/useProjects';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import Link from 'next/link';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [formData, setFormData] = useState<Project>({
    id: '',
    name: '',
    workspacecountLimit: undefined,
    usercountLimit: undefined,
    costCenter: '',
    projectNumber: '',
    is_archgpt: false,
  });
  
  const { isLoading, error, getProjectById, updateProject } = useProjects();
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    workspacecountLimit?: string;
    usercountLimit?: string;
  }>({});

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setFormData(projectData);
        }
      }
    };

    fetchProject();
  }, [projectId, getProjectById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value, 10),
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
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
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      if (projectId) {
        await updateProject(projectId, formData);
        router.push(`/projects/${projectId}`);
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Edit Project" 
        action={
          <Link
            href={`/projects/${projectId}`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </Link>
        }
      />
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">Project ID cannot be changed</p>
            </div>
            
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
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
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
                    formErrors.workspacecountLimit ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.workspacecountLimit && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.workspacecountLimit}</p>
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
                    formErrors.usercountLimit ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.usercountLimit && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.usercountLimit}</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                      <p>This project will have access to enhanced AI capabilities including specialized modes, advanced model configurations, and custom workflows.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Link
                href={`/projects/${projectId}`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.is_archgpt 
                    ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}