import { useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { MultiUserForm } from './MultiUserForm';
import { User } from '@/types/user';

interface MultiUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (users: Omit<User, 'id'>[]) => Promise<void>;
}

export const MultiUserModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}: MultiUserModalProps) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle form submission
  const handleSubmit = async (userData: Omit<User, 'id'>[]) => {
    try {
      await onSubmit(userData);
      onClose();
    } catch (error) {
      console.error('Error adding users:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} >
      <MultiUserForm 
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default MultiUserModal;