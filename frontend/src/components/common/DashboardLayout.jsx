import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] bg-grid-pattern text-slate-900 font-sans selection:bg-[#EC4899] selection:text-white">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
