'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, AlertType } from '@/components/common/Alert';

interface AlertContextProps {
  showAlert: (type: AlertType, message: string, autoClose?: boolean, duration?: number) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextProps>({
  showAlert: () => {},
  hideAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alertConfig, setAlertConfig] = useState<{
    type: AlertType;
    message: string;
    visible: boolean;
    autoClose: boolean;
    duration: number;
  } | null>(null);

  const showAlert = (
    type: AlertType,
    message: string,
    autoClose = true,
    duration = 5000
  ) => {
    setAlertConfig({
      type,
      message,
      visible: true,
      autoClose,
      duration,
    });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {alertConfig && alertConfig.visible && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full">
          <Alert
            type={alertConfig.type}
            message={alertConfig.message}
            onClose={hideAlert}
            autoClose={alertConfig.autoClose}
            duration={alertConfig.duration}
          />
        </div>
      )}
      {children}
    </AlertContext.Provider>
  );
};