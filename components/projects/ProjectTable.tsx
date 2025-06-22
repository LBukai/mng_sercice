import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { ProjectForm } from './ProjectForm';
import { Modal } from '@/components/common/Modal';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { 
  WorkspaceLimitBadge, 
  UserLimitBadge 
} from '@/components/projects/ProjectBadge';
import { useProjects } from '@/hooks/useProjects';

interface ProjectTableProps {
  projects: Project[];
  onProjectChange: () => void;
  isLoading?: boolean;
}

export const ProjectTable = ({ projects, onProjectChange, isLoading = false }: ProjectTableProps) => {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof Project>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
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
                className="py-3 px-6 text-center cursor-pointer"
                onClick={() => handleSort('workspacecountLimit')}
              >
                Workspace Limit
                {sortField === 'workspacecountLimit' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-center cursor-pointer"
                onClick={() => handleSort('usercountLimit')}
              >
                User Limit
                {sortField === 'usercountLimit' && (
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
              sortedProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {project.id}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {project.name}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <WorkspaceLimitBadge value={project.workspacecountLimit} />
                  </td>
                  <td className="py-3 px-6 text-center">
                    <UserLimitBadge value={project.usercountLimit} />
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
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No projects found
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
            Are you sure you want to delete the project &quot;{projectToDelete?.name}&quot;? This action cannot be undone.
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