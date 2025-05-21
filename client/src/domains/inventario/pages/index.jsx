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

const InventoryIndex = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false); // Set to true for initial loading animation
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
  useEffect(() => {
    if (user && user.tipo_usuario !== 'admin' && user.tipo_usuario !== 'inventario') {
      toast.warning('Acceso limitado: No tienes todos los permisos para el sistema de inventario');
    }
  }, [user]);

  // Renderizar el contenido basado en la sección activa
  const renderContent = () => {
    if (loading) {
      return <InventoryLoader />;
    }
    
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
    <InventorySidebarLayout>
      {renderContent()}
    </InventorySidebarLayout>
  );
};

export default InventoryIndex;