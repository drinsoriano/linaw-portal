import { useState } from "react";
import { Trophy, Medal, Search } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { ScoreBadge } from "../../components/shared/ScoreBadge";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { barangays } from "../../data/barangays";
import { useSubmissions } from "../../context/SubmissionsContext";
import type { District } from "../../types";
import { cn } from "../../lib/utils";

const DISTRICTS: string[] = ["All Districts", "District I", "District II", "District III", "District IV", "Poblacion"];

export function PerformanceRankingPage() {
  const { submissions, activeCycle, cycles } = useSubmissions();
  const sortedCycles = [...cycles].sort((a, b) => b.year - a.year);
  const [selectedCycleId, setSelectedCycleId] = useState(activeCycle.id);
  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) ?? activeCycle;
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All Districts");

  const cycleSubs = submissions.filter((s) => s.cycleId === selectedCycleId);

  const ranked = barangays
    .map((brgy) => {
      const sub = cycleSubs.find((s) => s.barangayId === brgy.id);
      return {
        id: brgy.id,
        name: brgy.name,
        district: brgy.district,
        captainName: brgy.captainName,
        score: sub?.overallScore ?? null,
        status: sub?.status ?? "DRAFT",
      };
    })
    .sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });

  const filtered = ranked.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = districtFilter === "All Districts" || r.district === districtFilter;
    return matchSearch && matchDistrict;
  });

  const getScoreRowClass = (rank: number, score: number | null) => {
    if (score === null) return "";
    if (rank <= 3) return "bg-green-50 border-l-4 border-l-green-500";
    if (rank > ranked.filter((r) => r.score !== null).length - 5) return "bg-red-50 border-l-4 border-l-red-400";
    return "";
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  let rankCounter = 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barangay Performance Ranking"
        subtitle={`All 54 barangays ranked by overall compliance score — ${selectedCycle.label}`}
      >
        <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
          <SelectTrigger className="w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortedCycles.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}{c.id === activeCycle.id ? " (Active)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-200 border border-green-400" />
          Top 3
          <span className="inline-block h-3 w-3 rounded-sm bg-red-100 border border-red-300 ml-2" />
          Bottom 5
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search barangay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-60"
          />
        </div>
        <Select value={districtFilter} onValueChange={setDistrictFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISTRICTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="self-center text-xs text-slate-400 ml-auto">{filtered.length} barangays</p>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 w-16">Rank</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Barangay</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">District</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Captain</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Score</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => {
                if (r.score !== null) rankCounter++;
                const rank = r.score !== null ? rankCounter : null;

                return (
                  <tr key={r.id} className={cn("hover:brightness-95 transition-colors", rank ? getScoreRowClass(rank, r.score) : "")}>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {rank ? (
                          <>
                            {getMedalIcon(rank)}
                            <span className={cn(
                              "text-sm font-bold",
                              rank === 1 ? "text-yellow-600" : rank === 2 ? "text-slate-500" : rank === 3 ? "text-amber-600" : "text-slate-700"
                            )}>
                              #{rank}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                    <td className="py-3 px-4 text-slate-600 hidden md:table-cell text-xs">{r.district as District}</td>
                    <td className="py-3 px-4 text-slate-600 hidden lg:table-cell text-xs">{r.captainName}</td>
                    <td className="py-3 px-4 text-center">
                      {r.score !== null ? (
                        <ScoreBadge score={r.score} size="sm" />
                      ) : (
                        <span className="text-xs text-slate-400">No score</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={r.status as Parameters<typeof StatusBadge>[0]["status"]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
