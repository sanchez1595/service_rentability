import { useState } from 'react';
import { Vista } from '../types';

export const useNavegacion = () => {
  const [vistaActiva, setVistaActiva] = useState<Vista>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cambiarVista = (vista: Vista) => {
    setVistaActiva(vista);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return {
    vistaActiva,
    sidebarOpen,
    cambiarVista,
    toggleSidebar,
    setVistaActiva,
    setSidebarOpen
  };
};