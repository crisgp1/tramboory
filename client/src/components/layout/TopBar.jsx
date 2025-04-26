import { useAuth } from '@/hooks/useAuth';
import { 
  HiOutlineMenu, HiOutlineBell, HiOutlineSearch, 
  HiOutlineLogout, HiOutlineUserCircle
} from 'react-icons/hi';

const TopBar = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 focus:outline-none"
          >
            <HiOutlineMenu className="h-6 w-6" />
          </button>
          
          <div className="relative mx-4 lg:mx-0 hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <HiOutlineSearch className="h-5 w-5 text-gray-500" />
            </span>
            <input
              className="form-input w-32 sm:w-64 rounded-md pl-10 pr-4 py-2 border border-gray-300 focus:border-indigo-300"
              type="text"
              placeholder="Buscar..."
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="flex mx-4 text-gray-600 focus:outline-none">
            <HiOutlineBell className="h-6 w-6" />
          </button>
          
          <div className="relative">
            <button className="flex items-center text-gray-600 focus:outline-none">
              <div className="flex items-center">
                <HiOutlineUserCircle className="h-6 w-6 mr-2" />
                <span className="hidden md:inline-block font-medium">{user?.nombre || 'Usuario'}</span>
              </div>
            </button>
          </div>
          
          <button 
            onClick={logout}
            className="ml-4 text-gray-600 focus:outline-none"
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