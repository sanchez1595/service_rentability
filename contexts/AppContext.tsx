import React, { createContext, useContext, ReactNode } from 'react';

// Interface básica para el contexto de la aplicación
interface AppContextType {
  // Por ahora vacío, puede expandirse según necesidades futuras
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const value = {
    // Por ahora vacío
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 