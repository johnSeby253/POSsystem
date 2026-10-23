
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import { routeConfig } from "../routes/routeConfig";

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const userRole = user?.role?.toUpperCase();

  const menuItems = routeConfig.filter(
    (route) =>
      route.isMenu === true &&
      route.permission?.includes(userRole)
  );

  return (
    <>
      {/* Mobile open button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          className="fixed left-0 top-20 z-50 flex items-center justify-center rounded-r-lg bg-slate-900 p-2 text-white shadow-lg transition hover:bg-slate-700 md:hidden"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 overflow-y-auto rounded-tr-2xl bg-slate-900 p-4 text-white shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        {/* Sidebar heading and close button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Menu</h2>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg p-3 transition-colors ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {Icon && <Icon size={20} />}
              <span>{name.trim()}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
