import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { barangays } from "../../data/barangays";

const CONCERN_TYPES = [
  "Illegal Dumping / Littering",
  "Open Burning",
  "Missed Waste Collection",
  "Uncovered Garbage Truck",
  "Clogged Drainage / Flooding",
  "Dirty Public Area",
  "MRF / Recycling Concern",
  "Hauler Non-Compliance",
  "Noise Pollution from Collection",
  "Other Waste-Related Concern",
];

export function CitizenReportPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [barangayId, setBarangayId] = useState("");
  const [concernType, setConcernType] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barangayId || !concernType || !description) return;
    const report = {
      id: `citizen-${Date.now()}`,
      barangayId,
      concernType,
      description,
      contactName: name || undefined,
      contactEmail: email || undefined,
      submittedAt: new Date().toISOString(),
      status: "RECEIVED" as const,
    };
    const existing = JSON.parse(localStorage.getItem("linaw_citizen_reports") ?? "[]");
    localStorage.setItem("linaw_citizen_reports", JSON.stringify([...existing, report]));
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0f2d1a] text-white">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#16a34a] flex items-center justify-center">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">LINAW Citizen Feedback</p>
            <p className="text-[10px] text-green-400">Calamba City SWM Portal</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/public")}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Public Dashboard
        </button>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for your report. Your concern has been recorded and will be forwarded to the relevant barangay office. You may be contacted for follow-up if you provided your email.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setBarangayId("");
                  setConcernType("");
                  setDescription("");
                  setName("");
                  setEmail("");
                }}
              >
                Submit Another Report
              </Button>
              <Button onClick={() => navigate("/public")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Submit a Waste Management Concern</h1>
            <p className="text-sm text-slate-500 mb-6">
              Help us keep Calamba City clean. Report illegal dumping, missed collections, or other waste-related issues.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Barangay <span className="text-red-500">*</span></Label>
                <Select value={barangayId} onValueChange={setBarangayId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select the barangay where the concern is located" />
                  </SelectTrigger>
                  <SelectContent>
                    {barangays.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type of Concern <span className="text-red-500">*</span></Label>
                <Select value={concernType} onValueChange={setConcernType}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select concern type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONCERN_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description <span className="text-red-500">*</span></Label>
                <Textarea
                  className="mt-1.5 min-h-[100px] text-sm"
                  placeholder="Describe the issue in detail. Include the specific location (street name, purok, landmark) and approximate time if relevant."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500 mb-3">
                  Contact information is optional. Providing it allows the barangay to follow up with you.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Your Name (optional)</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email (optional)</Label>
                    <Input
                      className="mt-1.5"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#16a34a] hover:bg-green-700"
                disabled={!barangayId || !concernType || !description}
              >
                Submit Report
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
