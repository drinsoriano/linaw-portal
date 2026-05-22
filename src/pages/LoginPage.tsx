import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Leaf, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";
import { ROLE_LABELS } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "Full access to all modules, user management, and system configuration.",
  CENRO_EVALUATOR: "Validate submissions, monitor city-wide compliance, approve reports.",
  BARANGAY_ENCODER: "Encode audit checklist, upload evidence, submit for barangay approval.",
  BARANGAY_CAPTAIN: "Review and approve barangay audit submissions to CENRO.",
  RESEARCHER: "Analyze compliance data, generate reports, and create PDCA recommendations.",
  PUBLIC_VIEWER: "View public summary dashboard only.",
};

const ROLE_ICONS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "🛡️",
  CENRO_EVALUATOR: "🏛️",
  BARANGAY_ENCODER: "📝",
  BARANGAY_CAPTAIN: "👨‍💼",
  RESEARCHER: "🔬",
  PUBLIC_VIEWER: "👁️",
};

const ROLES_ORDER: UserRole[] = [
  "SYSTEM_ADMIN",
  "CENRO_EVALUATOR",
  "BARANGAY_CAPTAIN",
  "BARANGAY_ENCODER",
  "RESEARCHER",
  "PUBLIC_VIEWER",
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>("CENRO_EVALUATOR");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login(selectedRole);
    setIsLoading(false);
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d1a] via-[#14532d] to-[#166534] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#16a34a] flex items-center justify-center shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">LINAW</h1>
              <p className="text-green-300 text-sm">Calamba City SWM Compliance Portal</p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-4xl font-bold leading-tight">
              Digitizing Solid Waste<br />
              Management Compliance
            </h2>
            <p className="mt-4 text-green-200 text-lg leading-relaxed">
              A PDCA-based compliance monitoring system for 54 barangays in Calamba City under Republic Act No. 9003.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: "54", sub: "Barangays Monitored" },
              { label: "39", sub: "Audit Indicators" },
              { label: "4", sub: "PDCA Phases" },
              { label: "4.21", sub: "Compliance Benchmark" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-3xl font-bold text-white">{stat.label}</p>
                <p className="text-green-300 text-xs mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-green-400 text-xs">
            © 2025 Calamba City LGU — CENRO. Developed under PUPOUS research.
          </p>
          <p className="text-green-500 text-xs mt-1">RA 9003 Ecological Solid Waste Management Act</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white lg:rounded-l-3xl shadow-2xl">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-[#16a34a] flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">LINAW Portal</p>
              <p className="text-xs text-slate-500">Calamba City SWM</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select your role and enter your credentials to access the portal.
          </p>

          {/* Role selector */}
          <div className="mt-6">
            <Label className="text-slate-700 font-semibold text-sm mb-3 block">
              Select User Role
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES_ORDER.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all",
                    selectedRole === role
                      ? "border-[#16a34a] bg-green-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <span className="text-lg mt-0.5">{ROLE_ICONS[role]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", selectedRole === role ? "text-[#166534]" : "text-slate-800")}>
                      {ROLE_LABELS[role]}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </div>
                  {selectedRole === role && (
                    <div className="h-4 w-4 rounded-full bg-[#16a34a] flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="email" className="text-slate-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                className="mt-1.5"
                defaultValue={
                  selectedRole === "SYSTEM_ADMIN" ? "admin@linaw.calamba.gov.ph" :
                  selectedRole === "CENRO_EVALUATOR" ? "cenro@calamba.gov.ph" :
                  selectedRole === "BARANGAY_ENCODER" ? "encoder.bagongkalsada@linaw.calamba.gov.ph" :
                  selectedRole === "BARANGAY_CAPTAIN" ? "captain.bagongkalsada@linaw.calamba.gov.ph" :
                  selectedRole === "RESEARCHER" ? "researcher@linaw.calamba.gov.ph" :
                  "public@linaw.calamba.gov.ph"
                }
                key={selectedRole}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  defaultValue="••••••••"
                  className="pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!selectedRole || isLoading}
            className="mt-6 w-full h-11 text-base gap-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>Sign In <ChevronRight className="h-4 w-4" /></>
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-slate-400">
            This is a prototype with mock data. No real authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
