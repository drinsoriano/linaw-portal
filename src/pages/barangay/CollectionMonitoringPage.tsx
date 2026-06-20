import { useState } from "react";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { mockCollectionLogs } from "../../data/collectionLogs";
import { cn } from "../../lib/utils";

export function CollectionMonitoringPage() {
  const { user } = useAuth();
  const barangayId = user?.barangayId ?? "brgy-001";
  const logs = mockCollectionLogs.filter((l) => l.barangayId === barangayId);
  const [showAdd, setShowAdd] = useState(false);

  const missed = logs.filter((l) => l.missedAreas.length > 0);
  const ppeIssues = logs.filter((l) => !l.ppePassed);
  const vehicleIssues = logs.filter((l) => !l.vehiclePassed);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collection Monitoring"
        subtitle="Track collection schedules, missed areas, and compliance logs"
      >
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Log Collection
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Logs", value: logs.length, color: "text-slate-900", bg: "bg-white border-slate-200" },
          { label: "Missed Collections", value: missed.length, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Compliance Issues", value: ppeIssues.length + vehicleIssues.length, color: "text-red-700", bg: "bg-red-50 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
            <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Logs ({logs.length})</TabsTrigger>
          <TabsTrigger value="missed">Missed Areas ({missed.length})</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Issues ({ppeIssues.length + vehicleIssues.length})</TabsTrigger>
        </TabsList>

        {/* All logs */}
        <TabsContent value="all" className="mt-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Hauler</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">Truck</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Volume (kg)</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">PPE</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Vehicle</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Missed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((l) => (
                    <tr key={l.id} className={cn("hover:bg-slate-50", (l.missedAreas.length > 0 || !l.ppePassed || !l.vehiclePassed) && "bg-amber-50/40")}>
                      <td className="py-3 px-4 font-medium text-slate-900">{l.date}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{l.haulerName}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">{l.truckPlate}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">{l.wasteVolKg.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        {l.ppePassed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {l.vehiclePassed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {l.missedAreas.length > 0 ? (
                          <span className="text-xs text-red-700 bg-red-100 rounded-full px-2 py-0.5 font-semibold">{l.missedAreas.length}</span>
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Missed areas */}
        <TabsContent value="missed" className="mt-4">
          <div className="space-y-3">
            {missed.map((l) => (
              <div key={l.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-amber-900">{l.date} — {l.haulerName}</p>
                  <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 font-semibold">
                    {l.missedAreas.length} missed
                  </span>
                </div>
                <ul className="space-y-1">
                  {l.missedAreas.map((area, i) => (
                    <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {area}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-amber-700 mt-2 italic">{l.notes}</p>
              </div>
            ))}
            {missed.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No missed collection areas recorded.</p>
            )}
          </div>
        </TabsContent>

        {/* Compliance issues */}
        <TabsContent value="compliance" className="mt-4">
          <div className="space-y-3">
            {logs.filter((l) => !l.ppePassed || !l.vehiclePassed).map((l) => (
              <div key={l.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-red-900">{l.date} — {l.truckPlate}</p>
                </div>
                <div className="flex gap-4">
                  {!l.ppePassed && (
                    <span className="text-xs text-red-700 bg-red-100 rounded-full px-2 py-0.5 font-semibold flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> PPE Non-Compliant
                    </span>
                  )}
                  {!l.vehiclePassed && (
                    <span className="text-xs text-red-700 bg-red-100 rounded-full px-2 py-0.5 font-semibold flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Vehicle Non-Compliant
                    </span>
                  )}
                </div>
                <p className="text-xs text-red-700 mt-2 italic">{l.notes}</p>
              </div>
            ))}
            {ppeIssues.length + vehicleIssues.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No compliance issues recorded.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add log dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Collection Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Collection Date</Label>
                <Input className="mt-1.5" type="date" />
              </div>
              <div>
                <Label>Volume (kg)</Label>
                <Input className="mt-1.5" type="number" placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Hauler Name</Label>
              <Input className="mt-1.5" placeholder="Company name" />
            </div>
            <div>
              <Label>Truck Plate</Label>
              <Input className="mt-1.5" placeholder="e.g. LAG-1234" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                PPE Compliant
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Vehicle Compliant
              </label>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea className="mt-1.5" placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => setShowAdd(false)}>Save Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
