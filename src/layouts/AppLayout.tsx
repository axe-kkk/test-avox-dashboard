import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SubSidebar } from './SubSidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../components/ui/Toast';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-brand-bg)' }}>
      <Sidebar />
      <SubSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
