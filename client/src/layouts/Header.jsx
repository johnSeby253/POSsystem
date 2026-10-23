
import { LogOut, UserRound } from "lucide-react";

const Header = ({ user, onLogout }) => {
  return (
    <header className="relative z-50 flex h-16 w-full items-center justify-between gap-2 rounded-b-md bg-white px-3 shadow-xl sm:px-5 md:px-6">
      {/* App Title */}
      <h2 className="min-w-0 truncate text-base font-semibold text-slate-800 sm:text-lg">
        POS Billing
      </h2>

      {/* User Details and Logout */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* User Profile */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 sm:h-9 sm:w-9">
            <UserRound size={18} className="text-slate-500" />
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-36 truncate text-sm font-medium text-slate-800">
              {user?.username || "Admin"}
            </p>
            <p className="text-xs capitalize text-slate-500">
              {user?.role?.toLowerCase() || "admin"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg p-2 text-red-600 transition hover:bg-red-50 sm:px-3 sm:py-2"
        >
          <LogOut size={18} />
          <span className="hidden text-sm font-medium sm:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
