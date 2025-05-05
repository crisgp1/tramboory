import { useAuth } from '@/hooks/useAuth';
import { 
  HiOutlineMenu, HiOutlineBell, HiOutlineSearch, 
  HiOutlineLogout, HiOutlineUserCircle
} from 'react-icons/hi';

const TopBar = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="shadow-sm z-10" style={{ backgroundColor: 'var(--header-bg)' }}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="focus:outline-none"
            style={{ color: 'var(--icon-color)' }}
          >
            <HiOutlineMenu className="h-6 w-6" />
          </button>
          
          <div className="relative mx-4 lg:mx-0 hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <HiOutlineSearch className="h-5 w-5" style={{ color: 'var(--icon-color)' }} />
            </span>
            <input
              className="form-input w-32 sm:w-64 rounded-md pl-10 pr-4 py-2"
              style={{ 
                backgroundColor: 'var(--input-bg)', 
                color: 'var(--input-text)', 
                borderColor: 'var(--input-border)',
              }}
              type="text"
              placeholder="Buscar..."
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="flex mx-4 focus:outline-none" style={{ color: 'var(--icon-color)' }}>
            <HiOutlineBell className="h-6 w-6" />
          </button>
          
          <div className="relative">
            <button className="flex items-center focus:outline-none" style={{ color: 'var(--header-text)' }}>
              <div className="flex items-center">
                <HiOutlineUserCircle className="h-6 w-6 mr-2" style={{ color: 'var(--icon-color)' }} />
                <span className="hidden md:inline-block font-medium">{user?.nombre || 'Usuario'}</span>
              </div>
            </button>
          </div>
          
          <button 
            onClick={logout}
            className="ml-4 focus:outline-none"
            style={{ color: 'var(--icon-color)' }}
            title="Cerrar sesión"
          >
            <HiOutlineLogout className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;