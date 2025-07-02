import React from 'react';
import { Home, Package, ShoppingCart, Settings, X } from 'lucide-react';
import { Vista } from '../../types';

interface SidebarProps {
  vistaActiva: Vista;
  sidebarOpen: boolean;
  onCambiarVista: (vista: Vista) => void;
  onToggleSidebar: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'configuracion', label: 'Configuración', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({
  vistaActiva,
  sidebarOpen,
  onCambiarVista,
  onToggleSidebar
}) => {
  return (
    <>
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggleSidebar}
        />
      )}
      
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-slate-900">Rentability</span>
          </div>
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onCambiarVista(item.id as Vista)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${vistaActiva === item.id 
                        ? 'bg-emerald-100 text-emerald-700 font-medium' 
                        : 'text-slate-600 hover:bg-slate-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};