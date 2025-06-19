'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../../components/common/PageHeader';
import { FileTable } from '../../../../components/files/FileTable';
import { FileUploadForm } from '../../../../components/files/FileUploadForm';
import { FileUploadModal } from '../../../../components/files/FileUploadModal';
import { useProjectFiles } from '../../../../hooks/useProjectFiles';

interface ProjectFilesPageProps {
  params: Promise<{ id: string }>;
}

const ProjectFilesPage = ({ params }: ProjectFilesPageProps) => {
  // Use React.use() to unwrap the params promise
  const unwrappedParams = React.use(params);
  const projectId = unwrappedParams.id;
  
  const { files, loading, uploadFile, deleteFile } = useProjectFiles(projectId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleUpload = async (file: File, ttl: string) => {
    await uploadFile(file, ttl);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Project Files" />
      <div className="mb-8">
        <FileUploadForm onOpenModal={handleOpenModal} />
      </div>
      <FileTable 
        files={files} 
        loading={loading} 
        onDelete={deleteFile} 
      />
      
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default ProjectFilesPage;