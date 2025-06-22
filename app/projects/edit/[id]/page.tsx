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
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value, 10),
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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