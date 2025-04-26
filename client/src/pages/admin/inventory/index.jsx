import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import InventoryMenu from '../../components/inventory/InventoryMenu';
import InventoryLoader from '../../components/inventory/InventoryLoader';
import InventoryDashboard from './InventoryDashboard';
import MateriasPrimas from './MateriasPrimas';
import UnidadesMedida from './UnidadesMedida';
import Proveedores from './Proveedores';
import Lotes from './Lotes';
import Movimientos from './Movimientos';
import TiposAjuste from './TiposAjuste';
import Conversiones from './Conversiones';
import Alertas from './Alertas';

// Sistema unificado de autenticación - No usa modal específico
const InventoryIndex = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!authLoading) {
      // Si no está autenticado, redirigir al login global
      if (!isAuthenticated) {
        toast.info('Por favor inicia sesión para acceder al sistema de inventario');
        navigate('/signin', { state: { returnUrl: '/inventory' } });
      } 
      // Verificar permisos de acceso al módulo
      else if (user && user.tipo_usuario !== 'admin' && user.tipo_usuario !== 'inventario') {
        toast.error('No tienes permisos para acceder al sistema de inventario');
        navigate('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Renderizar pantalla de carga mientras verifica autenticación
  if (authLoading || !isAuthenticated) {
    return <InventoryLoader />;
  }

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {isAuthenticated && (
        <div className="flex flex-col h-screen lg:flex-row">
          {/* Menú de navegación lateral */}
          <InventoryMenu 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          
          {/* Contenido principal */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default InventoryIndex;