import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, ClipboardList, FolderOpen,
  BarChart3, GitBranch, SearchCode, FileText,
  Users, Settings, LogOut, Leaf, ChevronLeft, ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types";
import { ROLE_LABELS } from "../../types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "BARANGAY_ENCODER", "BARANGAY_CAPTAIN", "RESEARCHER", "PUBLIC_VIEWER"],
  },
  {
    label: "Barangay Profile",
    to: "/barangays",
    icon: Building2,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "BARANGAY_ENCODER", "BARANGAY_CAPTAIN", "RESEARCHER"],
  },
  {
    label: "Audit Checklist",
    to: "/audit",
    icon: ClipboardList,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "BARANGAY_ENCODER", "BARANGAY_CAPTAIN", "RESEARCHER"],
  },
  {
    label: "Evidence Repository",
    to: "/evidence",
    icon: FolderOpen,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "BARANGAY_ENCODER", "BARANGAY_CAPTAIN", "RESEARCHER"],
  },
  {
    label: "Compliance Results",
    to: "/results",
    icon: BarChart3,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "BARANGAY_ENCODER", "BARANGAY_CAPTAIN", "RESEARCHER"],
  },
  {
    label: "PDCA Action Plan",
    to: "/action-plan",
    icon: GitBranch,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "BARANGAY_CAPTAIN", "RESEARCHER"],
  },
  {
    label: "Root Cause Analysis",
    to: "/rca",
    icon: SearchCode,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "RESEARCHER"],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: FileText,
    roles: ["SYSTEM_ADMIN", "CENRO_EVALUATOR", "RESEARCHER"],
  },
  {
    label: "User Management",
    to: "/users",
    icon: Users,
    roles: ["SYSTEM_ADMIN"],
  },
  {
    label: "System Settings",
    to: "/settings",
    icon: Settings,
    roles: ["SYSTEM_ADMIN"],
  },
];

const ROLE_COLORS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "bg-purple-100 text-purple-800",
  CENRO_EVALUATOR: "bg-blue-100 text-blue-800",
  BARANGAY_ENCODER: "bg-green-100 text-green-800",
  BARANGAY_CAPTAIN: "bg-emerald-100 text-emerald-800",
  RESEARCHER: "bg-amber-100 text-amber-800",
  PUBLIC_VIEWER: "bg-slate-100 text-slate-600",
};

export function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#0f2d1a] text-white transition-all duration-300 border-r border-[#1a4229] relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-[#1a4229]", collapsed && "justify-center")}>
        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-[#16a34a] flex items-center justify-center">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">LINAW</p>
            <p className="text-[10px] text-green-400 leading-tight">Calamba City SWM Portal</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 z-10 h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-slate-600" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-slate-600" />
        )}
      </button>

      {/* User info */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-b border-[#1a4229]">
          <p className="text-xs font-semibold text-white truncate">{user.name}</p>
          <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", ROLE_COLORS[user.role])}>
            {ROLE_LABELS[user.role]}
          </span>
          {user.barangayName && (
            <p className="mt-1 text-[10px] text-green-400 truncate">{user.barangayName}</p>
          )}
        </div>
      )}
      {user && collapsed && (
        <div className="flex justify-center py-3 border-b border-[#1a4229]">
          <div className="h-8 w-8 rounded-full bg-[#16a34a] flex items-center justify-center text-xs font-bold">
            {user.name.charAt(0)}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                      isActive
                        ? "bg-[#16a34a] text-white font-medium"
                        : "text-green-200 hover:bg-[#1a4229] hover:text-white",
                      collapsed && "justify-center px-2"
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin badge */}
      {!collapsed && hasRole("SYSTEM_ADMIN") && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 rounded-lg bg-purple-900/30 px-3 py-2">
            <Shield className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] text-purple-300">System Administrator</span>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className={cn("p-3 border-t border-[#1a4229]", collapsed && "flex justify-center")}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors w-full",
            collapsed && "justify-center w-auto px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
