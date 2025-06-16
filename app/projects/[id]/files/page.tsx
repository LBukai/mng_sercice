'use client';

import React from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { FileTable } from '../../../../components/files/FileTable';
import { FileUploadForm } from '../../../../components/files/FileUploadForm';
import { AuthLayoutWrapper } from '../../../../components/layout/AuthLayoutWrapper';
import { useProjectFiles } from '../../../../hooks/useProjectFiles';

interface ProjectFilesPageProps {
  params: {
    id: string;
  };
}

const ProjectFilesPage = ({ params }: ProjectFilesPageProps) => {
  const projectId = params.id;
  const { files, loading, uploadFile, deleteFile } = useProjectFiles(projectId);

  return (
    <AuthLayoutWrapper>
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Project Files" />
        <div className="mb-8">
          <FileUploadForm onUpload={uploadFile} />
        </div>
        <FileTable 
          files={files} 
          loading={loading} 
          onDelete={deleteFile} 
        />
      </div>
    </AuthLayoutWrapper>
  );
};

export default ProjectFilesPage;