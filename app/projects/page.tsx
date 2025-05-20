'use client';

import { useEffect } from 'react';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const { projects, isLoading, error, fetchProjects } = useProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Project Management" />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <ProjectTable 
          projects={projects} 
          onProjectChange={fetchProjects} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}