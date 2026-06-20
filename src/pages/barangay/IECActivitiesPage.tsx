import { useState, useRef } from "react";
import { Plus, Search, Megaphone, BookOpen, School, Users, Pencil, Trash2, Paperclip, X, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useIEC } from "../../context/IECContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import type { IECActivityType, IECAttachment } from "../../types";
import { cn } from "../../lib/utils";

const TYPE_CONFIG: Record<IECActivityType, { label: string; color: string; icon: typeof Megaphone }> = {
  TRAINING: { label: "Training", color: "bg-purple-100 text-purple-700", icon: BookOpen },
  CAMPAIGN: { label: "Campaign", color: "bg-green-100 text-green-700", icon: Megaphone },
  SCHOOL: { label: "School", color: "bg-blue-100 text-blue-700", icon: School },
  COMMUNITY: { label: "Community", color: "bg-amber-100 text-amber-700", icon: Users },
};

export function IECActivitiesPage() {
  const { user } = useAuth();
  const { getByBarangay, addActivity, updateActivity, deleteActivity } = useIEC();
  const barangayId = user?.barangayId ?? "brgy-001";
  const activities = getByBarangay(barangayId);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<IECActivityType>("TRAINING");
  const [formTitle, setFormTitle] = useState("");
  const [formParticipants, setFormParticipants] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formOrdinance, setFormOrdinance] = useState("");
  const [formAttachments, setFormAttachments] = useState<IECAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = activities.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalParticipants = activities.reduce((s, a) => s + a.participants, 0);
  const typeCounts = (["TRAINING", "CAMPAIGN", "SCHOOL", "COMMUNITY"] as IECActivityType[]).map((t) => ({
    type: t,
    count: activities.filter((a) => a.type === t).length,
    participants: activities.filter((a) => a.type === t).reduce((s, a) => s + a.participants, 0),
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormAttachments((prev) => [
          ...prev,
          { name: file.name, mimeType: file.type, dataUrl: ev.target?.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAttachment = (idx: number) => {
    setFormAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const openAdd = () => {
    setEditingId(null);
    setFormDate("");
    setFormType("TRAINING");
    setFormTitle("");
    setFormParticipants("");
    setFormDescription("");
    setFormOrdinance("");
    setFormAttachments([]);
    setShowDialog(true);
  };

  const openEdit = (id: string) => {
    const a = activities.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    setFormDate(a.date);
    setFormType(a.type);
    setFormTitle(a.title);
    setFormParticipants(String(a.participants));
    setFormDescription(a.description);
    setFormOrdinance(a.ordinance ?? "");
    setFormAttachments(a.attachments ?? []);
    setShowDialog(true);
  };

  const handleSave = () => {
    const participants = parseInt(formParticipants) || 0;
    const patch = {
      date: formDate,
      type: formType,
      title: formTitle,
      participants,
      description: formDescription,
      ordinance: formOrdinance.trim() || undefined,
      attachments: formAttachments.length ? formAttachments : undefined,
    };
    if (editingId) {
      updateActivity(editingId, patch);
    } else {
      addActivity({ barangayId, ...patch });
    }
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="IEC Activities"
        subtitle="Information, Education, and Communication activities for waste management"
      >
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </PageHeader>

      {/* Summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {typeCounts.map(({ type, count, participants }) => {
          const { label, color, icon: Icon } = TYPE_CONFIG[type];
          return (
            <div key={type} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", color)}>
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{participants} participants</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <p className="text-sm font-semibold text-green-800">YTD Total: {activities.length} activities</p>
        <p className="text-sm text-green-700">{totalParticipants.toLocaleString()} total participants reached</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-60"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["All", "TRAINING", "CAMPAIGN", "SCHOOL", "COMMUNITY"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                typeFilter === t ? "bg-[#16a34a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {t === "All" ? "All" : TYPE_CONFIG[t as IECActivityType].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Date</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Title</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Participants</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Description</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((a) => {
                const { label, color } = TYPE_CONFIG[a.type];
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">{a.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", color)}>
                        {label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">
                      <p className="truncate">{a.title}</p>
                      {a.attachments?.length ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 mt-0.5">
                          <Paperclip className="h-3 w-3" />
                          {a.attachments.length} file{a.attachments.length > 1 ? "s" : ""}
                        </span>
                      ) : null}
                      {a.ordinance && (
                        <span className="block text-[10px] text-slate-400 mt-0.5 truncate">{a.ordinance}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{a.participants}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden lg:table-cell max-w-xs">
                      <p className="truncate">{a.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(a.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteActivity(a.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Megaphone className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No IEC activities found.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Activity" : "Log IEC Activity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Activity Date</Label>
                <Input
                  className="mt-1.5"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as IECActivityType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["TRAINING", "CAMPAIGN", "SCHOOL", "COMMUNITY"] as IECActivityType[]).map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_CONFIG[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Activity Title</Label>
              <Input
                className="mt-1.5"
                placeholder="Title of the activity"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>No. of Participants</Label>
              <Input
                className="mt-1.5"
                type="number"
                placeholder="0"
                value={formParticipants}
                onChange={(e) => setFormParticipants(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1.5 min-h-[80px] text-sm"
                placeholder="Brief description of the activity..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>
                Ordinance Reference{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g., Barangay Ordinance No. 01-2025"
                value={formOrdinance}
                onChange={(e) => setFormOrdinance(e.target.value)}
              />
            </div>
            <div>
              <Label>Evidence / Attachments <span className="text-slate-400 font-normal">(optional)</span></Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="mt-1.5 gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-3.5 w-3.5" />
                Attach Files
              </Button>
              {formAttachments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {formAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                      {att.mimeType.startsWith("image/") ? (
                        <img src={att.dataUrl} alt={att.name} className="h-10 w-10 rounded object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-slate-500" />
                        </div>
                      )}
                      <span className="text-xs text-slate-700 truncate flex-1">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#16a34a] hover:bg-green-700">
              {editingId ? "Update Activity" : "Save Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
