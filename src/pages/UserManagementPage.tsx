import { useState } from "react";
import {
  Search, Plus, Edit, Trash2, Building2, CheckCircle, XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { mockUsers } from "../data/users";
import { barangays } from "../data/barangays";
import type { AppUser, UserRole } from "../types";
import { ROLE_LABELS } from "../types";
import { cn } from "../lib/utils";

const ROLE_COLORS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  CENRO_EVALUATOR: "bg-blue-100 text-blue-800 border-blue-200",
  BARANGAY_SECRETARY: "bg-green-100 text-green-800 border-green-200",
  BARANGAY_COUNCILOR: "bg-teal-100 text-teal-800 border-teal-200",
  BARANGAY_CAPTAIN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  RESEARCHER: "bg-amber-100 text-amber-800 border-amber-200",
  CITIZEN: "bg-slate-100 text-slate-600 border-slate-200",
};

const EXTENDED_USERS: AppUser[] = [
  ...mockUsers,
  { id: "user-007", name: "Nelia Gomez", email: "captain.laguerta@linaw.gov.ph", role: "BARANGAY_CAPTAIN", barangayId: "brgy-013", barangayName: "Laguerta", isActive: true, createdAt: "2024-03-01" },
  { id: "user-008", name: "Rodrigo Pascual Jr.", email: "secretary.makiling@linaw.gov.ph", role: "BARANGAY_SECRETARY", barangayId: "brgy-019", barangayName: "Makiling", isActive: true, createdAt: "2024-03-05" },
  { id: "user-009", name: "Prof. Arvin dela Cruz", email: "researcher2@linaw.gov.ph", role: "RESEARCHER", isActive: false, createdAt: "2024-04-01" },
  { id: "user-010", name: "Luz Villanueva", email: "captain.canlubang@linaw.gov.ph", role: "BARANGAY_CAPTAIN", barangayId: "brgy-008", barangayName: "Canlubang", isActive: true, createdAt: "2024-04-10" },
];

export function UserManagementPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const ROLES_FOR_FILTER: Array<{ value: string; label: string }> = [
    { value: "All", label: "All Roles" },
    ...Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const filtered = EXTENDED_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.barangayName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: EXTENDED_USERS.length,
    active: EXTENDED_USERS.filter((u) => u.isActive).length,
    admins: EXTENDED_USERS.filter((u) => u.role === "SYSTEM_ADMIN" || u.role === "CENRO_EVALUATOR").length,
    barangayUsers: EXTENDED_USERS.filter((u) => ["BARANGAY_SECRETARY", "BARANGAY_COUNCILOR", "BARANGAY_CAPTAIN"].includes(u.role)).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle={`${EXTENDED_USERS.length} users across all roles`}
      >
        <Button onClick={() => { setEditingUser(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, color: "text-slate-900" },
          { label: "Active", value: stats.active, color: "text-green-700" },
          { label: "Admin / CENRO", value: stats.admins, color: "text-blue-700" },
          { label: "Barangay Staff", value: stats.barangayUsers, color: "text-purple-700" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-72"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2">
          {ROLES_FOR_FILTER.map((r) => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                roleFilter === r.value ? "bg-[#16a34a] text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="self-center text-xs text-slate-400 ml-auto">{filtered.length} users</p>
      </div>

      {/* User table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">Barangay</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Joined</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", ROLE_COLORS[u.role])}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {u.barangayName ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-700">{u.barangayName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-500">{u.createdAt}</td>
                  <td className="py-3 px-4 text-center">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 rounded-full px-2 py-0.5">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingUser(u); setShowDialog(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {u.id !== user?.id && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input className="mt-1.5" defaultValue={editingUser?.name} placeholder="Enter full name" />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input className="mt-1.5" type="email" defaultValue={editingUser?.email} placeholder="user@linaw.gov.ph" />
            </div>
            <div>
              <Label>Role</Label>
              <Select defaultValue={editingUser?.role ?? "BARANGAY_SECRETARY"}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Barangay Assignment</Label>
              <Select defaultValue={editingUser?.barangayId ?? "none"}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select barangay (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (city-level role)</SelectItem>
                  {barangays.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editingUser && (
              <div>
                <Label>Temporary Password</Label>
                <Input className="mt-1.5" type="password" placeholder="Set initial password" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowDialog(false)}>
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
