import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Users, BarChart3, ChevronRight,
  Phone, Mail, Edit, Building2,
} from "lucide-react";
import { barangays } from "../data/barangays";
import { submissions } from "../data/submissions";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { StatusBadge } from "../components/shared/StatusBadge";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
export function BarangayProfilePage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  // Restrict encoder/captain to own barangay
  const isRestricted = hasRole("BARANGAY_ENCODER", "BARANGAY_CAPTAIN");
  const visibleBarangays = isRestricted && user?.barangayId
    ? barangays.filter((b) => b.id === user.barangayId)
    : barangays;

  const districts = ["All", ...Array.from(new Set(barangays.map((b) => b.district)))];

  const filtered = visibleBarangays.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.captainName.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = districtFilter === "All" || b.district === districtFilter;
    return matchSearch && matchDistrict;
  });

  const selected = selectedBarangay ? barangays.find((b) => b.id === selectedBarangay) : null;
  const selectedSub = selected ? submissions.find((s) => s.barangayId === selected.id) : null;

  // Auto-select first barangay for restricted users
  useEffect(() => {
    if (isRestricted && user?.barangayId && !selectedBarangay) {
      setSelectedBarangay(user.barangayId);
    }
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRestricted ? `${user?.barangayName} — Profile` : "Barangay Profiles"}
        subtitle={isRestricted ? "Your barangay profile and compliance record" : `${barangays.length} barangays in Calamba City, Laguna`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List panel */}
        {!isRestricted && (
          <div className="lg:col-span-1 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search barangay..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrictFilter(d)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    districtFilter === d
                      ? "bg-[#16a34a] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No barangays found</div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {filtered.map((brgy) => {
                    const sub = submissions.find((s) => s.barangayId === brgy.id);
                    const isActive = selectedBarangay === brgy.id;
                    return (
                      <li key={brgy.id}>
                        <button
                          onClick={() => setSelectedBarangay(brgy.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                            isActive ? "bg-green-50 border-l-2 border-[#16a34a]" : ""
                          }`}
                        >
                          <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-green-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{brgy.name}</p>
                            <p className="text-xs text-slate-500 truncate">{brgy.district}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {sub?.overallScore ? (
                              <p className="text-sm font-bold text-slate-900">{sub.overallScore.toFixed(2)}</p>
                            ) : (
                              <StatusBadge status={sub?.status ?? "DRAFT"} />
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <p className="text-xs text-slate-400 text-center">{filtered.length} of {barangays.length} barangays</p>
          </div>
        )}

        {/* Detail panel */}
        <div className={isRestricted ? "col-span-3" : "lg:col-span-2"}>
          {selected ? (
            <div className="space-y-4">
              {/* Profile header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {selected.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm text-slate-500">{selected.district}, Calamba City</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm text-slate-500">{selected.captainName}</span>
                          <Badge variant="slate" className="text-[10px]">Barangay Captain</Badge>
                        </div>
                      </div>
                    </div>
                    {(hasRole("SYSTEM_ADMIN", "CENRO_EVALUATOR") || isRestricted) && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Population</p>
                      <p className="text-lg font-bold text-slate-900">{selected.population.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Area (ha)</p>
                      <p className="text-lg font-bold text-slate-900">{selected.areaHectares}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                      <p className="text-xs text-slate-500">Contact</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <p className="text-xs font-medium text-slate-700 truncate">{selected.contactEmail}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <p className="text-xs font-medium text-slate-700">{selected.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance status */}
              {selectedSub && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">2025 S1 Compliance Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <StatusBadge status={selectedSub.status} />
                        {selectedSub.overallScore && (
                          <ScoreBadge score={selectedSub.overallScore} size="md" />
                        )}
                      </div>

                      {selectedSub.categoryScores && (
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(selectedSub.categoryScores).map(([cat, score]) => {
                            const labels: Record<string, string> = {
                              SWM_PROGRAMS: "SWM Programs",
                              COMMITTEE: "Committee",
                              WASTE_COLLECTION_FEES: "Collection & Fees",
                              ENV_COMMUNITY_IMPACT: "Env. Impact",
                            };
                            return (
                              <div key={cat} className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500">{labels[cat]}</p>
                                <ScoreBadge score={score} size="sm" className="mt-1" />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/audit/${selectedSub.id}`)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          View Checklist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/results/${selectedSub.id}`)}
                        >
                          Compliance Results
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-12">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto" />
                <p className="mt-3 text-slate-500 font-medium">Select a barangay</p>
                <p className="text-sm text-slate-400 mt-1">Click a barangay from the list to view its profile</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
