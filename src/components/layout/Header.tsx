import { useState } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../../types";
import { cn } from "../../lib/utils";

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Bagong Kalsada submission validated", time: "2h ago", read: false, type: "SUCCESS" },
  { id: 2, title: "3 submissions pending CENRO review", time: "5h ago", read: false, type: "WARNING" },
  { id: 3, title: "Audit cycle 2025 S1 is now active", time: "1d ago", read: true, type: "INFO" },
  { id: 4, title: "WCF5 CAP deadline approaching — Banlic", time: "2d ago", read: true, type: "WARNING" },
];

const NOTIF_COLORS = {
  SUCCESS: "bg-green-500",
  WARNING: "bg-amber-500",
  INFO: "bg-blue-500",
  ERROR: "bg-red-500",
};

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Page title */}
      <div className="flex-1">
        <p className="text-sm text-slate-400">
          Calamba City •{" "}
          <span className="font-medium text-slate-600">LINAW SWM Compliance Portal</span>
        </p>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-56">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
          placeholder="Search barangays..."
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
          className="relative h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-900 text-sm">Notifications</p>
              <span className="text-xs text-slate-400">{unreadCount} unread</span>
            </div>
            <ul className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer",
                    !n.read && "bg-blue-50/50"
                  )}
                >
                  <span className={cn("mt-1 h-2 w-2 rounded-full flex-shrink-0", NOTIF_COLORS[n.type as keyof typeof NOTIF_COLORS])} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs", !n.read ? "font-semibold text-slate-900" : "text-slate-600")}>
                      {n.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 border-t border-slate-100">
              <button className="text-xs text-[#16a34a] font-medium hover:underline">
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
          className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="h-8 w-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name.charAt(0) ?? "?"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight">
              {user ? ROLE_LABELS[user.role] : ""}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {showUser && (
          <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <ul className="py-1">
              <li>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
