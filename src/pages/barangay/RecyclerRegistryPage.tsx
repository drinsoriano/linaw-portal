import { useState } from "react";
import { Plus, Search, Recycle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { mockRecyclers, mockMonthlyRecovery } from "../../data/recyclers";
import type { RecyclerType } from "../../types";
import { cn } from "../../lib/utils";

const TYPE_COLORS: Record<RecyclerType, string> = {
  JUNKSHOP: "bg-blue-100 text-blue-700",
  GROUP: "bg-purple-100 text-purple-700",
  INDIVIDUAL: "bg-slate-100 text-slate-700",
};

export function RecyclerRegistryPage() {
  const { user } = useAuth();
  const barangayId = user?.barangayId ?? "brgy-001";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [showAdd, setShowAdd] = useState(false);

  const recyclers = mockRecyclers.filter((r) => r.barangayId === barangayId);
  const filtered = recyclers.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalKg = recyclers.filter((r) => r.isActive).reduce((s, r) => s + r.monthlyKg, 0);
  const recoveryForBarangay = mockMonthlyRecovery.filter((mr) =>
    recyclers.some((r) => r.id === mr.recyclerId)
  );
  const totalIncome = recoveryForBarangay.reduce((s, mr) => s + mr.incomeEstimate, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recycler Registry"
        subtitle="Registered recyclers, junk shops, and eco-groups in this barangay"
      >
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Register Recycler
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-3xl font-bold text-slate-900">{recyclers.filter((r) => r.isActive).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Recyclers</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-3xl font-bold text-green-700">{totalKg.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total kg/month recovered</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-3xl font-bold text-blue-700">₱{totalIncome.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Est. recycling income</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search recycler..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-60"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="JUNKSHOP">Junk Shop</SelectItem>
            <SelectItem value="GROUP">Group</SelectItem>
            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Name</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">Materials</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Monthly (kg)</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.address}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", TYPE_COLORS[r.type])}>
                      {r.type === "JUNKSHOP" ? "Junk Shop" : r.type === "GROUP" ? "Group" : "Individual"}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {r.materials.slice(0, 3).map((m) => (
                        <span key={m} className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5">{m}</span>
                      ))}
                      {r.materials.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{r.materials.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">{r.monthlyKg.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    {r.isActive ? (
                      <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5 font-semibold">Active</span>
                    ) : (
                      <span className="text-xs text-red-700 bg-red-100 rounded-full px-2 py-0.5 font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 hidden lg:table-cell">{r.registeredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Recycle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No recyclers registered yet.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Recycler</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name / Business Name</Label>
              <Input className="mt-1.5" placeholder="Full name or business name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUNKSHOP">Junk Shop</SelectItem>
                    <SelectItem value="GROUP">Group / Cooperative</SelectItem>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monthly Volume (kg)</Label>
                <Input className="mt-1.5" type="number" placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input className="mt-1.5" placeholder="Street address" />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input className="mt-1.5" placeholder="09XX-XXX-XXXX" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => setShowAdd(false)}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
