import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, ttl: string) => Promise<void>;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  // Set default TTL date to 1 year from now
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const defaultDateStr = defaultDate.toISOString().split('T')[0];
  
  const [ttl, setTtl] = useState<string>(defaultDateStr);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTtl(defaultDateStr);
      setError(null);
      setIsUploading(false);
      setSelectedFile(null);
      
      // Reset file input if it exists
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, defaultDateStr]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(ttl)) {
      setError('Please enter a valid date in YYYY-MM-DD format');
      return;
    }
    
    // Ensure date is in the future
    const selectedDate = new Date(ttl);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Please select a future date');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(selectedFile, ttl);
      onClose();
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload File" size="md">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Select File
          </label>
          <input
            type="file"
            id="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        {selectedFile && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected File</h3>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Unknown type'}
              </p>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date (TTL)
          </label>
          <input
            type="date"
            id="ttl"
            name="ttl"
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Minimum date is today
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            The file will be automatically deleted after this date.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
          >
            Upload File
          </Button>
        </div>
      </form>
    </Modal>
  );
};