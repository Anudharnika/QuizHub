import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen h-[100dvh] overflow-hidden w-full max-w-full bg-[#FFFDF9] bg-grid-pattern text-slate-900 font-sans selection:bg-[#EC4899] selection:text-white">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full max-w-full">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-8 pb-24 lg:pb-8 min-w-0 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

