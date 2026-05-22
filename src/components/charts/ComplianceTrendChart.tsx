import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";

interface TrendDataPoint {
  cycle: string;
  average: number;
  compliant: number;
  total: number;
}

interface ComplianceTrendChartProps {
  data: TrendDataPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="font-semibold text-slate-700 text-sm mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value.toFixed ? p.value.toFixed(2) : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ComplianceTrendChart({ data, height = 280 }: ComplianceTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis yAxisId="score" domain={[2.5, 5]} tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
        <YAxis yAxisId="count" orientation="right" domain={[0, 54]} tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <ReferenceLine yAxisId="score" y={4.21} stroke="#16a34a" strokeDasharray="4 4" strokeWidth={1.5} />
        <Line
          yAxisId="score"
          type="monotone"
          dataKey="average"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ fill: "#2563eb", r: 4 }}
          name="City Average Score"
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="compliant"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ fill: "#16a34a", r: 4 }}
          strokeDasharray="5 5"
          name="Fully Compliant Barangays"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
