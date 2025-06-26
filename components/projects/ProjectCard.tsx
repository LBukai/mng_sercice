import { useRouter } from 'next/navigation';
import { UserProject } from '@/types/userProject';

interface ProjectCardProps {
  userProject: UserProject;
}

export const ProjectCard = ({ userProject }: ProjectCardProps) => {
  const router = useRouter();
  const { project, role } = userProject;

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'project_lead':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'project_lead':
        return 'Project Lead';
      case 'admin':
        return 'Admin';
      case 'user':
        return 'User';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {project.name}
        </h3>
        <span 
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
        >
          {getRoleDisplayName(role)}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        {project.projectNumber && (
          <div className="flex justify-between">
            <span className="font-medium">Project Number:</span>
            <span>{project.projectNumber}</span>
          </div>
        )}
        
        {project.costCenter && (
          <div className="flex justify-between">
            <span className="font-medium">Cost Center:</span>
            <span>{project.costCenter}</span>
          </div>
        )}
        
        {project.usercountLimit && (
          <div className="flex justify-between">
            <span className="font-medium">User Limit:</span>
            <span>{project.usercountLimit}</span>
          </div>
        )}
        
        {project.workspacecountLimit && (
          <div className="flex justify-between">
            <span className="font-medium">Workspace Limit:</span>
            <span>{project.workspacecountLimit}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Project ID: {project.id}
        </div>
      </div>
    </div>
  );
};