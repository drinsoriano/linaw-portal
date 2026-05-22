import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string; positive?: boolean };
  className?: string;
  valueColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-green-600",
  iconBg = "bg-green-100",
  trend,
  className,
  valueColor,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={cn("mt-2 text-3xl font-bold text-slate-900", valueColor)}>
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive !== false ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.positive !== false ? "+" : ""}{trend.value}%
                </span>
                <span className="text-xs text-slate-400">{trend.label}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("rounded-xl p-3", iconBg)}>
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
