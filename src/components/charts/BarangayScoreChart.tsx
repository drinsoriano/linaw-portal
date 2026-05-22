import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import { getBarColor } from "../../lib/scoring";

interface BarangayScoreData {
  name: string;
  score: number;
  status: string;
}

interface BarangayScoreChartProps {
  data: BarangayScoreData[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="font-semibold text-slate-900 text-sm">{d.name}</p>
        <p className="text-slate-600 text-xs mt-1">
          Score: <span className="font-bold">{d.score.toFixed(2)}</span>
        </p>
        <p className="text-slate-500 text-xs">Status: {d.status}</p>
      </div>
    );
  }
  return null;
};

export function BarangayScoreChart({ data, height = 350 }: BarangayScoreChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: "#64748b" }}
          angle={-45}
          textAnchor="end"
          interval={0}
          height={70}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 11, fill: "#64748b" }}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={4.21}
          stroke="#16a34a"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: "4.21", position: "right", fontSize: 10, fill: "#16a34a" }}
        />
        <ReferenceLine
          y={3.41}
          stroke="#2563eb"
          strokeDasharray="4 4"
          strokeWidth={1}
          label={{ value: "3.41", position: "right", fontSize: 10, fill: "#2563eb" }}
        />
        <Bar dataKey="score" radius={[3, 3, 0, 0]} maxBarSize={16}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={getBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
