import React from 'react';
import { Button } from '../common/Button';

interface FileUploadFormProps {
  onOpenModal: () => void;
}

export const FileUploadForm: React.FC<FileUploadFormProps> = ({ onOpenModal }) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Upload New File</h3>
      <div>
        <Button onClick={onOpenModal}>
          Upload File
        </Button>
      </div>
    </div>
  );
};