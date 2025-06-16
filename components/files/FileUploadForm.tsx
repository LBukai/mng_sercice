import React, { useState, useRef } from 'react';
import { Button } from '../common/Button';

interface FileUploadFormProps {
  onUpload: (file: File) => Promise<void>;
}

export const FileUploadForm: React.FC<FileUploadFormProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Upload New File</h3>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 rounded w-full sm:w-auto"
          ref={fileInputRef}
        />
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          //loading={isUploading}
        >
          Upload File
        </Button>
      </div>
      {selectedFile && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </p>
      )}
    </div>
  );
};