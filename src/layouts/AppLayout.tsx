import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SubSidebar } from './SubSidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../components/ui/Toast';

export function AppLayout() {
  const location = useLocation();
  const isInbox = location.pathname === '/' || location.pathname.startsWith('/inbox') || location.pathname.startsWith('/guests');
  const isEngines = location.pathname.startsWith('/engines');
  const isAnalytics = location.pathname.startsWith('/analytics');

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: 'var(--color-brand-bg)' }}>
      <Sidebar />
      {!isInbox && <SubSidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        {!isInbox && !isEngines && !isAnalytics && <Topbar />}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
