import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import { getBarColor } from "../../lib/scoring";

interface IndicatorScore {
  code: string;
  name: string;
  score: number;
}

interface IndicatorBarChartProps {
  data: IndicatorScore[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg max-w-xs">
        <p className="font-semibold text-slate-900 text-xs">{d.code}</p>
        <p className="text-slate-600 text-xs mt-0.5">{d.name}</p>
        <p className="text-slate-800 text-sm font-bold mt-1">{d.score.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function IndicatorBarChart({ data, height = 320 }: IndicatorBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 64, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <YAxis
          dataKey="code"
          type="category"
          tick={{ fontSize: 11, fill: "#475569" }}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          x={4.21}
          stroke="#16a34a"
          strokeDasharray="4 4"
          strokeWidth={1.5}
        />
        <ReferenceLine
          x={3.41}
          stroke="#94a3b8"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <Bar dataKey="score" radius={[0, 3, 3, 0]} maxBarSize={14}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={getBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
