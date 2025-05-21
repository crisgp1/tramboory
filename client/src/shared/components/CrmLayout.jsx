import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const CrmLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--crm-bg)' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isMobile={isMobile} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'var(--crm-bg)', color: 'var(--crm-text)' }}>
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;