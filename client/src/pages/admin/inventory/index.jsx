import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import InventorySidebarLayout from '@/components/inventory/InventorySidebarLayout';
import InventoryLoader from '@/components/inventory/InventoryLoader';
import InventoryDashboard from './InventoryDashboard';
import MateriasPrimas from './MateriasPrimas';
import UnidadesMedida from './UnidadesMedida';
import Proveedores from './Proveedores';
import Lotes from './Lotes';
import Movimientos from './Movimientos';
import TiposAjuste from './TiposAjuste';
import Conversiones from './Conversiones';
import Alertas from './Alertas';

// La autenticación se maneja a través del componente ProtectedRoute en App.jsx
const InventoryIndex = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sincronizar el estado activeSection con la ruta actual
  useEffect(() => {
    const path = location.pathname;
    if (path === '/inventory') {
      setActiveSection('dashboard');
    } else if (path.includes('materias-primas')) {
      setActiveSection('materias-primas');
    } else if (path.includes('unidades-medida')) {
      setActiveSection('unidades-medida');
    } else if (path.includes('proveedores')) {
      setActiveSection('proveedores');
    } else if (path.includes('lotes')) {
      setActiveSection('lotes');
    } else if (path.includes('movimientos')) {
      setActiveSection('movimientos');
    } else if (path.includes('tipos-ajuste')) {
      setActiveSection('tipos-ajuste');
    } else if (path.includes('conversiones')) {
      setActiveSection('conversiones');
    } else if (path.includes('alertas')) {
      setActiveSection('alertas');
    }
  }, [location.pathname]);
  
  // Mostrar mensaje de advertencia si el usuario no tiene permisos adecuados
  // pero sin redirigir (ProtectedRoute ya maneja las redirecciones principales)
  useEffect(() => {
    if (user && user.tipo_usuario !== 'admin' && user.tipo_usuario !== 'inventario') {
      toast.warning('Acceso limitado: No tienes todos los permisos para el sistema de inventario');
    }
  }, [user]);

  // Renderizar el contenido basado en la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <InventoryDashboard />;
      case 'materias-primas':
        return <MateriasPrimas />;
      case 'unidades-medida':
        return <UnidadesMedida />;
      case 'proveedores':
        return <Proveedores />;
      case 'lotes':
        return <Lotes />;
      case 'movimientos':
        return <Movimientos />;
      case 'tipos-ajuste':
        return <TiposAjuste />;
      case 'conversiones':
        return <Conversiones />;
      case 'alertas':
        return <Alertas />;
      default:
        return <InventoryDashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Eliminado temporalmente el chequeo de autenticación para pruebas */}
      <InventorySidebarLayout>
        {renderContent()}
      </InventorySidebarLayout>
    </div>
  );
};

export default InventoryIndex;