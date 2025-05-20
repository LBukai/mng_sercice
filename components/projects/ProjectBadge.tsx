import React from 'react';

interface ProjectBadgeProps {
  label: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
  className?: string;
}

export const ProjectBadge: React.FC<ProjectBadgeProps> = ({ 
  label, 
  value, 
  icon, 
  className = '' 
}) => {
  return (
    <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${className || 'bg-gray-100 text-gray-800'}`}>
      {icon && <span className="mr-1">{icon}</span>}
      <span className="mr-1 font-semibold">{label}:</span>
      <span>{value || 'N/A'}</span>
    </div>
  );
};

// Predefined badge types
export const WorkspaceLimitBadge: React.FC<{ value: number | undefined; className?: string }> = ({ 
  value, 
  className 
}) => (
  <ProjectBadge 
    label="Workspaces" 
    value={value} 
    className={className || 'bg-blue-100 text-blue-800'}
    icon={
      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    }
  />
);

export const UserLimitBadge: React.FC<{ value: number | undefined; className?: string }> = ({ 
  value, 
  className 
}) => (
  <ProjectBadge 
    label="Users" 
    value={value} 
    className={className || 'bg-green-100 text-green-800'}
    icon={
      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    }
  />
);

export const CostCenterBadge: React.FC<{ value: string | undefined; className?: string }> = ({ 
  value, 
  className 
}) => (
  <ProjectBadge 
    label="Cost Center" 
    value={value} 
    className={className || 'bg-yellow-100 text-yellow-800'}
    icon={
      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
  />
);

export const ProjectNumberBadge: React.FC<{ value: string | undefined; className?: string }> = ({ 
  value, 
  className 
}) => (
  <ProjectBadge 
    label="Project #" 
    value={value} 
    className={className || 'bg-purple-100 text-purple-800'}
    icon={
      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    }
  />
);