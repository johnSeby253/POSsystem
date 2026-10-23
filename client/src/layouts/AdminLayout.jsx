
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = ({ user, onLogout }) => {
  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      {/* Fixed header */}
      <header className="fixed inset-x-0 top-0 z-50 h-16">
        <Header user={user} onLogout={onLogout} />
      </header>

      <div className="h-full pt-16">
        <Sidebar user={user} />

        {/* Scrollable main content */}
        <main className="ml-0 h-full min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6 md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
