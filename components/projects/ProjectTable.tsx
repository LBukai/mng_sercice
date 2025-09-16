import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { ProjectForm } from './ProjectForm';
import { Modal } from '@/components/common/Modal';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { useProjects } from '@/hooks/useProjects';

interface ProjectTableProps {
  projects: Project[];
  onProjectChange: () => void;
  isLoading?: boolean;
}

// ArchGPT Badge Component
const ArchGPTBadge = () => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    ArchGPT
  </span>
);

export const ProjectTable = ({ projects, onProjectChange, isLoading = false }: ProjectTableProps) => {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof Project>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { createProject, updateProject, deleteProject } = useProjects();

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === undefined) return sortDirection === 'asc' ? -1 : 1;
    if (fieldB === undefined) return sortDirection === 'asc' ? 1 : -1;
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter projects based on search term
  const filteredProjects = sortedProjects.filter(project => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (project.name || '').toLowerCase().includes(search) ||
      String(project.id || '').toLowerCase().includes(search) ||
      (project.costCenter || '').toLowerCase().includes(search) ||
      (project.projectNumber || '').toLowerCase().includes(search) ||
      (project.is_archgpt && 'archgpt'.includes(search))
    );
  });

  const handleAddProject = async (projectData: Omit<Project, 'id'>) => {
    const result = await createProject(projectData);
    if (result) {
      setShowAddModal(false);
      onProjectChange(); // Refresh the project list
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdateProject = async (projectData: Project) => {
    if (!projectData.id) return;
    
    const result = await updateProject(projectData.id, projectData);
    if (result) {
      setEditingProject(null);
      onProjectChange(); // Refresh the project list
    }
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete?.id) return;
    
    const result = await deleteProject(projectToDelete.id);
    if (result) {
      setShowDeleteModal(false);
      setProjectToDelete(null);
      onProjectChange(); // Refresh the project list
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Project List</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
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
            Showing {filteredProjects.length} of {projects.length} projects
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
              <th className="py-3 px-6 text-left">
                Type
              </th>
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('costCenter')}
              >
                Cost Center
                {sortField === 'costCenter' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('projectNumber')}
              >
                Project Number
                {sortField === 'projectNumber' && (
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
              // Show skeleton loading rows when data is loading
              <>
                <SkeletonLoader type="table-row" count={5} />
              </>
            ) : sortedProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr 
                  key={project.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                    project.is_archgpt ? 'bg-gradient-to-r from-white to-purple-50' : ''
                  }`}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {project.id}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center gap-2">
                      {project.name}
                      {project.is_archgpt && <ArchGPTBadge />}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {project.is_archgpt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        ArchGPT
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {project.costCenter || '-'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {project.projectNumber || '-'}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(project)}
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
                  {searchTerm ? `No projects found matching "${searchTerm}"` : 'No projects found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Project Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New Project"
        size="md"
      >
        <ProjectForm 
          onSubmit={handleAddProject}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Project Modal */}
      <Modal 
        isOpen={!!editingProject} 
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        size="md"
      >
        {editingProject && (
          <ProjectForm 
            project={editingProject}
            onSubmit={handleUpdateProject}
            onCancel={() => setEditingProject(null)}
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
            Are you sure you want to delete the project? This action cannot be undone.
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